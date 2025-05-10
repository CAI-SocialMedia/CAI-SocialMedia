package com.cai.socialmedia.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UpdateUserRequestDTO {
    private String username;
    private String displayName;
    private String profilePhotoUid;
}
