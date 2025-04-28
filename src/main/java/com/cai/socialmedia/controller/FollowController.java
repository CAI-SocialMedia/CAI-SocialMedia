package com.cai.socialmedia.controller;

import com.cai.socialmedia.service.FollowService;
import com.google.firebase.auth.FirebaseToken;
import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/follow")
public class FollowController {

    @Autowired
    private FollowService followService;


    @PostMapping("/{targerUid}")
    public ResponseEntity<String> follow (@AuthenticationPrincipal FirebaseToken token, @PathVariable String targetUid){
        followService.followUser(token.getUid(), targetUid);
        return ResponseEntity.ok("Takip edildi.");
    }


    @DeleteMapping("/{targetUid}")
    public ResponseEntity<String> unfollow (@AuthenticationPrincipal FirebaseToken token, @PathVariable String targetUid){
        followService.unfollowUser(token.getUid(), targetUid);
        return ResponseEntity.ok("Takipten çıkıldı.");
    }


    @GetMapping("/follower/{uid}")
    public ResponseEntity<List<String>> getFollowersList (@AuthenticationPrincipal FirebaseToken token, @PathVariable String uid){
        List<String> followers=followService.getFollowers(token.getUid(), uid);
        return ResponseEntity.ok(followers);
    }


    @GetMapping("/following/{uid}")
    public ResponseEntity<List<String>> getFollowingList(@AuthenticationPrincipal FirebaseToken token, @PathVariable String uid){
        List<String> following=followService.getFollowing(token.getUid(), uid);
        return ResponseEntity.ok(following);
    }
}
