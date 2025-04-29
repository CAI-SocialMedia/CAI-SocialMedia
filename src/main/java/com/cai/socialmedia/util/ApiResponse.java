package com.cai.socialmedia.util;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import org.springframework.http.HttpStatus;

@Data
@Builder
public class ApiResponse<T> {
    private @JsonProperty("Success") boolean success;
    private @JsonProperty("Status") int status;
    private @JsonProperty("Message") String message;
    private @JsonProperty("Data") T data;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .status(HttpStatus.OK.value())
                .message("İşlem başarılı.")
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .status(HttpStatus.OK.value())
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> fail(String message, HttpStatus httpStatus) {
        return ApiResponse.<T>builder()
                .success(false)
                .status(httpStatus.value())
                .message(message)
                .data(null)
                .build();
    }

    public static <T> ApiResponse<T> fail(String message) {
        return fail(message, HttpStatus.BAD_REQUEST);
    }
}
