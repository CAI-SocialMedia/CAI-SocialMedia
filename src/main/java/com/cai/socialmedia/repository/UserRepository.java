package com.cai.socialmedia.repository;

import com.cai.socialmedia.dto.PublicUserDTO;
import com.cai.socialmedia.dto.UpdateUserRequestDTO;
import com.cai.socialmedia.enums.SubscriptionType;
import com.cai.socialmedia.exception.ApiException;
import com.cai.socialmedia.model.UserDocument;
import com.cai.socialmedia.util.DateUtil;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class UserRepository {

    private static final String COLLECTION_NAME = "users";
    private final Firestore db = FirestoreClient.getFirestore();
    private static final Logger log = LoggerFactory.getLogger(UserRepository.class);

    public List<UserDocument> getAllActiveUsers() {
        try {
            QuerySnapshot snapshot = db.collection(COLLECTION_NAME)
                    .whereEqualTo("isDeleted", false)
                    .get()
                    .get();

            List<UserDocument> users = new ArrayList<>();
            for (QueryDocumentSnapshot doc : snapshot.getDocuments()) {
                UserDocument user = doc.toObject(UserDocument.class);
                if (user != null) {
                    users.add(user);
                }
            }
            return users;
        } catch (Exception e) {
            throw new ApiException("Aktif kullanıcılar getirilirken hata oluştu: " + e.getMessage());
        }
    }

    public Optional<UserDocument> getUserByUid(String userUid) {
        try {
            var snapshot = db.collection(COLLECTION_NAME).document(userUid).get().get();
            if (!snapshot.exists()) {
                return Optional.empty();
            }

            UserDocument user = snapshot.toObject(UserDocument.class);
            if (user != null && user.getIsDeleted()) {
                throw new ApiException("Hesap zaten silinmiş.");
            }

            return Optional.ofNullable(user);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ApiException("Kullanıcı bulunamadı");
        }
    }


    public void save(UserDocument userDocument) {
        try {
            log.info("Firestore'a kullanıcı kaydediliyor - UID: {}", userDocument.getUid());
            db.collection(COLLECTION_NAME)
                    .document(userDocument.getUid())
                    .set(userDocument, SetOptions.merge())
                    .get(); // İşlemin tamamlanmasını bekle
            log.info("Kullanıcı başarıyla kaydedildi - UID: {}", userDocument.getUid());
        } catch (Exception e) {
            log.error("Kullanıcı kaydedilirken hata oluştu - UID: {}, Hata: {}", userDocument.getUid(), e.getMessage());
            throw new ApiException("Kullanıcı kaydedilirken hata oluştu: " + e.getMessage());
        }
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

    public boolean existsByUsername(String username) {
        try {
            QuerySnapshot snapshot = db.collection(COLLECTION_NAME)
                    .whereEqualTo("username", username)
                    .get()
                    .get();
            return !snapshot.isEmpty();
        } catch (Exception e) {
            log.error("Username kontrolü sırasında hata oluştu: {}", e.getMessage());
            throw new ApiException("Username kontrolü sırasında hata oluştu");
        }
    }

    public Optional<PublicUserDTO> getPublicUserByUid(String uid) {
        try {
            DocumentSnapshot snapshot = db.collection(COLLECTION_NAME)
                    .document(uid)
                    .get()
                    .get();

            if (!snapshot.exists()) {
                log.warn("Firestore'da kullanıcı bulunamadı. UID: {}", uid);
                return Optional.empty();
            }

            UserDocument user = snapshot.toObject(UserDocument.class);

            if (user == null) {
                log.error("Firestore snapshot toObject dönüşü null. UID: {}", uid);
                return Optional.empty();
            }

            if (Boolean.TRUE.equals(user.getIsDeleted())) {
                log.info("Kullanıcı silinmiş durumda. UID: {}", uid);
                return Optional.empty();
            }

            PublicUserDTO publicUser = PublicUserDTO.builder()
                    .displayName(user.getDisplayName())
                    .profilePhotoUid(user.getProfilePhotoUid())
                    .build();

            return Optional.of(publicUser);
        } catch (Exception e) {
            log.error("Kullanıcıyı Firestore'dan çekerken hata oluştu. UID: {}, Hata: {}", uid, e.getMessage(), e);
            return Optional.empty();
        }
    }
}

