package com.cai.socialmedia.service;

import com.cai.socialmedia.dto.PostResponseDTO;
import com.cai.socialmedia.exception.ApiException;
import com.cai.socialmedia.model.PostDocument;
import com.cai.socialmedia.model.UserDocument;
import com.cai.socialmedia.repository.FavoriteRepository;
import com.cai.socialmedia.repository.PostRepository;
import com.cai.socialmedia.repository.UserRepository;
import com.cai.socialmedia.util.SecurityUtil;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;


@Service
@AllArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;

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

    public void toggleFavorite(String userUid, String postUid) {
        try {
            // Post'un var olduğunu kontrol et
            if (!postRepository.doesPostExist(postUid)) {
                throw new ApiException("Post bulunamadı");
            }

            // Favori durumunu kontrol et ve değiştir
            boolean isFavorite = favoriteRepository.isFavorite(userUid, postUid);
            if (isFavorite) {
                favoriteRepository.removeFavorite(userUid, postUid);
            } else {
                favoriteRepository.addFavorite(userUid, postUid);
            }
        } catch (Exception e) {
            throw new ApiException("Favori işlemi sırasında hata oluştu: " + e.getMessage());
        }
    }

    public List<PostDocument> getFavorites(String userUid) {
        try {
            return favoriteRepository.getFavoritesByUser(userUid);
        } catch (Exception e) {
            throw new ApiException("Favoriler alınırken hata oluştu: " + e.getMessage());
        }
    }

        public List<PostResponseDTO> getTopExplorePosts() {
            try {
                List<UserDocument> activeUsers = userRepository.getAllActiveUsers();
                List<PostResponseDTO> topPosts = new ArrayList<>();

                for (UserDocument user : activeUsers) {
                    List<PostResponseDTO> userPosts = postRepository.getAllPostByUserUid(user.getUid());

                    Optional<PostResponseDTO> topLikedPost = userPosts.stream()
                            .filter(post -> !Boolean.TRUE.equals(post.getIsDeleted()))
                            .filter(post -> Boolean.TRUE.equals(post.getIsPublic()))
                            .max(Comparator.comparingInt(post -> post.getLikeCount() != null ? post.getLikeCount() : 0));

                    topLikedPost.ifPresent(post -> {
                        post.setUsername(user.getUsername());
                        post.setProfilePhotoUid(user.getProfilePhotoUid());
                        topPosts.add(post);
                    });
                }

                return topPosts.stream()
                        .sorted(Comparator.<PostResponseDTO>comparingInt(post -> post.getLikeCount() != null ? post.getLikeCount() : 0).reversed())
                        .limit(5)
                        .collect(Collectors.toList());
            } catch (Exception e) {
                throw new ApiException("Keşfet gönderileri hazırlanırken hata oluştu: " + e.getMessage());
            }
        }

    public List<PostResponseDTO> getTopPostsOfTheWeek() {
        try {
            List<UserDocument> activeUsers = userRepository.getAllActiveUsers();
            List<PostResponseDTO> topPosts = new ArrayList<>();

            LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            for (UserDocument user : activeUsers) {
                List<PostResponseDTO> userPosts = postRepository.getAllPostByUserUid(user.getUid());

                Optional<PostResponseDTO> topLikedPost = userPosts.stream()
                        .filter(post -> !Boolean.TRUE.equals(post.getIsDeleted()))
                        .filter(post -> Boolean.TRUE.equals(post.getIsPublic()))
                        .filter(post -> {
                            if (post.getCreatedAt() == null) return false;
                            try {
                                LocalDateTime postDate = LocalDateTime.parse(post.getCreatedAt(), formatter);
                                return postDate.isAfter(sevenDaysAgo);
                            } catch (Exception e) {
                                return false;
                            }
                        })
                        .max(Comparator.comparingInt(post -> post.getLikeCount() != null ? post.getLikeCount() : 0));

                topLikedPost.ifPresent(post -> {
                    post.setUsername(user.getUsername());
                    post.setProfilePhotoUid(user.getProfilePhotoUid());
                    topPosts.add(post);
                });
            }

            return topPosts.stream()
                    .sorted(Comparator.<PostResponseDTO>comparingInt(post -> post.getLikeCount() != null ? post.getLikeCount() : 0).reversed())
                    .limit(5)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            throw new ApiException("Haftanın gönderileri hazırlanırken hata oluştu: " + e.getMessage());
        }
    }
}
