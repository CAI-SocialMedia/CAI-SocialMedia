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
    private String postUid;     // Beğenilen postun UID'si
    private String userUid;     // Beğeniyi yapan kullanıcının UID'si
    private String likeUid;      //Beğeni UID'si
    private String likedAt;  // Beğeni zamanı
    private Boolean isDeleted;  // Yorumun silinmesi

}
