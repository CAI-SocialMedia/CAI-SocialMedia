package com.cai.socialmedia.exception;

import lombok.Getter;

@Getter
public class ApiException extends RuntimeException {
    private final int statusCode;

    public ApiException(String message) {
        super(message);
        this.statusCode = 400; // default: BAD_REQUEST
    }

    public ApiException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
