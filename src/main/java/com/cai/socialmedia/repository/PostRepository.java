package com.cai.socialmedia.repository;

import com.cai.socialmedia.dto.PostResponseDTO;
import com.cai.socialmedia.model.PostDocument;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Repository
public class PostRepository {

    private static final String COLLECTION_NAME = "posts";
    private final Firestore db = FirestoreClient.getFirestore();


    public void save(PostDocument postDocument) {
        db.collection(COLLECTION_NAME)
                .document(postDocument.getPostUid())
                .set(postDocument, SetOptions.merge());
    }

    public void softDelete(String postUid) {
        DocumentReference docRef = db.collection(COLLECTION_NAME).document(postUid);
        Map<String, Object> updates = new HashMap<>();
        updates.put("isDeleted", true);

        docRef.update(updates);
    }

    public DocumentSnapshot findPostByUid(String postUid) throws ExecutionException, InterruptedException {
        DocumentReference docRef = db.collection(COLLECTION_NAME).document(postUid);
        DocumentSnapshot snapshot = docRef.get().get();

        // Snapshot zaten DocumentSnapshot nesnesidir
        return snapshot.exists() ? snapshot : null;
    }

    public String findUserByPostUid(String postUid) throws ExecutionException, InterruptedException {
        DocumentReference docRef = db.collection(COLLECTION_NAME).document(postUid);
        DocumentSnapshot snapshot = docRef.get().get();

        if (snapshot.exists()) {
            return snapshot.getString("userUid");
        }

        return null;
    }

    public boolean doesPostExist(String postUid) throws ExecutionException, InterruptedException {
        DocumentReference docRef = db.collection(COLLECTION_NAME).document(postUid);
        DocumentSnapshot snapshot = docRef.get().get();
        return snapshot.exists() && !Boolean.TRUE.equals(snapshot.getBoolean("isDeleted"));
    }

    public List<PostResponseDTO> getAllPostByUserUid(String userUid) throws ExecutionException, InterruptedException {
        List<PostResponseDTO> posts = new ArrayList<>();
        CollectionReference postsRef = db.collection(COLLECTION_NAME);
        ApiFuture<QuerySnapshot> query = postsRef.whereEqualTo("userUid", userUid).get();
        QuerySnapshot querySnapshot = query.get();

        for (DocumentSnapshot document : querySnapshot.getDocuments()) {
            PostResponseDTO post = document.toObject(PostResponseDTO.class);
            if (post != null) {
                posts.add(post);
            }
        }
        return posts;
    }

    public void incrementLikeCount(String postUid) throws ExecutionException, InterruptedException {
        DocumentReference postRef = db.collection(COLLECTION_NAME).document(postUid);
        Map<String, Object> updates = new HashMap<>();
        updates.put("likeCount", FieldValue.increment(1));
        postRef.update(updates).get();
    }

    public void decrementLikeCount(String postUid) throws ExecutionException, InterruptedException {
        DocumentReference postRef = db.collection(COLLECTION_NAME).document(postUid);
        Map<String, Object> updates = new HashMap<>();
        updates.put("likeCount", FieldValue.increment(-1));
        postRef.update(updates).get();
    }
}
