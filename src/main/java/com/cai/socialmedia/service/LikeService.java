package com.cai.socialmedia.service;

import com.cai.socialmedia.exception.ApiException;
import com.cai.socialmedia.model.LikeDocument;
import com.cai.socialmedia.repository.LikeRepository;
import com.cai.socialmedia.repository.PostRepository;
import com.cai.socialmedia.util.DateUtil;
import com.google.cloud.Timestamp;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;

    public void likePost(String userUid, String postUid) {
        try {
            if (!postRepository.doesPostExist(postUid)) {
                throw new ApiException("Beğenilecek gönderi bulunamadı");
            }

            Optional<LikeDocument> existingLikeOpt = likeRepository.findByUserUidAndPostUid(userUid, postUid);

            if (existingLikeOpt.isPresent()) {
                LikeDocument existingLike = existingLikeOpt.get();

                if (!Boolean.TRUE.equals(existingLike.getIsDeleted())) {
                    throw new ApiException("Zaten beğenmişsin.");
                }

                likeRepository.restoreLike(existingLike.getId());
            } else {
                LikeDocument like = new LikeDocument();
                like.setUserUid(userUid);
                like.setPostUid(postUid);
                like.setLikedAt(DateUtil.formatTimestamp(Timestamp.now()));
                like.setLikeUid(UUID.randomUUID().toString());
                like.setIsDeleted(false);

                likeRepository.save(like);
            }

            postRepository.incrementLikeCount(postUid);
        } catch (InterruptedException | ExecutionException e) {
            throw new ApiException("Gönderiyi beğenirken bir hata oluştu");
        }
    }

    public void unlikePost(String userUid, String postUid ) {
        try {
            if (!postRepository.doesPostExist(postUid)) {
                throw new ApiException("Beğenisi kaldırılacak gönderi bulunamadı");
            }

            Optional<LikeDocument> existingLikeOpt = likeRepository.findByUserUidAndPostUid(userUid, postUid);
            if (existingLikeOpt.isEmpty() || Boolean.TRUE.equals(existingLikeOpt.get().getIsDeleted())) {
                throw new ApiException("Zaten beğenmemişsin");
            }

            likeRepository.softDeleteLike(existingLikeOpt.get().getId());
            postRepository.decrementLikeCount(postUid);
        } catch (InterruptedException | ExecutionException e) {
            throw new ApiException("Beğeni kaldırılırken hata oluştu");
        }
    }

    public boolean isPostLikedByUser(String userUid, String postUid) {
        try {
            if (!postRepository.doesPostExist(postUid)) {
                throw new ApiException("Beğeni durumu kontrol edilecek gönderi bulunamadı");
            }

            Optional<LikeDocument> existingLikeOpt = likeRepository.findByUserUidAndPostUid(userUid, postUid);

            return existingLikeOpt.isPresent() && Boolean.FALSE.equals(existingLikeOpt.get().getIsDeleted());
        } catch (InterruptedException | ExecutionException e) {
            throw new ApiException("Beğeni durumu kontrol edilirken hata oluştu");
        }
    }

    public long getLikeCount(String postUid) {
        try {
            if (!postRepository.doesPostExist(postUid)) {
                throw new ApiException("Gönderi bulunamadı");
            }

            return likeRepository.countByPostUid(postUid);
        } catch (InterruptedException | ExecutionException e) {
            throw new ApiException("Beğeni durumu kontrol edilirken hata oluştu");
        }
    }
}