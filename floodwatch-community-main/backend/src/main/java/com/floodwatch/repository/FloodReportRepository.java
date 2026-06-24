package com.floodwatch.repository;

import com.floodwatch.entity.FloodReport;
import com.floodwatch.entity.ReportStatus;
import com.floodwatch.entity.FloodSeverity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FloodReportRepository extends JpaRepository<FloodReport, Long> {

    List<FloodReport> findByStatus(ReportStatus status);

    List<FloodReport> findBySeverity(FloodSeverity severity);

    List<FloodReport> findByReportedById(Long userId);

    @Query("SELECT fr FROM FloodReport fr " +
           "WHERE fr.status = com.floodwatch.entity.ReportStatus.VERIFIED " +
           "AND fr.createdAt >= :since")
    List<FloodReport> findActiveReports(@Param("since") LocalDateTime since);

    @Query("SELECT fr FROM FloodReport fr " +
           "WHERE fr.latitude BETWEEN :minLat AND :maxLat " +
           "AND fr.longitude BETWEEN :minLng AND :maxLng " +
           "AND fr.status = com.floodwatch.entity.ReportStatus.VERIFIED")
    List<FloodReport> findVerifiedReportsInBounds(
            @Param("minLat") BigDecimal minLat,
            @Param("maxLat") BigDecimal maxLat,
            @Param("minLng") BigDecimal minLng,
            @Param("maxLng") BigDecimal maxLng
    );

    @Query("SELECT fr FROM FloodReport fr " +
           "WHERE fr.latitude BETWEEN :minLat AND :maxLat " +
           "AND fr.longitude BETWEEN :minLng AND :maxLng")
    List<FloodReport> findReportsInBounds(
            @Param("minLat") BigDecimal minLat,
            @Param("maxLat") BigDecimal maxLat,
            @Param("minLng") BigDecimal minLng,
            @Param("maxLng") BigDecimal maxLng
    );

    long countByStatus(ReportStatus status);

    @Query("SELECT COUNT(fr) FROM FloodReport fr WHERE fr.createdAt >= :since")
    long countRecentReports(@Param("since") LocalDateTime since);
}
