package com.cai.socialmedia.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicUserDTO {
    private String userUid;
    private String displayName;
    private String username;
    private String profilePhotoUid;
    private boolean isFollowing;
}

