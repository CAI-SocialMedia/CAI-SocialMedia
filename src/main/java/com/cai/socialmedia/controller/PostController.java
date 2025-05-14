package com.cai.socialmedia.controller;

import com.cai.socialmedia.dto.PostCreateRequestDTO;
import com.cai.socialmedia.dto.PostResponseDTO;
import com.cai.socialmedia.service.PostService;
import com.cai.socialmedia.util.ApiResponse;
import com.cai.socialmedia.util.SecurityUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/post")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createPostByUid(@RequestBody PostCreateRequestDTO postCreateRequestDTO) {
        String userUid = SecurityUtil.getAuthenticatedUidOrThrow();
        postService.createPostByUserId(postCreateRequestDTO, userUid);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("delete/{postUid}")
    public ResponseEntity<ApiResponse<Void>> deleteOnePostByUid(HttpServletRequest request, @PathVariable String postUid) {
        String userUid = SecurityUtil.getAuthenticatedUidOrThrow();
        postService.deleteOnePostByUId(userUid, postUid);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/{targetUserUid}")
    public ResponseEntity<ApiResponse<List<PostResponseDTO>>> getAllPostByUserUid(@PathVariable String targetUserUid) {
        SecurityUtil.getAuthenticatedUidOrThrow();
        List<PostResponseDTO> data = postService.getAllPostByUserUid(targetUserUid);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/toggle-post")
    public ResponseEntity<ApiResponse<Void>> togglePost(@RequestParam String postUid) {
        String userUid = SecurityUtil.getAuthenticatedUidOrThrow();
        postService.togglePostDeleted(userUid, postUid);
        return ResponseEntity.ok(ApiResponse.success("Gönderi durumu güncellendi", null));
    }

    @GetMapping("/info/{postUid}")
    public ResponseEntity<ApiResponse<PostResponseDTO>> getOnePostByUid(@PathVariable String postUid) {
        SecurityUtil.getAuthenticatedUidOrThrow();
        PostResponseDTO post = postService.getPostByPostUid(postUid);
        return ResponseEntity.ok(ApiResponse.success("Gönderi bilgileri getirildi", post));
    }

    //geliştirimi sonra yapılacak
    /*@GetMapping("/feed")
    public ResponseEntity<ApiResponse<List<PostResponseDTO>>> getFeedPosts(HttpServletRequest request) {
        String userUid = (String) request.getAttribute("firebaseUid");
        List<PostResponseDTO> posts = postService.getAllPublicPosts(userUid);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }*/
}