package com.cai.socialmedia.service;

import com.cai.socialmedia.dto.PostResponseDTO;
import com.cai.socialmedia.exception.ApiException;
import com.cai.socialmedia.model.PostDocument;
import com.cai.socialmedia.repository.PostRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ExecutionException;


@Service
@AllArgsConstructor
public class PostService {

    private final PostRepository postRepository;

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

    public void togglePostArchived(String userUid, String postUid) {
        try {
            String ownerUid = postRepository.findUserByPostUid(postUid);
            if (!ownerUid.equals(userUid)) {
                throw new ApiException("Sadece kendi gönderinizi güncelleyebilirsiniz");
            }

            PostDocument post = postRepository.getPostByUid(postUid);
            boolean current = post.getIsArchived() != null && post.getIsArchived();
            postRepository.toggleIsArchived(postUid, !current);
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

    public PostResponseDTO getPostByPostUid(String postUid){
        try {
            PostResponseDTO post = postRepository.getPostByPostUid(postUid);

            if (post == null) {
                throw new ApiException("Gönderi bulunamadı");
            }

            return post;

        } catch (InterruptedException | ExecutionException e) {
            throw new ApiException("Gönderi bilgileri getirilirken hata oluştu: " + e);
        }
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
}
