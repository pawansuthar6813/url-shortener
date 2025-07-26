
package com.pawan.urlshortner.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "clicks")
public class Click {
    @Id
    private String id;

    @DBRef
    private UrlMapping urlMapping;

    private String ipAddress;

    private String userAgent;

    private String referer;

    private String country;

    private String city;

    private String device;

    private String browser;

    private LocalDateTime clickedAt;
}