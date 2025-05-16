package com.cai.socialmedia.model;

import com.google.cloud.firestore.annotation.DocumentId;
import lombok.*;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PostDocument {

    @DocumentId
    private String id;
    private String postUid;
    private String userUid;
    private String imageUrl;
    private String prompt;
    private String caption;
    private Integer likeCount;
    private Integer commentCount;
    private Boolean isPublic;
    private Boolean isDeleted;
    private String createdAt;
    private String updatedAt;
}
