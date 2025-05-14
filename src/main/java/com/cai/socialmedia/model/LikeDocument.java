package com.cai.socialmedia.model;

import com.google.cloud.firestore.annotation.DocumentId;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LikeDocument {

    @DocumentId
    private String id;
    private String postUid;
    private String userUid;
    private String likeUid;
    private String likedAt;
    private Boolean isDeleted;

}
