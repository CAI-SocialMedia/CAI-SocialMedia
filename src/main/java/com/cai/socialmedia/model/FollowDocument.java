package com.cai.socialmedia.model;

import com.google.cloud.Timestamp;
import lombok.Data;
import lombok.Getter;

@Getter
@Data
public class FollowDocument {
    private String followerUid;
    private String followingUid;
    private Timestamp followedAt;
}
