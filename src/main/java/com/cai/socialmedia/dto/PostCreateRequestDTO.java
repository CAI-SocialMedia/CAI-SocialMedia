package com.cai.socialmedia.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostCreateRequestDTO {
    private String imageUrl;
    private String prompt;
    private String caption;

    private Boolean isPublic = true;
    private Boolean isDeleted = true;
    private Boolean isLikedByMe = false;
}
