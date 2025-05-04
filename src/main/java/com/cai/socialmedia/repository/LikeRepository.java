package com.cai.socialmedia.repository;
import com.cai.socialmedia.model.LikeDocument;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Repository;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Repository
public class LikeRepository {

    private static final String COLLECTION_NAME = "likes";
    private final Firestore db = FirestoreClient.getFirestore();

    public void save(LikeDocument likeDocument) {
        db.collection(COLLECTION_NAME)
                .document(likeDocument.getLikeUid())
                .set(likeDocument, SetOptions.merge());
    }

    public Optional<LikeDocument> findByUserUidAndPostUid(String userUid, String postUid) {
        try {
            Query query = db.collection(COLLECTION_NAME)
                    .whereEqualTo("userUid", userUid)
                    .whereEqualTo("postUid", postUid);

            ApiFuture<QuerySnapshot> future = query.get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();

            if (!documents.isEmpty()) {
                return Optional.of(documents.get(0).toObject(LikeDocument.class));
            }
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }

    public List<LikeDocument> findByPostUid(String postUid) {
        List<LikeDocument> likeList = new ArrayList<>();
        try {
            Query query = db.collection(COLLECTION_NAME)
                    .whereEqualTo("postUid", postUid)
                    .whereEqualTo("isDeleted", false);

            ApiFuture<QuerySnapshot> future = query.get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();

            for (DocumentSnapshot doc : documents) {
                likeList.add(doc.toObject(LikeDocument.class));
            }
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }
        return likeList;
    }

    public long countByPostUid(String postUid) {
        return findByPostUid(postUid).size();
    }

    public void restoreLike(String likeId) throws ExecutionException, InterruptedException {
        DocumentReference docRef = db.collection(COLLECTION_NAME).document(likeId);
        Map<String, Object> updates = new HashMap<>();
        updates.put("isDeleted", false);
        docRef.update(updates).get();
    }

    public void softDeleteLike(String likeId) throws ExecutionException, InterruptedException {
        DocumentReference docRef = db.collection(COLLECTION_NAME).document(likeId);
        Map<String, Object> updates = new HashMap<>();
        updates.put("isDeleted", true);
        docRef.update(updates).get();
    }
}
