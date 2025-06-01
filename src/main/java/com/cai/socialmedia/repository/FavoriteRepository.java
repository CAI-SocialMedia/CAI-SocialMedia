package com.cai.socialmedia.repository;

import com.cai.socialmedia.model.FavoriteDocument;
import com.cai.socialmedia.util.DateUtil;
import com.cai.socialmedia.model.PostDocument;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

@Repository
@RequiredArgsConstructor
public class FavoriteRepository {
    private static final String COLLECTION_NAME = "favorites";
    private final Firestore db = FirestoreClient.getFirestore();
    private final PostRepository postRepository; // PostRepository enjekte edilmeli

    public void addFavorite(String userUid, String postUid) {
        FavoriteDocument favorite = new FavoriteDocument();
        favorite.setId(UUID.randomUUID().toString()); // ID manuel set edilmeli
        favorite.setUserUid(userUid);
        favorite.setPostUid(postUid);
        favorite.setCreatedAt(DateUtil.formatTimestamp(Timestamp.now()));

        db.collection(COLLECTION_NAME)
                .document(favorite.getId())
                .set(favorite);
    }

    public void removeFavorite(String userUid, String postUid) throws ExecutionException, InterruptedException {
        Query query = db.collection(COLLECTION_NAME)
                .whereEqualTo("userUid", userUid)
                .whereEqualTo("postUid", postUid);

        QuerySnapshot snapshot = query.get().get();
        for (DocumentSnapshot doc : snapshot.getDocuments()) {
            doc.getReference().delete();
        }
    }

    public boolean isFavorite(String userUid, String postUid) throws ExecutionException, InterruptedException {
        Query query = db.collection(COLLECTION_NAME)
                .whereEqualTo("userUid", userUid)
                .whereEqualTo("postUid", postUid);

        return !query.get().get().isEmpty();
    }

    public List<PostDocument> getFavoritesByUser(String userUid) throws ExecutionException, InterruptedException {
        List<PostDocument> favorites = new ArrayList<>();
        Query query = db.collection(COLLECTION_NAME)
                .whereEqualTo("userUid", userUid)
                .orderBy("createdAt", Query.Direction.DESCENDING);

        QuerySnapshot snapshot = query.get().get();
        for (DocumentSnapshot doc : snapshot.getDocuments()) {
            String postUid = doc.getString("postUid");
            PostDocument post = postRepository.getPostByUid(postUid);
            if (post != null && !Boolean.TRUE.equals(post.getIsDeleted())) {
                favorites.add(post);
            }
        }
        return favorites;
    }
}
