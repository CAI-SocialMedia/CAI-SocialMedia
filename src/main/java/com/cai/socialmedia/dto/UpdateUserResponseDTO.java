package com.cai.socialmedia.dto;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class UpdateUserResponseDTO {
    private String username;
    private String displayName;
    private String profilePhotoUid;
}
