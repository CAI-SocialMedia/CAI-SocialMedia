package com.cai.socialmedia.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponseDTO {
    private String postUid;
    private String userUid;
    private String imageUrl;
    private String prompt;
    private String caption;
    private Integer likeCount;
    private Integer commentCount;
    private Boolean isLikedByMe;
    private Boolean isPublic;
    private Boolean isDeleted;
    private String createdAt;
    private Boolean isArchived;
    private String updatedAt;
}