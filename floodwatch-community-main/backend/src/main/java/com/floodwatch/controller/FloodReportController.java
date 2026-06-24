package com.floodwatch.controller;

import com.floodwatch.dto.FloodReportRequest;
import com.floodwatch.dto.FloodReportResponse;
import com.floodwatch.service.FloodReportService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reports")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class FloodReportController {

    @Autowired
    private FloodReportService floodReportService;

    @PostMapping
    public ResponseEntity<?> createReport(
            @Valid @RequestBody FloodReportRequest request,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            FloodReportResponse response = floodReportService.createReport(request, userEmail);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{reportId}/image")
    public ResponseEntity<?> uploadImage(
            @PathVariable Long reportId,
            @RequestParam("image") MultipartFile file,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            String imageUrl = floodReportService.uploadImage(reportId, file, userEmail);
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<FloodReportResponse>> getAllReports(
            @RequestParam(defaultValue = "VERIFIED") String status) {
        List<FloodReportResponse> reports = floodReportService.getReportsByStatus(status);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/active")
    public ResponseEntity<List<FloodReportResponse>> getActiveReports() {
        List<FloodReportResponse> reports = floodReportService.getActiveReports();
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/bounds")
    public ResponseEntity<List<FloodReportResponse>> getReportsInBounds(
            @RequestParam BigDecimal minLat,
            @RequestParam BigDecimal maxLat,
            @RequestParam BigDecimal minLng,
            @RequestParam BigDecimal maxLng) {
        List<FloodReportResponse> reports = floodReportService.getReportsInBounds(minLat, maxLat, minLng, maxLng);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/my-reports")
    public ResponseEntity<List<FloodReportResponse>> getMyReports(Authentication authentication) {
        String userEmail = authentication.getName();
        List<FloodReportResponse> reports = floodReportService.getUserReports(userEmail);
        return ResponseEntity.ok(reports);
    }

    @PutMapping("/{reportId}/verify")
    public ResponseEntity<?> verifyReport(
            @PathVariable Long reportId,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            FloodReportResponse response = floodReportService.verifyReport(reportId, userEmail);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{reportId}/reject")
    public ResponseEntity<?> rejectReport(
            @PathVariable Long reportId,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            FloodReportResponse response = floodReportService.rejectReport(reportId, userEmail);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{reportId}/resolve")
    public ResponseEntity<?> resolveReport(
            @PathVariable Long reportId,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            FloodReportResponse response = floodReportService.resolveReport(reportId, userEmail);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = floodReportService.getReportStats();
        return ResponseEntity.ok(stats);
    }
}