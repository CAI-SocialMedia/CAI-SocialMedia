package com.cai.socialmedia.service;

import com.cai.socialmedia.dto.PostCreateRequestDTO;
import com.cai.socialmedia.dto.PostResponseDTO;
import com.cai.socialmedia.exception.ApiException;
import com.cai.socialmedia.model.PostDocument;
import com.cai.socialmedia.repository.PostRepository;
import com.cai.socialmedia.util.DateUtil;
import com.google.cloud.Timestamp;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutionException;


@Service
@AllArgsConstructor
public class PostService {

    private final PostRepository postRepository;

    public void createPostByUserId(PostCreateRequestDTO postCreateRequestDTO,String userUid) {
        PostDocument post = new PostDocument();

        post.setUserUid(userUid);
        post.setPostUid(UUID.randomUUID().toString());
        post.setImageUrl(postCreateRequestDTO.getImageUrl());
        post.setPrompt(postCreateRequestDTO.getPrompt());
        post.setCaption(postCreateRequestDTO.getCaption());
        post.setIsPublic(postCreateRequestDTO.getIsPublic());
        post.setCreatedAt(DateUtil.formatTimestamp(Timestamp.now()));

        postRepository.save(post);
    }

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

    public List<PostResponseDTO> getAllPostByUserUid(String targetUserUid) {
        try {
            //TODO: burası sonra geliştirilecek
            return postRepository.getAllPostByUserUid(targetUserUid);
        } catch (InterruptedException | ExecutionException e) {
            throw new ApiException("Gönderileri getirme aşamasında hata oluştu");
        }
    }
}
