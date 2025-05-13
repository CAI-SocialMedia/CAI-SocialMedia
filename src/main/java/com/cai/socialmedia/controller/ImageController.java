package com.cai.socialmedia.controller;

import com.cai.socialmedia.model.PostDocument;
import com.cai.socialmedia.service.ReplicateService;
import com.cai.socialmedia.util.ApiResponse;
import com.cai.socialmedia.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {
    private final ReplicateService replicateService;

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<PostDocument>> generateImage(@RequestBody GenerateImageRequest requestBody) {
        String userUid = SecurityUtil.getAuthenticatedUidOrThrow();
        PostDocument post = replicateService.generateImage(requestBody.prompt(), userUid);
        return ResponseEntity.ok(ApiResponse.success(post));
    }
}

record GenerateImageRequest(String prompt) {}