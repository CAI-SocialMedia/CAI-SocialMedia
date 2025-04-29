package com.cai.socialmedia.controller;

import com.cai.socialmedia.dto.FollowInfoDTO;
import com.cai.socialmedia.util.ApiResponse;
import com.cai.socialmedia.service.FollowService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/follow")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    @PostMapping("/{targetUid}")
    public ResponseEntity<ApiResponse<Void>> follow(HttpServletRequest request, @PathVariable String targetUid) {
        String followerUid = (String) request.getAttribute("firebaseUid");
        followService.followUser(followerUid, targetUid);
        return ResponseEntity.ok(ApiResponse.success("Takip edildi.", null));
    }

    @DeleteMapping("/{targetUid}")
    public ResponseEntity<ApiResponse<Void>> unfollow(HttpServletRequest request, @PathVariable String targetUid) {
        String followerUid = (String) request.getAttribute("firebaseUid");
        followService.unfollowUser(followerUid, targetUid);
        return ResponseEntity.ok(ApiResponse.success("Takipten çıkıldı.", null));
    }

    @GetMapping("/followers/{uid}")
    public ResponseEntity<ApiResponse<List<FollowInfoDTO>>> getFollowersList(HttpServletRequest request, @PathVariable String uid) {
        request.getAttribute("firebaseUid");
        List<FollowInfoDTO> followers = followService.getFollowers(uid);
        return ResponseEntity.ok(ApiResponse.success(followers));
    }

    @GetMapping("/following/{uid}")
    public ResponseEntity<ApiResponse<List<FollowInfoDTO>>> getFollowingList(HttpServletRequest request, @PathVariable String uid) {
        request.getAttribute("firebaseUid");
        List<FollowInfoDTO> following = followService.getFollowing(uid);
        return ResponseEntity.ok(ApiResponse.success(following));
    }

}
