package com.cai.socialmedia.controller;

import com.cai.socialmedia.dto.CommentRequestDTO;
import com.cai.socialmedia.dto.CommentResponseDTO;

import com.cai.socialmedia.service.CommentService;
import com.cai.socialmedia.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comment")
@AllArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/create-post")
    public ResponseEntity<ApiResponse<String>> addComment(
            HttpServletRequest request,
            @RequestBody CommentRequestDTO requestDTO) {

        String userUid = (String) request.getAttribute("firebaseUid");
        commentService.addComment(userUid, requestDTO);
        return ResponseEntity.ok(ApiResponse.success( "Yorum eklendi",null));
    }

    @GetMapping("/post/{postUid}")
    public ResponseEntity<ApiResponse<List<CommentResponseDTO>>> getCommentsByPostUid(
            HttpServletRequest request,
            @PathVariable String postUid) {

        request.getAttribute("firebaseUid");
        List<CommentResponseDTO> comments = commentService.getCommentsByPostUid(postUid);
        return ResponseEntity.ok(ApiResponse.success("Yorumlar listelendi", comments));
    }

    @PutMapping("/{commentUid}")
    public ResponseEntity<ApiResponse<CommentResponseDTO>> updateComment(
            HttpServletRequest request,
            @PathVariable String commentUid,
            @RequestBody String newComment) {

        String userUid = (String) request.getAttribute("firebaseUid");
        commentService.updateComment(userUid, commentUid, newComment);
        return ResponseEntity.ok(ApiResponse.success("Yorum güncellendi", null));
    }

    @PostMapping("delete/{commentUid}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            HttpServletRequest request,
            @PathVariable String commentUid) {

        String userUid = (String) request.getAttribute("firebaseUid");
        commentService.deleteComment(userUid, commentUid);
        return ResponseEntity.ok(ApiResponse.success("Yorum silindi", null));
    }
}
