
package com.pawan.urlshortner.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClickResponse {
    private String id;
    private String urlMappingId;
    private String shortCode;
    private String ipAddress;
    private String userAgent;
    private String referer;
    private String country;
    private String city;
    private String device;
    private String browser;
    private LocalDateTime clickedAt;
}