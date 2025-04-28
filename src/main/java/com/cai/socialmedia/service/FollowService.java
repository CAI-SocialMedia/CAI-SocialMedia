package com.cai.socialmedia.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class FollowService {

    private final Firestore db = FirestoreClient.getFirestore();

    public void followUser(String followerUid, String targetUid) {
        if (followerUid.equals(targetUid)) return; // Kişi kendini takip etmesin

        // Follower -> Following listesine ekle
        db.collection("users").document(followerUid)
                .collection("following").document(targetUid).set(new Object());

        // Target -> Follower listesine ekle
        db.collection("users").document(targetUid)
                .collection("followers").document(followerUid).set(new Object());
    }

    public void unfollowUser(String followerUid, String targetUid) {
        db.collection("users").document(followerUid)
                .collection("following").document(targetUid).delete();

        db.collection("users").document(targetUid)
                .collection("followers").document(followerUid).delete();
    }

    public List<String> getFollowers(String requesterUid, String uid) {
        try {
            CollectionReference followersRef = db.collection("users").document(uid).collection("followers");
            ApiFuture<QuerySnapshot> future = followersRef.get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();

            List<String> followers = new ArrayList<>();
            for (QueryDocumentSnapshot doc : documents) {
                followers.add(doc.getId());
            }

            return followers;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Takipçiler alınamadı", e);
        }
    }

    public List<String> getFollowing(String requesterUid, String uid) {
        try {
            CollectionReference followingRef = db.collection("users").document(uid).collection("following");
            ApiFuture<QuerySnapshot> future = followingRef.get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();

            List<String> following = new ArrayList<>();
            for (QueryDocumentSnapshot doc : documents) {
                following.add(doc.getId());
            }

            return following;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Takip edilenler alınamadı", e);
        }
    }
}
