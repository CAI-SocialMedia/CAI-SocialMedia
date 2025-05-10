package com.cai.socialmedia.repository;

import com.cai.socialmedia.dto.UpdateUserRequestDTO;
import com.cai.socialmedia.enums.SubscriptionType;
import com.cai.socialmedia.exception.ApiException;
import com.cai.socialmedia.model.UserDocument;
import com.cai.socialmedia.util.DateUtil;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class UserRepository {

    private static final String COLLECTION_NAME = "users";
    private final Firestore db = FirestoreClient.getFirestore();

    public Optional<UserDocument> getUserByUid(String userUid) {
        try {
            var snapshot = db.collection(COLLECTION_NAME).document(userUid).get().get();
            UserDocument user = snapshot.toObject(UserDocument.class);
            if (user == null && user.getIsDeleted()) {
                throw new ApiException("Hesap zaten silinmiş.");
            }

            if (snapshot.exists()) {
                return Optional.of(snapshot.toObject(UserDocument.class));
            } else {
                return Optional.empty();
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new ApiException("Kullanıcı bulunamadı");
        }
    }


    public void save(UserDocument userDocument) {
        db.collection(COLLECTION_NAME)
                .document(userDocument.getUid())
                .set(userDocument, SetOptions.merge());
    }

    public void softDelete(String userUid) {
        db.collection(COLLECTION_NAME).document(userUid)
                .update("isDeleted", true,
                        "updatedAt", DateUtil.formatTimestamp(Timestamp.now()));
    }

    public void updateSubscription(String userUid, SubscriptionType newPlan) {
        try {
            UserDocument user = getUserByUid(userUid)
                    .orElseThrow(() -> new ApiException("Kullanıcı bulunamadı"));

            if (user.getSubscriptionType() == newPlan) {
                throw new ApiException("Zaten bu abonelik planını kullanıyorsunuz.");
            }

            if(newPlan != SubscriptionType.FREE){
                user.setSubscriptionStartDate(DateUtil.formatYearMonthDay());
                user.setSubscriptionEndDate(DateUtil.formatYearMonthDayPlusDays(30));
                user.setDailyQuota(newPlan.getDailyQuota());
                user.setIsPremium(true);
            } else {
                user.setSubscriptionEndDate(null); // FREE plan için süresiz
                user.setSubscriptionStartDate(null);
                user.setIsPremium(false);
            }

            user.setSubscriptionType(newPlan);

            user.setUpdatedAt(DateUtil.formatTimestamp(Timestamp.now()));
            save(user);
        } catch (ApiException e) {
            throw new ApiException("Abonelik türü güncellenirken hata oluştu: " + e.getMessage());
        }
    }



    public void updateUserFields(String userUid, UpdateUserRequestDTO request) {
        try {
            UserDocument user = getUserByUid(userUid)
                    .orElseThrow(() -> new ApiException("Kullanıcı bulunamadı"));

            boolean isModified = false;

            if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
                user.setUsername(request.getUsername());
                isModified = true;
            }

            if (request.getDisplayName() != null && !request.getDisplayName().equals(user.getDisplayName())) {
                user.setDisplayName(request.getDisplayName());
                isModified = true;
            }

            if (request.getProfilePhotoUid() != null && !request.getProfilePhotoUid().equals(user.getProfilePhotoUid())) {
                user.setProfilePhotoUid(request.getProfilePhotoUid());
                isModified = true;
            }

            if (isModified) {
                user.setUpdatedAt(DateUtil.formatTimestamp(Timestamp.now()));
                save(user);
            }

        } catch (Exception e) {
            throw new ApiException("Kullanıcı bilgilerini güncellerken hata oluştu: " + e.getMessage());
        }
    }

}
