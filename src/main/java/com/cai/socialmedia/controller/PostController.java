package com.cai.socialmedia.controller;

import com.cai.socialmedia.dto.CaptionUpdateRequestDTO;
import com.cai.socialmedia.dto.PostResponseDTO;
import com.cai.socialmedia.model.PostDocument;
import com.cai.socialmedia.service.PostService;
import com.cai.socialmedia.util.ApiResponse;
import com.cai.socialmedia.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/post")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping("delete/{postUid}")
    public ResponseEntity<ApiResponse<Void>> deleteOnePostByUid(@PathVariable String postUid) {
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
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> togglePost(@RequestParam String postUid) {
        String userUid = SecurityUtil.getAuthenticatedUidOrThrow();
        boolean isArchived = postService.togglePostArchived(userUid, postUid);
        return ResponseEntity.ok(ApiResponse.success("Gönderi durumu güncellendi", Map.of("isArchived", isArchived)));
    }


    @GetMapping("/info/{postUid}")
    public ResponseEntity<ApiResponse<PostResponseDTO>> getOnePostByUid(@PathVariable String postUid) {
        PostResponseDTO post = postService.getPostByPostUid(postUid);
        return ResponseEntity.ok(ApiResponse.success("Gönderi bilgileri getirildi", post));
    }

    @PutMapping("/update-caption")
    public ResponseEntity<ApiResponse<Void>> updateCaption(
            @RequestParam String postUid,
            @RequestBody CaptionUpdateRequestDTO request
    ) {
        String userUid = SecurityUtil.getAuthenticatedUidOrThrow();
        postService.updateCaption(userUid, postUid, request.getCaption());
        return ResponseEntity.ok(ApiResponse.success("Caption güncellendi", null));
    }

    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<List<PostResponseDTO>>> getFeedPosts() {
        String userUid = SecurityUtil.getAuthenticatedUidOrThrow();
        List<PostResponseDTO> posts = postService.getPostsFromFollowings(userUid);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @GetMapping("/get-archived-posts")
    public ResponseEntity<ApiResponse<List<PostResponseDTO>>> getArchivedPosts() {
        String userUid = SecurityUtil.getAuthenticatedUidOrThrow();
        List<PostResponseDTO> posts = postService.getArchivedPosts(userUid);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @PostMapping("/favorite/toggle/{postUid}")
    public ResponseEntity<ApiResponse<Void>> toggleFavorite(@PathVariable String postUid) {
        String userUid = SecurityUtil.getAuthenticatedUidOrThrow();
        postService.toggleFavorite(userUid, postUid);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/favorites")
    public ResponseEntity<ApiResponse<List<PostDocument>>> getFavorites() {
        String userUid = SecurityUtil.getAuthenticatedUidOrThrow();
        List<PostDocument> favorites = postService.getFavorites(userUid);
        return ResponseEntity.ok(ApiResponse.success(favorites));
    }
}