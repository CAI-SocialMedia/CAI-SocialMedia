package com.cai.socialmedia.service;

import com.cai.socialmedia.dto.PublicUserDTO;
import com.cai.socialmedia.dto.UpdateUserRequestDTO;
import com.cai.socialmedia.dto.UserDTO;
import com.cai.socialmedia.enums.Role;
import com.cai.socialmedia.enums.SubscriptionType;
import com.cai.socialmedia.exception.ApiException;
import com.cai.socialmedia.model.UserDocument;
import com.cai.socialmedia.repository.FollowRepository;
import com.cai.socialmedia.repository.UserRepository;
import com.cai.socialmedia.util.DateUtil;
import com.google.cloud.Timestamp;
import com.google.firebase.auth.FirebaseToken;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Slf4j
@Service
@AllArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final String TODAY = DateUtil.formatYearMonthDay();

    // Kullanıcılara günlik kredi verme islemleri
    @Scheduled(cron = "0 0 0 * * ?")
    public void resetAllUsersDailyQuota() {
        log.info("Günlük kredi yenileme işlemi başlatıldı: {}", LocalDateTime.now());
        try {
            List<UserDocument> users = userRepository.getAllActiveUsers();
            for (UserDocument user : users) {
                if (!TODAY.equals(user.getLastQuotaResetDate())) {
                    user.setCredits(user.getDailyQuota());
                    user.setLastQuotaResetDate(TODAY);
                    user.setUpdatedAt(DateUtil.formatTimestamp(Timestamp.now()));
                    userRepository.save(user);
                }
            }
            log.info("Günlük kredi yenileme işlemi tamamlandı");
        } catch (Exception e) {
            log.error("Kredi yenileme işlemi sırasında hata oluştu: {}", e.getMessage());
        }
    }

    // Kullanıcı Bulma İşlemleri
    public UserDocument getUserByUid(String uid) {
        return userRepository.getUserByUid(uid)
                .orElseThrow(() -> new ApiException("Kullanıcı bulunamadı"));
    }

    public UserDTO getUserDtoByUid(String uid) {
        UserDocument user = getUserByUid(uid);
        return convertToDTO(user);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    // Kullanıcı Oluşturma ve Güncelleme İşlemleri
    public UserDocument createUser(FirebaseToken token, String username) {
        validateNewUser(username);

        UserDocument user = new UserDocument();
        user.setUid(token.getUid());
        user.setEmail(token.getEmail());
        user.setDisplayName(token.getName());
        user.setProfilePhotoUid(token.getPicture());
        user.setUsername(username);
        user.setRole(Role.USER);
        user.setSubscriptionType(SubscriptionType.FREE);
        user.setIsPremium(false);
        user.setDailyQuota(SubscriptionType.FREE.getDailyQuota());
        user.setCredits(SubscriptionType.FREE.getDailyQuota());
        user.setLastQuotaResetDate(TODAY);
        user.setLastSubscriptionUpdateDate(TODAY);
        user.setCreatedAt(DateUtil.formatTimestamp(Timestamp.now()));
        user.setUpdatedAt(DateUtil.formatTimestamp(Timestamp.now()));

        userRepository.save(user);
        return user;
    }

    public UserDocument updateUser(String uid, UpdateUserRequestDTO request) {
        UserDocument user = getUserByUid(uid);
        validateUserUpdate(user, request);

        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            validateNewUsername(request.getUsername());
            user.setUsername(request.getUsername());
        }

        if (request.getDisplayName() != null) {
            user.setDisplayName(request.getDisplayName());
        }

        if (request.getProfilePhotoUid() != null) {
            user.setProfilePhotoUid(request.getProfilePhotoUid());
        }

        user.setUpdatedAt(DateUtil.formatTimestamp(Timestamp.now()));
        userRepository.save(user);
        return user;
    }

    // Abonelik İşlemleri
    public void updateSubscription(String uid, SubscriptionType newPlan) {
        UserDocument user = getUserByUid(uid);

        // 📌 Günde bir kez kontrolü
        String today = DateUtil.formatYearMonthDay(); // yyyy-MM-dd
        if (today.equals(user.getLastSubscriptionUpdateDate())) {
            throw new ApiException("Abonelik planı sadece günde bir kez değiştirilebilir.");
        }

        // 📌 Zaten bu planı kullanıyorsa
        if (user.getSubscriptionType() == newPlan) {
            throw new ApiException("Zaten bu abonelik planını kullanıyorsunuz.");
        }

        // 📌 Plan bilgilerini güncelle
        if (newPlan != SubscriptionType.FREE) {
            user.setSubscriptionStartDate(today);
            user.setSubscriptionEndDate(DateUtil.formatYearMonthDayPlusDays(30));
            user.setIsPremium(true);
        } else {
            user.setSubscriptionStartDate(null);
            user.setSubscriptionEndDate(null);
            user.setIsPremium(false);
        }

        user.setSubscriptionType(newPlan);
        user.setDailyQuota(newPlan.getDailyQuota());
        user.setCredits(newPlan.getDailyQuota());

        // 📌 Son plan değiştirme tarihini güncelle
        user.setLastSubscriptionUpdateDate(today);

        user.setUpdatedAt(DateUtil.formatTimestamp(Timestamp.now()));
        userRepository.save(user);
    }

    // Kredi İşlemleri
    public boolean useCredits(String uid, int amount) {
        UserDocument user = getUserByUid(uid);
        checkAndResetDailyQuota(user);

        if (user.getCredits() < amount) {
            throw new ApiException("Yetersiz kredi. Mevcut krediniz: " + user.getCredits());
        }

        user.setCredits(user.getCredits() - amount);
        user.setUpdatedAt(DateUtil.formatTimestamp(Timestamp.now()));
        userRepository.save(user);
        return true;
    }

    public Integer getCurrentCredits(String uid) {
        UserDocument user = getUserByUid(uid);
        checkAndResetDailyQuota(user);
        return user.getCredits();
    }

    // Yardımcı Metodlar
    private void validateNewUser(String username) {
        if (username == null || !username.matches("^[a-z0-9_]{4,20}$")) {
            throw new ApiException("Geçersiz kullanıcı adı formatı");
        }

        if (existsByUsername(username)) {
            throw new ApiException("Bu kullanıcı adı zaten kullanılıyor");
        }
    }

    private void validateNewUsername(String username) {
        if (!username.matches("^[a-z0-9_]{4,20}$")) {
            throw new ApiException("Geçersiz kullanıcı adı formatı");
        }

        if (existsByUsername(username)) {
            throw new ApiException("Bu kullanıcı adı zaten kullanılıyor");
        }
    }

    private void validateUserUpdate(UserDocument user, UpdateUserRequestDTO request) {
        if (!user.getUid().equals(request.getUid())) {
            throw new ApiException("Sadece kendi hesabınızı güncelleyebilirsiniz.");
        }
    }

    private void checkAndResetDailyQuota(UserDocument user) {
        if (!TODAY.equals(user.getLastQuotaResetDate())) {
            user.setCredits(user.getDailyQuota());
            user.setLastQuotaResetDate(TODAY);
            user.setUpdatedAt(DateUtil.formatTimestamp(Timestamp.now()));
            userRepository.save(user);
        }
    }

    private UserDTO convertToDTO(UserDocument user) {
        return new UserDTO(
                user.getUid(),
                user.getUsername(),
                user.getDisplayName(),
                user.getProfilePhotoUid(),
                user.getCredits(),
                user.getSubscriptionType().name()
        );
    }

    public PublicUserDTO getPublicUserByUid(String userUid) {
        return userRepository.getPublicUserByUid(userUid)
                .orElseThrow(() -> new ApiException("Kullanıcı bulunamadı"));
    }


    public List<PublicUserDTO> searchUsers(String query, String currentUserUid) throws ExecutionException, InterruptedException {
        String lowerQuery = query.toLowerCase();
        List<UserDocument> allUsers = userRepository.getAllActiveUsers();

        return allUsers.stream()
                .filter(user -> !Boolean.TRUE.equals(user.getIsDeleted()))
                .filter(user ->
                        (user.getDisplayName() != null && user.getDisplayName().toLowerCase().contains(lowerQuery)) ||
                                (user.getUsername() != null && user.getUsername().toLowerCase().contains(lowerQuery))
                )
                .map(user -> {
                    boolean isFollowing = followRepository.isUserFollowedBy(currentUserUid, user.getUid());

                    return PublicUserDTO.builder()
                            .userUid(user.getUid())
                            .displayName(user.getDisplayName())
                            .username(user.getUsername())
                            .profilePhotoUid(user.getProfilePhotoUid())
                            .isFollowing(isFollowing)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
