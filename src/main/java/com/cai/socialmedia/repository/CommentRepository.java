package com.cai.socialmedia.repository;

import com.cai.socialmedia.dto.CommentResponseDTO;
import com.cai.socialmedia.exception.ApiException;
import com.cai.socialmedia.model.CommentDocument;
import com.cai.socialmedia.util.DateUtil;
import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ExecutionException;

@Repository
public class CommentRepository {

    private static final String COLLECTION_NAME = "comments";
    private final Firestore db = FirestoreClient.getFirestore();

    public void save(CommentDocument commentDocument) {
        db.collection(COLLECTION_NAME)
                .document(commentDocument.getCommentUid())
                .set(commentDocument, SetOptions.merge());
    }

    public List<CommentResponseDTO> findByPostUid(String postUid) {
        List<CommentResponseDTO> comments = new ArrayList<>();
        try {
            CollectionReference commentsRef = db.collection(COLLECTION_NAME);
            ApiFuture<QuerySnapshot> query = commentsRef
                    .whereEqualTo("postUid", postUid)
                    .whereEqualTo("isDeleted", false)
                    .get();
            QuerySnapshot querySnapshot = query.get();
            for (DocumentSnapshot document : querySnapshot.getDocuments()) {
                CommentResponseDTO comment = document.toObject(CommentResponseDTO.class);
                if (comment != null) {
                    comments.add(comment);
                }
            }
        } catch (InterruptedException | ExecutionException e) {
            throw new ApiException("Yorumlar alınırken hata oluştu: " + e.getMessage());
        }
        return comments;
    }

    public Optional<CommentDocument> findById(String commentUid) {
        try {
            var snapshot = db.collection(COLLECTION_NAME).document(commentUid).get().get();
            if (snapshot.exists()) {
                return Optional.of(snapshot.toObject(CommentDocument.class));
            } else {
                return Optional.empty();
            }
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Yorum bulunamadı", e);
        }
    }

    public void softDelete(String commentUid) {
        db.collection(COLLECTION_NAME).document(commentUid)
                .update("isDeleted", true, "updatedAt", DateUtil.formatTimestamp(Timestamp.now()));
    }

    public void updateComment(String commentUid, String newComment) {
        try {
            db.runTransaction(transaction -> {
                DocumentReference docRef = db.collection(COLLECTION_NAME).document(commentUid);
                DocumentSnapshot snapshot = transaction.get(docRef).get();

                if (!snapshot.exists()) {
                    throw new ApiException("Yorum bulunamadı.");
                }

                Boolean isDeleted = snapshot.getBoolean("isDeleted");
                if (Boolean.TRUE.equals(isDeleted)) {
                    throw new ApiException("Yorum silinmiş.");
                }

                transaction.update(docRef, Map.of(
                        "comment", newComment,
                        "updatedAt", DateUtil.formatTimestamp(Timestamp.now())
                ));

                return null;
            }).get(); // <-- burada transaction'ın sonucu beklenmeli
        } catch (Exception e) {
            // Eğer fırlatılan hata ApiException ise direkt ileri gönder
            if (e.getCause() instanceof ApiException apiEx) {
                throw apiEx;
            }
            // değilse genel hata döndür
            throw new ApiException("Yorum güncelleme işlemi başarısız: " + e.getMessage());
        }
    }
}