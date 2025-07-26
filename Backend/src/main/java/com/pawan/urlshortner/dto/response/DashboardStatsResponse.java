
package com.pawan.urlshortner.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private Long totalUrls;
    private Long totalClicks;
    private Long todayClicks;
    private Long thisWeekClicks;
    private Long thisMonthClicks;
    private List<UrlResponse> recentUrls;
    private List<UrlResponse> topUrls;
    private Map<String, Long> clicksByDate;
    private Map<String, Long> clicksByCountry;
    private Map<String, Long> clicksByDevice;
}