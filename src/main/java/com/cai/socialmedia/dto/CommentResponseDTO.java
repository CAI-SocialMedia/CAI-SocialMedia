package com.cai.socialmedia.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponseDTO {
    private String commentUid;
    private String userUid;
    private String comment;
    private String createdAt;
}

