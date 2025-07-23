package com.skripsi.koma.repository.financial;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.skripsi.koma.dto.financial.FinancialSummaryDTO;
import com.skripsi.koma.model.financial.FinancialModel;
import com.skripsi.koma.repository.BaseRepository;

public interface FinancialRepository extends BaseRepository<FinancialModel> {

    List<FinancialModel> findAllByPropertyId(Long propertyId);

    @Query("SELECT f FROM FinancialModel f WHERE f.property.id = :propertyId AND YEAR(f.date) = :year AND f.active")
    List<FinancialModel> findAllByYear(@Param("propertyId") Long propertyId, @Param("year") Integer year);

    @Query("SELECT f FROM FinancialModel f WHERE f.property.id = :propertyId AND YEAR(f.date) = :year AND MONTH(f.date) = :month AND f.active")
    List<FinancialModel> findAllByMonth(@Param("propertyId") Long propertyId, @Param("year") Integer year, @Param("month") Integer month);

    @Query("SELECT f FROM FinancialModel f WHERE f.property.id = :propertyId AND YEAR(f.date) = :year AND MONTH(f.date) = :month AND DAY(f.date) = :day AND f.active")
    List<FinancialModel> findAllByDay(@Param("propertyId") Long propertyId, @Param("year") Integer year, @Param("month") Integer month, @Param("day") Integer day);

    @Query("SELECT new com.skripsi.koma.dto.financial.FinancialSummaryDTO(SUM(f.income), SUM(f.expense), YEAR(f.date), NULL, NULL) FROM FinancialModel f WHERE f.property.id = :propertyId AND f.active GROUP BY YEAR(f.date)")
    List<FinancialSummaryDTO> findSummaryByProperty(@Param("propertyId") Long propertyId);

    @Query("SELECT new com.skripsi.koma.dto.financial.FinancialSummaryDTO(SUM(f.income), SUM(f.expense), YEAR(f.date), NULL, NULL) FROM FinancialModel f WHERE f.property.id = :propertyId AND YEAR(f.date) = :year  AND f.active GROUP BY YEAR(f.date)")
    List<FinancialSummaryDTO> findSummaryByYear(@Param("propertyId") Long propertyId, @Param("year") Integer year);

    @Query("SELECT new com.skripsi.koma.dto.financial.FinancialSummaryDTO(SUM(f.income), SUM(f.expense), YEAR(f.date), MONTH(f.date), NULL) FROM FinancialModel f WHERE f.property.id = :propertyId AND YEAR(f.date) = :year AND MONTH(f.date) = :month  AND f.active GROUP BY YEAR(f.date), MONTH(f.date)")
    List<FinancialSummaryDTO> findSummaryByMonth(@Param("propertyId") Long propertyId, @Param("year") Integer year, @Param("month") Integer month);

    @Query("SELECT new com.skripsi.koma.dto.financial.FinancialSummaryDTO(SUM(f.income), SUM(f.expense), YEAR(f.date), MONTH(f.date), DAY(f.date)) FROM FinancialModel f WHERE f.property.id = :propertyId AND YEAR(f.date) = :year AND MONTH(f.date) = :month AND DAY(f.date) = :day  AND f.active GROUP BY YEAR(f.date), MONTH(f.date), DAY(f.date)")
    List<FinancialSummaryDTO> findSummaryByDay(@Param("propertyId") Long propertyId, @Param("year") Integer year, @Param("month") Integer month, @Param("day") Integer day);

}
