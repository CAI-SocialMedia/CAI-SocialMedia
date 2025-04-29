package com.cai.socialmedia.service;

import com.cai.socialmedia.dto.FollowInfoDTO;
import com.cai.socialmedia.model.UserDocument;
import com.cai.socialmedia.repository.FollowRepository;
import com.google.cloud.firestore.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;

    public void followUser(String followerUid, String targetUid) {
        if (followerUid.equals(targetUid)) {
            throw new IllegalArgumentException("Kendini takip edemezsin.");
        }

        try {
            if (!followRepository.getUser(targetUid).exists()) {
                throw new IllegalArgumentException("Takip edilecek kullanıcı bulunamadı.");
            }

            if (followRepository.getFollowing(followerUid, targetUid).exists()) {
                throw new IllegalStateException("Zaten takip ediyorsun.");
            }

            Map<String, Object> data = new HashMap<>();
            data.put("followedAt", FieldValue.serverTimestamp());

            followRepository.saveFollowing(followerUid, targetUid, data);
            followRepository.saveFollower(targetUid, followerUid, data);

        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Takip işlemi sırasında hata oluştu", e);
        }
    }

    public void unfollowUser(String followerUid, String targetUid) {
        try {
            if (!followRepository.getFollowing(followerUid, targetUid).exists()) {
                throw new IllegalStateException("Bu kullanıcıyı zaten takip etmiyorsun.");
            }

            followRepository.deleteFollowing(followerUid, targetUid);
            followRepository.deleteFollower(targetUid, followerUid);

        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Takipten çıkarma işlemi sırasında hata oluştu", e);
        }
    }

    public List<FollowInfoDTO> getFollowers(String uid) {
        try {
            List<String> followerIds = followRepository.getFollowerIds(uid);
            List<FollowInfoDTO> followers = new ArrayList<>();
            for (String followerUid : followerIds) {
                DocumentSnapshot snapshot = followRepository.getUser(followerUid);
                if (snapshot.exists()) {
                    UserDocument user = snapshot.toObject(UserDocument.class);
                    followers.add(new FollowInfoDTO(user.getUid(), user.getUsername()));
                }
            }
            return followers;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Takipçiler alınamadı", e);
        }
    }

    public List<FollowInfoDTO> getFollowing(String uid) {
        try {
            List<String> followingIds = followRepository.getFollowingIds(uid);
            List<FollowInfoDTO> following = new ArrayList<>();
            for (String followingUid : followingIds) {
                DocumentSnapshot snapshot = followRepository.getUser(followingUid);
                if (snapshot.exists()) {
                    UserDocument user = snapshot.toObject(UserDocument.class);
                    following.add(new FollowInfoDTO(user.getUid(), user.getUsername()));
                }
            }
            return following;
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Takip edilenler alınamadı", e);
        }
    }
}
