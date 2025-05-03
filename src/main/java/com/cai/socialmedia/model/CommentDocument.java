package com.cai.socialmedia.model;

import com.google.cloud.firestore.annotation.DocumentId;
import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CommentDocument {
    @DocumentId
    private String id;
    private String commentUid;
    private String postUid;
    private String userUid;
    private String comment;
    private Boolean isDeleted;

    private String createdAt;
    private String updatedAt;
}
