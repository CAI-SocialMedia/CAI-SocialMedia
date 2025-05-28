package com.cai.socialmedia.service;

import com.cai.socialmedia.dto.PostResponseDTO;
import com.cai.socialmedia.exception.ApiException;
import com.cai.socialmedia.model.PostDocument;
import com.cai.socialmedia.model.UserDocument;
import com.cai.socialmedia.repository.LikeRepository;
import com.cai.socialmedia.repository.PostRepository;
import com.cai.socialmedia.repository.UserRepository;
import com.cai.socialmedia.util.SecurityUtil;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;


@Service
@AllArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;

    public void deleteOnePostByUId(String userUid, String postUid) {
        try {
            //1. silinecek post var mı?
            if(!postRepository.doesPostExist(postUid)){
                throw new ApiException("Silinecek gönderi bulunamadı");
            }

            //2. silinecek post senin mi?
            if(!postRepository.findUserByPostUid(postUid).equals(userUid)){
                throw new ApiException("Bu sizin gönderiniz değil");
            }

            postRepository.softDelete(postUid);
        } catch (InterruptedException | ExecutionException e) {
            throw new ApiException("Gönderi silme aşamasında hata oluştu");
        }
    }

    public boolean togglePostArchived(String userUid, String postUid) {
        try {
            String ownerUid = postRepository.findUserByPostUid(postUid);
            if (!ownerUid.equals(userUid)) {
                throw new ApiException("Sadece kendi gönderinizi güncelleyebilirsiniz");
            }

            PostDocument post = postRepository.getPostByUid(postUid);
            boolean current = post.getIsArchived() != null && post.getIsArchived();
            return postRepository.toggleIsArchived(postUid, !current);
        } catch (InterruptedException | ExecutionException e) {
            throw new ApiException("Gönderi güncellenirken hata oluştu: " + e.getMessage());
        }
    }

    public List<PostResponseDTO> getAllPostByUserUid(String targetUserUid) {
        try {

            return postRepository.getAllPostByUserUid(targetUserUid);
        } catch (InterruptedException | ExecutionException e) {
            throw new ApiException("Gönderileri getirme aşamasında hata oluştu");
        }
    }

    public PostResponseDTO getPostByPostUid(String postUid) {
        String currentUserUid = SecurityUtil.getAuthenticatedUidOrThrow();
        return postRepository.getPostByPostUidWithPermission(postUid, currentUserUid);
    }


    public void updateCaption(String userUid, String postUid, String newCaption) {
        try {
            String ownerUid = postRepository.findUserByPostUid(postUid);
            if (!ownerUid.equals(userUid)) {
                throw new ApiException("Sadece kendi gönderinizi güncelleyebilirsiniz.");
            }
            postRepository.updateCaption(postUid, newCaption);
        } catch (InterruptedException | ExecutionException e) {
            throw new ApiException("Gönderi bilgileri getirilirken hata oluştu: " + e);
        }
    }

    public List<PostResponseDTO> getPostsFromFollowings(String userUid) {
        try {
            return postRepository.getPostsFromFollowings(userUid);
        } catch (InterruptedException | ExecutionException e) {
            throw new ApiException("Gönderileri getirme aşamasında hata oluştu");
        }
    }

    public List<PostResponseDTO> getArchivedPosts(String userUid) {
        try {
            return postRepository.getArchivedPosts(userUid);
        } catch (InterruptedException | ExecutionException e) {
            throw new ApiException("Gönderileri getirme aşamasında hata oluştu");
        }
    }

    public List<PostResponseDTO> searchPosts(String query, String currentUserUid) {
        if (query == null || query.trim().isEmpty()) {
            throw new ApiException("Arama sorgusu boş olamaz.");
        }

        try {
            String lowerQuery = query.toLowerCase();
            List<PostDocument> allPosts = postRepository.getAllNonDeletedPosts();

            return allPosts.stream()
                    .map(post -> {
                        Optional<UserDocument> userOpt = userRepository.getUserByUid(post.getUserUid());
                        if (userOpt.isEmpty()) return null;

                        UserDocument user = userOpt.get();

                        boolean matches =
                                matches(post.getPrompt(), lowerQuery) ||
                                        matches(post.getCaption(), lowerQuery) ||
                                        matches(user.getUsername(), lowerQuery) ||
                                        matches(user.getDisplayName(), lowerQuery);

                        if (matches) {
                            return convertToResponseDTO(post, user, currentUserUid);
                        } else {
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

        } catch (InterruptedException | ExecutionException e) {
            Thread.currentThread().interrupt();
            throw new ApiException("Arama sırasında hata oluştu: " + e.getMessage());
        } catch (Exception e) {
            throw new ApiException("Beklenmeyen hata: " + e.getMessage());
        }
    }

    private PostResponseDTO convertToResponseDTO(PostDocument post, UserDocument user, String userUid) {
        boolean isLikedByMe = (userUid != null) && isLikedByMe(post.getPostUid(), userUid);

        return PostResponseDTO.builder()
                .postUid(post.getPostUid())
                .userUid(post.getUserUid())
                .imageUrl(post.getImageUrl())
                .prompt(post.getPrompt())
                .caption(post.getCaption())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .isArchived(post.getIsArchived())
                .isPublic(post.getIsPublic())
                .isLikedByMe(isLikedByMe)
                .createdAt(post.getCreatedAt())
                .displayName(user.getDisplayName())
                .username(user.getUsername())
                .profilePhotoUid(user.getProfilePhotoUid())
                .build();
    }

    private boolean isLikedByMe(String postUid, String userUid) {
        return likeRepository
                .findByUserUidAndPostUid(userUid, postUid)
                .filter(like -> Boolean.FALSE.equals(like.getIsDeleted()))
                .isPresent();
    }


    private boolean matches(String field, String query) {
        return field != null && field.toLowerCase().contains(query);
    }

}
