package com.cai.socialmedia.dto;

import com.google.cloud.firestore.annotation.DocumentId;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

//bunu hiç kullanmıyorsun
public class LikeResponseDTO {
    private String likeUid;
    private String postUid;
    private String userUid;
    private String likedAt;

}
