package com.cai.socialmedia.service;

import com.cai.socialmedia.dto.UpdateUserRequestDTO;
import com.cai.socialmedia.enums.Role;
import com.cai.socialmedia.enums.SubscriptionType;
import com.cai.socialmedia.exception.ApiException;
import com.cai.socialmedia.model.UserDocument;
import com.cai.socialmedia.repository.UserRepository;
import com.cai.socialmedia.util.DateUtil;
import com.google.cloud.Timestamp;
import com.google.firebase.auth.FirebaseToken;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@AllArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final String TODAY = DateUtil.formatYearMonthDay();

    // Her gün gece 00:00'da çalışacak zamanlanmış görev
    @Scheduled(cron = "0 0 0 * * ?")
    public void resetAllUsersDailyQuota() {
        log.info("Günlük kredi yenileme işlemi başlatıldı: {}", LocalDateTime.now());
        try {
            List<UserDocument> users = userRepository.getAllActiveUsers();

            
            for (UserDocument user : users) {
                if (!TODAY.equals(user.getLastQuotaResetDate())) {
                    user.setCredits(user.getDailyQuota());
                    user.setLastQuotaResetDate(TODAY);
                    user.setUpdatedAt(LocalDateTime.now().toString());
                    userRepository.save(user);
                    log.info("Kullanıcı kredileri yenilendi - UID: {}, Yeni Kredi: {}", 
                            user.getUid(), user.getDailyQuota());
                }
            }
            log.info("Günlük kredi yenileme işlemi tamamlandı");
        } catch (Exception e) {
            log.error("Kredi yenileme işlemi sırasında hata oluştu: {}", e.getMessage());
        }
    }

    public void updateUserFields(String userUid, UpdateUserRequestDTO request) {
        try {
            UserDocument existingUser = userRepository.getUserByUid(userUid).
                    orElseThrow(() -> new ApiException("Kullanıcı bulunamadı"));

            if(!existingUser.getUid().equals(userUid)) {
                throw new ApiException("Sadece kendi hesabınızı güncelleyebilirsiniz.");
            }

            userRepository.updateUserFields(userUid, request);
        } catch (ApiException e) {
            throw new ApiException("Kullanıcı bilgilerini güncellerken hata oluştu");
        }
    }

    public void softDeleteUser(String userUid) {
        try {
            UserDocument existingUser = userRepository.getUserByUid(userUid).
                    orElseThrow(() -> new ApiException("Kullanıcı bulunamadı"));

            if(!existingUser.getUid().equals(userUid)) {
                throw new ApiException("Sadece kendi hesabınızı güncelleyebilirsiniz.");
            }

            userRepository.softDelete(userUid);
        } catch (ApiException e) {
            throw new ApiException("Hesap silme aşamasında hata oluştu");
        }
    }

    public void updateSubscription(String userUid, SubscriptionType newPlan) {
        try {
            UserDocument existingUser = userRepository.getUserByUid(userUid).
                    orElseThrow(() -> new ApiException("Kullanıcı bulunamadı"));

            if(!existingUser.getUid().equals(userUid)) {
                throw new ApiException("Sadece kendi hesabınızı güncelleyebilirsiniz.");
            }

            userRepository.updateSubscription(userUid, newPlan);
        } catch (ApiException e) {
            throw new ApiException("Abonelik güncelleme aşamasında hata oluştu");
        }
    }

    public UserDocument getOrCreateUser(FirebaseToken token, String username) {
        String uid = token.getUid();
        log.info("getOrCreateUser çağrıldı - UID: {}, Username: {}", uid, username);
        
        // Önce mevcut kullanıcıyı kontrol et
        UserDocument existingUser = userRepository.getUserByUid(uid).orElse(null);
        
        if (existingUser != null) {
            log.info("Mevcut kullanıcı bulundu - UID: {}", uid);
            checkAndResetDailyQuota(existingUser);
            return existingUser;
        }

        log.info("Yeni kullanıcı oluşturuluyor - UID: {}, Username: {}", uid, username);
        // Yeni kullanıcı oluştur
        UserDocument newUser = new UserDocument();
        newUser.setUid(uid);
        newUser.setUsername(username);
        newUser.setEmail(token.getEmail());
        newUser.setDisplayName(username);
        newUser.setProfilePhotoUid((String) token.getClaims().get("picture"));
        newUser.setRole(Role.USER);

        // Varsayılan abonelik ayarları
        SubscriptionType subType = SubscriptionType.FREE;
        newUser.setSubscriptionType(subType);
        newUser.setIsPremium(false);
        newUser.setDailyQuota(subType.getDailyQuota());
        newUser.setCredits(subType.getDailyQuota()); // Başlangıç kredileri
        newUser.setSubscriptionStartDate(null);
        newUser.setSubscriptionEndDate(null);

        // Tarih bilgileri
        newUser.setLastQuotaResetDate(TODAY);
        newUser.setCreatedAt(DateUtil.formatTimestamp(Timestamp.now()));
        newUser.setUpdatedAt(DateUtil.formatTimestamp(Timestamp.now()));

        try {
            userRepository.save(newUser);
            log.info("Yeni kullanıcı başarıyla kaydedildi - UID: {}, Username: {}", uid, username);
        } catch (Exception e) {
            log.error("Kullanıcı kaydedilirken hata oluştu - UID: {}, Username: {}, Hata: {}", uid, username, e.getMessage());
            throw new ApiException("Kullanıcı kaydedilirken hata oluştu: " + e.getMessage());
        }
        
        return newUser;
    }

    private void checkAndResetDailyQuota(UserDocument user) {
        // Eğer son yenileme tarihi bugün değilse, kredileri yenile
        if (!TODAY.equals(user.getLastQuotaResetDate())) {
            user.setCredits(user.getDailyQuota());
            user.setLastQuotaResetDate(TODAY);
            user.setUpdatedAt(LocalDateTime.now().toString());
            userRepository.save(user);
        }
    }

    public boolean useCredits(String userUid, int amount) {
        UserDocument user = userRepository.getUserByUid(userUid)
                .orElseThrow(() -> new ApiException("Kullanıcı bulunamadı"));

        // Kredileri kontrol et ve gerekirse yenile
        checkAndResetDailyQuota(user);

        // Yeterli kredi var mı kontrol et
        if (user.getCredits() < amount) {
            throw new ApiException("Yetersiz kredi. Mevcut krediniz: " + user.getCredits());
        }

        // Kredileri düş
        user.setCredits(user.getCredits() - amount);
        user.setUpdatedAt(LocalDateTime.now().toString());
        userRepository.save(user);
        
        return true;
    }

    public Integer getCurrentCredits(String userUid) {
        UserDocument user = userRepository.getUserByUid(userUid)
                .orElseThrow(() -> new ApiException("Kullanıcı bulunamadı"));
        
        // Kredileri kontrol et ve gerekirse yenile
        checkAndResetDailyQuota(user);
        
        return user.getCredits();
    }
}
