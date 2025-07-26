
package com.pawan.urlshortner.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UrlResponse {
    private String id;
    private String originalUrl;
    private String shortCode;
    private String shortUrl;
    private String title;
    private String description;
    private boolean isActive;
    private LocalDateTime expirationDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long clickCount;
    private String createdBy;
}