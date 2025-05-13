package com.cai.socialmedia.service;

import com.cai.socialmedia.exception.ApiException;
import com.cai.socialmedia.model.PostDocument;
import com.cai.socialmedia.repository.PostRepository;
import com.cai.socialmedia.util.DateUtil;
import com.google.cloud.Timestamp;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class ReplicateService {
    private final PostRepository postRepository;
    private final UserService userService;
    private final RestTemplate restTemplate;
    private static final String MODEL_VERSION = "ideogram-ai/ideogram-v3-turbo";
    private static final String REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";
    private static final int IMAGE_GENERATION_COST = 1;
    private static final int MAX_RETRIES = 30;
    private static final int RETRY_INTERVAL = 1000;

    private final String apiKey;

    public ReplicateService(
            @Value("${replicate.api.key}") String apiKey,
            PostRepository postRepository,
            UserService userService) {
        this.postRepository = postRepository;
        this.userService = userService;
        this.restTemplate = new RestTemplate();
        this.apiKey = apiKey;
    }

    public PostDocument generateImage(String prompt, String userUid) {
        try {
            log.info("Görsel oluşturma isteği alındı. Prompt: {}, UserUid: {}", prompt, userUid);

            userService.useCredits(userUid, IMAGE_GENERATION_COST);
            String predictionId = createPrediction(prompt);
            String imageUrl = waitForResult(predictionId);

            PostDocument post = new PostDocument();
            post.setPostUid(UUID.randomUUID().toString());
            post.setUserUid(userUid);
            post.setPrompt(prompt);
            post.setImageUrl(imageUrl);
            post.setIsPublic(true);
            post.setIsDeleted(false);
            post.setLikeCount(0);
            post.setCommentCount(0);
            post.setCreatedAt(DateUtil.formatTimestamp(Timestamp.now()));

            postRepository.save(post);
            return post;

        } catch (Exception e) {
            log.error("Görsel oluşturma hatası: {}", e.getMessage());
            throw new ApiException("Görsel oluşturma işlemi başarısız oldu: " + e.getMessage());
        }
    }

    private String createPrediction(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Token " + apiKey);

        Map<String, Object> input = new HashMap<>();
        input.put("prompt", prompt);
        input.put("negative_prompt", "low quality, bad anatomy, blurry, distorted");
        input.put("width", 1024);
        input.put("height", 1024);
        input.put("num_outputs", 1);
        input.put("scheduler", "K_EULER");
        input.put("num_inference_steps", 4);  // Modelin önerdiği gibi
        input.put("guidance_scale", 4); // 3-8 arası önerilir, isteğe göre arttır
        input.put("seed", 0); // Rastgelelik
        input.put("disable_safety_checker", false);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("version", MODEL_VERSION);
        requestBody.put("input", input);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(
                REPLICATE_API_URL,
                request,
                Map.class
        );

        if (response.getStatusCode() != HttpStatus.CREATED || response.getBody() == null) {
            throw new ApiException("Prediction oluşturulamadı");
        }

        return (String) response.getBody().get("id");
    }

    private String waitForResult(String predictionId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Token " + apiKey);
        HttpEntity<?> request = new HttpEntity<>(headers);

        for (int i = 0; i < MAX_RETRIES; i++) {
            try {
                ResponseEntity<Map> response = restTemplate.exchange(
                        REPLICATE_API_URL + "/" + predictionId,
                        HttpMethod.GET,
                        request,
                        Map.class
                );

                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    Map<String, Object> result = response.getBody();
                    String status = (String) result.get("status");

                    if ("succeeded".equals(status)) {
                        Object outputObj = result.get("output");

                        if (outputObj instanceof List<?> outputList && !outputList.isEmpty()) {
                            Object first = outputList.get(0);
                            if (first instanceof String) {
                                return (String) first;
                            }
                        } else if (outputObj instanceof String) {
                            return (String) outputObj;
                        } else {
                            throw new ApiException("Görsel URL çıktısı beklenilen formatta değil");
                        }
                    } else if ("failed".equals(status)) {
                        throw new ApiException("Görsel oluşturma başarısız oldu");
                    }
                }

                Thread.sleep(RETRY_INTERVAL);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new ApiException("İşlem zaman aşımına uğradı");
            }
        }

        throw new ApiException("Görsel oluşturma zaman aşımına uğradı");
    }
}