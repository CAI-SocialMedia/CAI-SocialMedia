package com.cai.socialmedia.controller;

import com.cai.socialmedia.dto.PostCreateRequestDTO;
import com.cai.socialmedia.dto.PostResponseDTO;
import com.cai.socialmedia.service.PostService;
import com.cai.socialmedia.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/post")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createPostByUid(HttpServletRequest request, @RequestBody PostCreateRequestDTO postCreateRequestDTO) {
        String userUid = (String) request.getAttribute("firebaseUid");
        postService.createPostByUserId(postCreateRequestDTO, userUid);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("delete/{postUid}")
    public ResponseEntity<ApiResponse<Void>> deleteOnePostByUid(HttpServletRequest request, @PathVariable String postUid) {
        String userUid = (String) request.getAttribute("firebaseUid");
        postService.deleteOnePostByUId(userUid, postUid);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/{targetUserUid}")
    public ResponseEntity<ApiResponse<List<PostResponseDTO>>> getAllPostByUserUid(HttpServletRequest request, @PathVariable String targetUserUid) {
        request.getAttribute("firebaseUid");
        List<PostResponseDTO> data = postService.getAllPostByUserUid(targetUserUid);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    //geliştirimi sonra yapılacak
    /*@GetMapping("/feed")
    public ResponseEntity<ApiResponse<List<PostResponseDTO>>> getFeedPosts(HttpServletRequest request) {
        String userUid = (String) request.getAttribute("firebaseUid");
        List<PostResponseDTO> posts = postService.getAllPublicPosts(userUid);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }*/
}