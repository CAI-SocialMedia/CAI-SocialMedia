package com.cai.socialmedia.service;

import com.cai.socialmedia.exception.ApiException;
import com.cai.socialmedia.model.CommentDocument;
import com.cai.socialmedia.dto.CommentRequestDTO;
import com.cai.socialmedia.dto.CommentResponseDTO;
import com.cai.socialmedia.repository.CommentRepository;
import com.cai.socialmedia.util.DateUtil;
import com.google.cloud.Timestamp;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;

    public void addComment(String userUid, CommentRequestDTO requestDTO) {
        CommentDocument document = new CommentDocument();
        document.setUserUid(userUid);
        document.setCommentUid(UUID.randomUUID().toString());
        document.setPostUid(requestDTO.getPostUid());
        document.setComment(requestDTO.getComment());
        document.setCreatedAt(DateUtil.formatTimestamp(Timestamp.now()));
        document.setIsDeleted(requestDTO.getIsDeleted());
        commentRepository.save(document);
    }

    public List<CommentResponseDTO> getCommentsByPostUid(String postUid) {
        return commentRepository.findByPostUid(postUid);
    }

    public void updateComment(String userUid, String commentUid, String newComment) {
        CommentDocument existing = commentRepository.findById(commentUid)
                .orElseThrow(() -> new ApiException("Yorum bulunamadı"));

        if (!existing.getUserUid().equals(userUid)) {
            throw new ApiException("Yalnızca kendi yorumunuzu güncelleyebilirsiniz");
        }
        commentRepository.updateComment(commentUid, newComment);
    }

    public void deleteComment(String userUid, String commentUid) {
        CommentDocument existing = commentRepository.findById(commentUid)
                .orElseThrow(() -> new ApiException("Yorum bulunamadı"));

        if (!existing.getUserUid().equals(userUid)) {
            throw new ApiException("Yalnızca kendi yorumunuzu silebilirsiniz");
        }
        commentRepository.softDelete(commentUid);
    }
}

