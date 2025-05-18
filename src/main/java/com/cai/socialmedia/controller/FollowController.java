package com.cai.socialmedia.controller;

import com.cai.socialmedia.dto.FollowInfoDTO;
import com.cai.socialmedia.util.ApiResponse;
import com.cai.socialmedia.service.FollowService;
import com.cai.socialmedia.util.SecurityUtil;
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
    public ResponseEntity<ApiResponse<Void>> follow( @PathVariable String targetUid) {
        String followerUid = SecurityUtil.getAuthenticatedUidOrThrow();
        followService.followUser(followerUid, targetUid);
        return ResponseEntity.ok(ApiResponse.success("Takip edildi.", null));
    }

    @DeleteMapping("/{targetUid}")
    public ResponseEntity<ApiResponse<Void>> unfollow( @PathVariable String targetUid) {
        String followerUid = SecurityUtil.getAuthenticatedUidOrThrow();
        followService.unfollowUser(followerUid, targetUid);
        return ResponseEntity.ok(ApiResponse.success("Takipten çıkıldı.", null));
    }

    @GetMapping("/followers/{userUid}")
    public ResponseEntity<ApiResponse<List<FollowInfoDTO>>> getFollowersList( @PathVariable String userUid) {
         SecurityUtil.getAuthenticatedUidOrThrow();
        List<FollowInfoDTO> followers = followService.getFollowers(userUid);
        return ResponseEntity.ok(ApiResponse.success(followers));
    }

    @GetMapping("/following/{userUid}")
    public ResponseEntity<ApiResponse<List<FollowInfoDTO>>> getFollowingList( @PathVariable String userUid) {
        SecurityUtil.getAuthenticatedUidOrThrow();
        List<FollowInfoDTO> following = followService.getFollowing(userUid);
        return ResponseEntity.ok(ApiResponse.success(following));
    }

}
