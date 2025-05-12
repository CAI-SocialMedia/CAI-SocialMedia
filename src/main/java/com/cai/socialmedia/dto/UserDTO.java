package com.cai.socialmedia.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private String uid;
    private String username;
    private String displayName;
    private String profilePhotoUid;
    private Integer credits;
    private String subscriptionType;
}

