package com.floodwatch.service;

import com.floodwatch.dto.FloodReportRequest;
import com.floodwatch.dto.FloodReportResponse;
import com.floodwatch.entity.*;
import com.floodwatch.repository.FloodReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.floodwatch.entity.ReportStatus;
import com.floodwatch.entity.FloodSeverity;
import com.floodwatch.entity.UserRole;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FloodReportService {

    private final FloodReportRepository floodReportRepository;
    private final AuthService authService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Autowired
    public FloodReportService(FloodReportRepository floodReportRepository, AuthService authService) {
        this.floodReportRepository = floodReportRepository;
        this.authService = authService;
    }

    /** -------------------- CREATE -------------------- **/
    public FloodReportResponse createReport(FloodReportRequest request, String userEmail) {
        User user = authService.getUserByEmail(userEmail);

        FloodReport report = new FloodReport();
        report.setLatitude(request.getLatitude());
        report.setLongitude(request.getLongitude());
        report.setSeverity(FloodSeverity.valueOf(request.getSeverity().toUpperCase()));
        report.setDescription(request.getDescription());
        report.setLocation(request.getLocation());
        report.setReportedBy(user);
        report.setStatus(ReportStatus.PENDING);

        FloodReport savedReport = floodReportRepository.save(report);
        return new FloodReportResponse(savedReport);
    }

    /** -------------------- FILE UPLOAD -------------------- **/
    public String uploadImage(Long reportId, MultipartFile file, String userEmail) {
        FloodReport report = floodReportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));

        User user = authService.getUserByEmail(userEmail);

        if (!Objects.equals(report.getReportedBy().getId(), user.getId())
                && !UserRole.ADMIN.equals(user.getRole())) {
            throw new AccessDeniedException("Not authorized to upload image for this report");
        }

        if (file.isEmpty() || file.getOriginalFilename() == null) {
            throw new IllegalArgumentException("Invalid file uploaded");
        }

        try {
            // Ensure upload directory exists
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate safe unique filename
            String originalFilename = Paths.get(file.getOriginalFilename()).getFileName().toString();
            String extension = originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : "";
            String filename = UUID.randomUUID().toString() + extension;

            Path filePath = uploadPath.resolve(filename);

            // Copy with overwrite protection
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Update report with image URL
            String imageUrl = "/api/images/" + filename;
            report.setImageUrl(imageUrl);
            floodReportRepository.save(report);

            return imageUrl;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image", e);
        }
    }

    /** -------------------- RETRIEVAL -------------------- **/
    public List<FloodReportResponse> getReportsByStatus(String status) {
        ReportStatus reportStatus = ReportStatus.valueOf(status.toUpperCase());
        return floodReportRepository.findByStatus(reportStatus)
                .stream()
                .map(FloodReportResponse::new)
                .collect(Collectors.toList());
    }

    public List<FloodReportResponse> getActiveReports() {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        return floodReportRepository.findActiveReports(since)
                .stream()
                .map(FloodReportResponse::new)
                .collect(Collectors.toList());
    }

    public List<FloodReportResponse> getReportsInBounds(BigDecimal minLat, BigDecimal maxLat,
                                                        BigDecimal minLng, BigDecimal maxLng) {
        return floodReportRepository.findReportsInBounds(minLat, maxLat, minLng, maxLng)
                .stream()
                .map(FloodReportResponse::new)
                .collect(Collectors.toList());
    }

    public List<FloodReportResponse> getUserReports(String userEmail) {
        User user = authService.getUserByEmail(userEmail);
        return floodReportRepository.findByReportedById(user.getId())
                .stream()
                .map(FloodReportResponse::new)
                .collect(Collectors.toList());
    }

    /** -------------------- ADMIN ACTIONS -------------------- **/
    public FloodReportResponse verifyReport(Long reportId, String userEmail) {
        User admin = getAdmin(userEmail);

        FloodReport report = floodReportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));

        report.setStatus(ReportStatus.VERIFIED);
        report.setVerifiedBy(admin);
        report.setVerifiedAt(LocalDateTime.now());

        return new FloodReportResponse(floodReportRepository.save(report));
    }

    public FloodReportResponse rejectReport(Long reportId, String userEmail) {
        User admin = getAdmin(userEmail);

        FloodReport report = floodReportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));

        report.setStatus(ReportStatus.REJECTED);
        report.setVerifiedBy(admin);
        report.setVerifiedAt(LocalDateTime.now());

        return new FloodReportResponse(floodReportRepository.save(report));
    }

    public FloodReportResponse resolveReport(Long reportId, String userEmail) {
        User admin = getAdmin(userEmail);

        FloodReport report = floodReportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));

        report.setStatus(ReportStatus.RESOLVED);
        report.setResolvedAt(LocalDateTime.now());

        return new FloodReportResponse(floodReportRepository.save(report));
    }

    /** -------------------- STATISTICS -------------------- **/
    public Map<String, Object> getReportStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalReports", floodReportRepository.count());
        stats.put("pendingReports", floodReportRepository.countByStatus(ReportStatus.PENDING));
        stats.put("verifiedReports", floodReportRepository.countByStatus(ReportStatus.VERIFIED));
        stats.put("resolvedReports", floodReportRepository.countByStatus(ReportStatus.RESOLVED));

        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        stats.put("recentReports", floodReportRepository.countRecentReports(last24Hours));

        return stats;
    }

    /** -------------------- UTIL -------------------- **/
    private User getAdmin(String userEmail) {
        User admin = authService.getUserByEmail(userEmail);
        if (!UserRole.ADMIN.equals(admin.getRole())) {
            throw new AccessDeniedException("Only admins can perform this action");
        }
        return admin;
    }
}
