package com.cai.socialmedia.controller;

import com.cai.socialmedia.service.LikeService;
import com.cai.socialmedia.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/like")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @PostMapping("like/{postUid}")
    public ResponseEntity<ApiResponse<Void>> likePost(HttpServletRequest request, @PathVariable String postUid) {
        String userUid = (String) request.getAttribute("firebaseUid");
        likeService.likePost(userUid, postUid);
        return ResponseEntity.ok(ApiResponse.success("Beğenildi", null));
    }

    @PostMapping("unlike/{postUid}")
    public ResponseEntity<ApiResponse<Void>> unlikePost(HttpServletRequest request, @PathVariable String postUid) {
        String userUid = (String) request.getAttribute("firebaseUid");
        likeService.unlikePost(userUid, postUid);
        return ResponseEntity.ok(ApiResponse.success("Beğeni kaldırıldı", null));
    }

    @GetMapping("/{postUid}/is-liked")
    public ResponseEntity<ApiResponse<Boolean>> isPostLikedByUser(HttpServletRequest request, @PathVariable String postUid) {
        String userUid = (String) request.getAttribute("firebaseUid");
        boolean isLiked = likeService.isPostLikedByUser(userUid, postUid);
        return ResponseEntity.ok(ApiResponse.success("Beğenilme durumu",isLiked));
    }

    @GetMapping("/{postUid}/count")
    public ResponseEntity<ApiResponse<Long>> getLikeCount(HttpServletRequest request, @PathVariable String postUid) {
        request.getAttribute("firebaseUid");
        long count = likeService.getLikeCount(postUid);
        return ResponseEntity.ok(ApiResponse.success("Post'un beğeni sayısı",count));
    }
}
