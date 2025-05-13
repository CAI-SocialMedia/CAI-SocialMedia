package com.cai.socialmedia.controller;

import com.cai.socialmedia.dto.CommentRequestDTO;
import com.cai.socialmedia.dto.CommentResponseDTO;

import com.cai.socialmedia.service.CommentService;
import com.cai.socialmedia.util.ApiResponse;
import com.cai.socialmedia.util.SecurityUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comment")
@AllArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/add-comment")
    public ResponseEntity<ApiResponse<String>> addComment(@RequestBody CommentRequestDTO requestDTO) {
        String userUid = SecurityUtil.getAuthenticatedUidOrThrow();
        commentService.addComment(userUid, requestDTO);
        return ResponseEntity.ok(ApiResponse.success( "Yorum eklendi",null));
    }

    @GetMapping("/post/{postUid}")
    public ResponseEntity<ApiResponse<List<CommentResponseDTO>>> getCommentsByPostUid(@PathVariable String postUid) {
        SecurityUtil.getAuthenticatedUidOrThrow();
        List<CommentResponseDTO> comments = commentService.getCommentsByPostUid(postUid);
        return ResponseEntity.ok(ApiResponse.success("Yorumlar listelendi", comments));
    }

    @PutMapping("/{commentUid}")
    public ResponseEntity<ApiResponse<CommentResponseDTO>> updateComment(@PathVariable String commentUid,
            @RequestBody String newComment) {
        String userUid = SecurityUtil.getAuthenticatedUidOrThrow();
        commentService.updateComment(userUid, commentUid, newComment);
        return ResponseEntity.ok(ApiResponse.success("Yorum güncellendi", null));
    }

    @PostMapping("delete/{commentUid}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable String commentUid) {
        String userUid = SecurityUtil.getAuthenticatedUidOrThrow();
        commentService.deleteComment(userUid, commentUid);
        return ResponseEntity.ok(ApiResponse.success("Yorum silindi", null));
    }
}
