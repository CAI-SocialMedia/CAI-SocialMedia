package com.cai.socialmedia.service;

import com.cai.socialmedia.exception.ApiException;
import com.cai.socialmedia.model.CommentDocument;
import com.cai.socialmedia.dto.CommentRequestDTO;
import com.cai.socialmedia.dto.CommentResponseDTO;
import com.cai.socialmedia.repository.CommentRepository;
import com.cai.socialmedia.repository.PostRepository;
import com.cai.socialmedia.util.DateUtil;
import com.google.cloud.Timestamp;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

@Slf4j
@Service
@AllArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    public void addComment(String userUid, CommentRequestDTO requestDTO) {
        try {
            CommentDocument document = new CommentDocument();
            document.setUserUid(userUid);
            document.setCommentUid(UUID.randomUUID().toString());
            document.setPostUid(requestDTO.getPostUid());
            document.setComment(requestDTO.getComment());
            document.setCreatedAt(DateUtil.formatTimestamp(Timestamp.now()));
            document.setIsDeleted(requestDTO.getIsDeleted());
            commentRepository.save(document);
            postRepository.incrementCommentCount(requestDTO.getPostUid());
        } catch (Exception e) {
            log.error("Yorum kaydedilirken hata oluştu", e);
            throw new ApiException("Yorum kaydedilirken hata oluştu: " + e.getMessage());
        }
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
        try {
            CommentDocument existing = commentRepository.findById(commentUid)
                    .orElseThrow(() -> new ApiException("Yorum bulunamadı"));

            if (!existing.getUserUid().equals(userUid)) {
                throw new ApiException("Yalnızca kendi yorumunuzu silebilirsiniz");
            }
            commentRepository.softDelete(commentUid);
            postRepository.decrementCommentCount(commentRepository.getPostUidByCommentUid(commentUid));
        } catch (InterruptedException | ExecutionException e) {
            throw new ApiException("Beğeni kaldırılırken hata oluştu");
        }
    }
}

