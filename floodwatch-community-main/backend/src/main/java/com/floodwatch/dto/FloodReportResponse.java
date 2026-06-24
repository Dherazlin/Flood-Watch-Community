package com.floodwatch.dto;

import com.floodwatch.entity.FloodReport;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class FloodReportResponse {

    public FloodReportResponse(FloodReport report) {
        this.id = report.getId();
        this.latitude = report.getLatitude();
        this.longitude = report.getLongitude();
        this.location = report.getLocation();
        this.description = report.getDescription();
        this.imageUrl = report.getImageUrl();
        this.severity = report.getSeverity() != null ? report.getSeverity().name() : null;
        this.status = report.getStatus() != null ? report.getStatus().name() : null;
        this.reportedBy = report.getReportedBy() != null ? report.getReportedBy().getFullName() : null;
        this.verifiedBy = report.getVerifiedBy() != null ? report.getVerifiedBy().getFullName() : null;
        this.verifiedAt = report.getVerifiedAt();
        this.createdAt = report.getCreatedAt();
        this.resolvedAt = report.getResolvedAt();
    }

    private Long id;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String severity;
    private String description;
    private String imageUrl;
    private String location;
    private String status;
    private String reportedBy;
    private String verifiedBy;
    private LocalDateTime verifiedAt;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    private FloodReportResponse() {
        // private constructor to enforce use of fromEntity
    }

    public static FloodReportResponse fromEntity(FloodReport report) {
        FloodReportResponse response = new FloodReportResponse();
        response.id = report.getId();
        response.latitude = report.getLatitude();
        response.longitude = report.getLongitude();
        response.severity = report.getSeverity() != null ? report.getSeverity().name() : null;
        response.description = report.getDescription();
        response.imageUrl = report.getImageUrl();
        response.location = report.getLocation();
        response.status = report.getStatus() != null ? report.getStatus().name() : null;
        response.reportedBy = report.getReportedBy() != null ? report.getReportedBy().getFullName() : null;
        response.verifiedBy = report.getVerifiedBy() != null ? report.getVerifiedBy().getFullName() : null;
        response.verifiedAt = report.getVerifiedAt();
        response.createdAt = report.getCreatedAt();
        response.resolvedAt = report.getResolvedAt();
        return response;
    }

    // Getters (immutable style - no setters)
    public Long getId() { return id; }
    public BigDecimal getLatitude() { return latitude; }
    public BigDecimal getLongitude() { return longitude; }
    public String getSeverity() { return severity; }
    public String getDescription() { return description; }
    public String getImageUrl() { return imageUrl; }
    public String getLocation() { return location; }
    public String getStatus() { return status; }
    public String getReportedBy() { return reportedBy; }
    public String getVerifiedBy() { return verifiedBy; }
    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
}
