package com.cai.socialmedia.model;
import com.google.cloud.firestore.annotation.DocumentId;
import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FavoriteDocument {
    @DocumentId
    private String id;
    private String userUid;
    private String postUid;
    private String createdAt;
}
