package com.cai.socialmedia.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Repository
public class FollowRepository {

    private final Firestore db = FirestoreClient.getFirestore();

    public DocumentSnapshot getUser(String uid) throws ExecutionException, InterruptedException {
        return db.collection("users").document(uid).get().get();
    }

    public DocumentSnapshot getFollowing(String followerUid, String targetUid) throws ExecutionException, InterruptedException {
        return db.collection("users").document(followerUid)
                .collection("following").document(targetUid).get().get();
    }

    public void saveFollowing(String followerUid, String targetUid, Map<String, Object> data) {
        db.collection("users").document(followerUid)
                .collection("following").document(targetUid).set(data, SetOptions.merge());
    }

    public void saveFollower(String targetUid, String followerUid, Map<String, Object> data) {
        db.collection("users").document(targetUid)
                .collection("followers").document(followerUid).set(data, SetOptions.merge());
    }

    public void deleteFollowing(String followerUid, String targetUid) {
        db.collection("users").document(followerUid)
                .collection("following").document(targetUid).delete();
    }

    public void deleteFollower(String targetUid, String followerUid) {
        db.collection("users").document(targetUid)
                .collection("followers").document(followerUid).delete();
    }

    public List<String> getFollowerIds(String uid) throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = db.collection("users").document(uid).collection("followers").get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        List<String> ids = new ArrayList<>();
        for (QueryDocumentSnapshot doc : documents) {
            ids.add(doc.getId());
        }
        return ids;
    }

    public List<String> getFollowingIds(String uid) throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = db.collection("users").document(uid).collection("following").get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        List<String> ids = new ArrayList<>();
        for (QueryDocumentSnapshot doc : documents) {
            ids.add(doc.getId());
        }
        return ids;
    }
}

