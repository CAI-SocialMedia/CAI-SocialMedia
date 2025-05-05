package com.cai.socialmedia.service;

import com.cai.socialmedia.enums.Role;
import com.cai.socialmedia.enums.SubscriptionType;
import com.cai.socialmedia.model.UserDocument;

import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.cloud.FirestoreClient;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.concurrent.ExecutionException;

@Service
public class UserService {

    public UserDocument getOrCreateUser(FirebaseToken token) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        String uid = token.getUid();
        DocumentReference docRef = db.collection("users").document(uid);

        try {
            System.out.println("Kullanıcı dokümanı çekiliyor: " + uid);
            DocumentSnapshot snapshot = docRef.get().get();
            System.out.println("Snapshot çekildi. Varlık durumu: " + snapshot.exists());

            if (snapshot.exists()) {
                UserDocument user = snapshot.toObject(UserDocument.class);
                System.out.println("Firestore'dan gelen kullanıcı: " + user);
                return user;
            }

            UserDocument newUser = new UserDocument();
            newUser.setUid(uid);
            newUser.setUsername(token.getName() != null ? token.getName() : uid);
            newUser.setEmail(token.getEmail());
            newUser.setDisplayName((String) token.getClaims().getOrDefault("name", uid));
            newUser.setProfilePhotoUid((String) token.getClaims().getOrDefault("picture", null));
            newUser.setRole(Role.USER);

            SubscriptionType subType = SubscriptionType.FREE;
            newUser.setSubscriptionType(subType);
            newUser.setIsPremium(false);
            newUser.setDailyQuota(subType.getDailyQuota());
            newUser.setSubscriptionStartDate(LocalDate.now().toString());
            newUser.setSubscriptionEndDate(null);
            newUser.setLastQuotaResetDate(LocalDate.now().toString());
            newUser.setCreatedAt(LocalDateTime.now().toString());

            System.out.println("Yeni kullanıcı Firestore'a yazılıyor: " + uid);
            docRef.set(newUser);
            return newUser;

        } catch (Exception e) {
            System.out.println("🔥 Firestore erişiminde hata oluştu: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
