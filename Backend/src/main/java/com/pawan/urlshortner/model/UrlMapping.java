
package com.pawan.urlshortner.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.index.Indexed;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "url_mappings")
public class UrlMapping {
    @Id
    private String id;

    @NotBlank(message = "Original URL is required")
    @Pattern(regexp = "^https?://.*", message = "URL must start with http:// or https://")
    private String originalUrl;

    @NotBlank(message = "Short code is required")
    @Indexed(unique = true)
    private String shortCode;

    @DBRef
    private User createdBy;

    private String title;

    private String description;

    private boolean isActive = true;

    private LocalDateTime expirationDate;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Long clickCount = 0L;
}
