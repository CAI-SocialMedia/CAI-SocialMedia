package com.cai.socialmedia.repository;

import com.cai.socialmedia.dto.PostResponseDTO;

import com.cai.socialmedia.util.SecurityUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.cai.socialmedia.exception.ApiException;
import com.cai.socialmedia.model.PostDocument;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Repository

public class PostRepository {

    private static final String COLLECTION_NAME = "posts";
    private final Firestore db = FirestoreClient.getFirestore();
    private static final Logger log = LoggerFactory.getLogger(PostRepository.class);
    private final LikeRepository likeRepository;
    private final FollowRepository followRepository;

    public PostRepository(LikeRepository likeRepository, FollowRepository followRepository) {
        this.likeRepository = likeRepository;
        this.followRepository = followRepository;
    }

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
        ApiFuture<QuerySnapshot> query = postsRef
                .whereEqualTo("userUid", userUid)
                .whereEqualTo("isDeleted", false)
                .whereEqualTo("isArchived", false)
                .get();
        QuerySnapshot querySnapshot = query.get();

        for (DocumentSnapshot document : querySnapshot.getDocuments()) {
            try {
                PostResponseDTO post = document.toObject(PostResponseDTO.class);
                if (post != null) {
                    posts.add(post);
                }
            } catch (Exception e) {
                log.warn("Post parse edilemedi. UID: {}", document.getId(), e);
            }
        }
        return posts;
    }

    public PostDocument getPostByUid(String postUid) throws ExecutionException, InterruptedException {
        DocumentReference docRef = db.collection(COLLECTION_NAME).document(postUid);
        DocumentSnapshot snapshot = docRef.get().get();

        if (!snapshot.exists()) {
            throw new ApiException("Belirtilen post bulunamadı");
        }

        return snapshot.toObject(PostDocument.class);
    }


    public void toggleIsArchived(String postUid, boolean newValue) {
        DocumentReference docRef = db.collection(COLLECTION_NAME).document(postUid);
        Map<String, Object> updates = new HashMap<>();
        updates.put("isArchived", newValue);
        docRef.update(updates);
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

    public void incrementCommentCount(String postUid) throws ExecutionException, InterruptedException {
        DocumentReference postRef = db.collection(COLLECTION_NAME).document(postUid);
        Map<String, Object> updates = new HashMap<>();
        updates.put("commentCount", FieldValue.increment(1));
        postRef.update(updates).get();
    }

    public void decrementCommentCount(String postUid) throws ExecutionException, InterruptedException{
        DocumentReference postRef = db.collection(COLLECTION_NAME).document(postUid);
        Map<String, Object> updates = new HashMap<>();
        updates.put("commentCount", FieldValue.increment(-1));
        postRef.update(updates).get();
    }

    public PostResponseDTO getPostByPostUid(String postUid) throws ExecutionException, InterruptedException {
        DocumentReference docRef = db.collection(COLLECTION_NAME).document(postUid);
        DocumentSnapshot snapshot = docRef.get().get();

        if (!snapshot.exists()) {
            log.warn("Post bulunamadı. UID: {}", postUid);
            return null;
        }

        PostDocument postRequest = snapshot.toObject(PostDocument.class);

        if (Boolean.TRUE.equals(postRequest.getIsDeleted())) {
            log.info("Post silinmiş durumda. UID: {}", postUid);
            return null;
        }

        return PostResponseDTO.builder()
                .postUid(postRequest.getPostUid())
                .userUid(postRequest.getUserUid())
                .imageUrl(postRequest.getImageUrl())
                .prompt(postRequest.getPrompt())
                .caption(postRequest.getCaption())
                .likeCount(postRequest.getLikeCount())
                .commentCount(postRequest.getCommentCount())
                .isLikedByMe(isLikedByMe(postUid))
                .isPublic(postRequest.getIsPublic())
                .createdAt(postRequest.getCreatedAt())
                .build();

    }

    public void updateCaption(String postUid, String caption) {
        DocumentReference docRef = db.collection(COLLECTION_NAME).document(postUid);
        Map<String, Object> updates = new HashMap<>();
        updates.put("caption", caption);
        docRef.update(updates);
    }

    public List<PostResponseDTO> getPostsFromFollowings(String userUid) throws ExecutionException, InterruptedException {
        List<PostResponseDTO> posts = new ArrayList<>();
        CollectionReference postsRef = db.collection(COLLECTION_NAME);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        List<String> followingUids = followRepository.getFollowingIds(userUid);
        if (followingUids.isEmpty()) return posts;

        List<List<String>> partitions = partitionList(followingUids, 10);

        for (List<String> uidGroup : partitions) {
            ApiFuture<QuerySnapshot> query = postsRef
                    .whereIn("userUid", uidGroup)
                    .whereEqualTo("isDeleted", false)
                    .whereEqualTo("isArchived", false)
                    .get(); // Firestore'da orderBy + whereIn uyumsuz olabilir, Java'da sıralarız

            QuerySnapshot querySnapshot = query.get();
            for (QueryDocumentSnapshot doc : querySnapshot.getDocuments()) {
                PostDocument post = doc.toObject(PostDocument.class);

                PostResponseDTO dto = PostResponseDTO.builder()
                        .postUid(post.getPostUid())
                        .userUid(post.getUserUid())
                        .imageUrl(post.getImageUrl())
                        .prompt(post.getPrompt())
                        .caption(post.getCaption())
                        .likeCount(post.getLikeCount())
                        .commentCount(post.getCommentCount())
                        .isLikedByMe(isLikedByMe(post.getPostUid()))
                        .isPublic(post.getIsPublic())
                        .createdAt(post.getCreatedAt())
                        .isDeleted(post.getIsDeleted())
                        .build();

                posts.add(dto);
            }
        }

            posts.sort((a, b) -> {
            LocalDateTime dateA = LocalDateTime.parse(a.getCreatedAt(), formatter);
            LocalDateTime dateB = LocalDateTime.parse(b.getCreatedAt(), formatter);
            return dateB.compareTo(dateA);
        });

        return posts;
    }


    private List<List<String>> partitionList(List<String> list, int size) {
        List<List<String>> partitions = new ArrayList<>();
        for (int i = 0; i < list.size(); i += size) {
            partitions.add(list.subList(i, Math.min(i + size, list.size())));
        }
        return partitions;
    }

    private boolean isLikedByMe(String postUid){
        String currentUserUid = SecurityUtil.getAuthenticatedUidOrThrow();

        return likeRepository
                .findByUserUidAndPostUid(currentUserUid, postUid)
                .filter(like -> Boolean.FALSE.equals(like.getIsDeleted()))
                .isPresent();
    }
}
