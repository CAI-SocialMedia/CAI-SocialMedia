package com.cai.socialmedia.service;

import com.cai.socialmedia.dto.UpdateUserRequestDTO;
import com.cai.socialmedia.enums.Role;
import com.cai.socialmedia.enums.SubscriptionType;
import com.cai.socialmedia.exception.ApiException;
import com.cai.socialmedia.model.UserDocument;
import com.cai.socialmedia.repository.UserRepository;
import com.google.firebase.auth.FirebaseToken;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class UserService {

    private final UserRepository userRepository;

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


    //TODO: SONRASINDA DEĞİŞTİRİLMELİ
    public UserDocument getOrCreateUser(FirebaseToken token) {
        String uid = token.getUid();

        UserDocument newUser = new UserDocument();
        newUser.setUid(uid);
        newUser.setUsername(token.getName());
        newUser.setEmail(token.getEmail());
        newUser.setDisplayName((String) token.getClaims().get("name"));
        newUser.setProfilePhotoUid((String) token.getClaims().get("picture"));
        newUser.setRole(Role.USER);

        SubscriptionType subType = SubscriptionType.FREE;
        newUser.setSubscriptionType(subType);
        newUser.setIsPremium(false);
        newUser.setDailyQuota(subType.getDailyQuota());
        newUser.setSubscriptionStartDate(null);
        newUser.setSubscriptionEndDate(null);

        newUser.setLastQuotaResetDate(LocalDate.now().toString());
        newUser.setCreatedAt(LocalDateTime.now().toString());

        userRepository.save(newUser);
        return newUser;
    }
}
