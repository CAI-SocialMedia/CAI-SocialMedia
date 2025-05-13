package com.cai.socialmedia.util;

import com.cai.socialmedia.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {

    public static String getAuthenticatedUidOrThrow() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getPrincipal() == null || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ApiException("Yetkisiz erişim", HttpStatus.UNAUTHORIZED.value());
        }

        return authentication.getPrincipal().toString();
    }
}
