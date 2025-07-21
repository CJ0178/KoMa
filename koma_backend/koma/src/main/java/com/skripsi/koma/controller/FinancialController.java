package com.skripsi.koma.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.skripsi.koma.dto.ApiResponse;
import com.skripsi.koma.dto.financial.FinancialDTO;
import com.skripsi.koma.service.financial.FinancialService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/financial")
@RequiredArgsConstructor
public class FinancialController {
    private final FinancialService financialService;

    @GetMapping("/property/{propertyId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PEMILIK_KOS', 'PENJAGA_KOS')")
    public ResponseEntity<ApiResponse<List<FinancialDTO>>> getAllFinancialByProperty(@PathVariable Long propertyId) {
        ApiResponse<List<FinancialDTO>> response = financialService.getAllFinancialByProperty(propertyId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/property/{propertyId}/year")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PEMILIK_KOS', 'PENJAGA_KOS')")
    public ResponseEntity<ApiResponse<List<FinancialDTO>>> getAllFinancialByYear(@PathVariable Long propertyId, @RequestParam Integer year) {
        ApiResponse<List<FinancialDTO>> response = financialService.getAllFinancialByYear(propertyId, year);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/property/{propertyId}/month")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PEMILIK_KOS', 'PENJAGA_KOS')")
    public ResponseEntity<ApiResponse<List<FinancialDTO>>> getAllFinancialByMonth(@PathVariable Long propertyId, @RequestParam Integer year, @RequestParam Integer month) {
        ApiResponse<List<FinancialDTO>> response = financialService.getAllFinancialByMonth(propertyId, year, month);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/property/{propertyId}/day")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PEMILIK_KOS', 'PENJAGA_KOS')")
    public ResponseEntity<ApiResponse<List<FinancialDTO>>> getAllFinancialByDay(@PathVariable Long propertyId, @RequestParam Integer year, @RequestParam Integer month, @RequestParam Integer day) {
        ApiResponse<List<FinancialDTO>> response = financialService.getAllFinancialByDay(propertyId, year, month, day);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/property/{propertyId}/summary")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PEMILIK_KOS', 'PENJAGA_KOS')")
    public ResponseEntity<ApiResponse<List<com.skripsi.koma.dto.financial.FinancialSummaryDTO>>> getSummaryFinancialByProperty(@PathVariable Long propertyId) {
        ApiResponse<List<com.skripsi.koma.dto.financial.FinancialSummaryDTO>> response = financialService.getSummaryFinancialByProperty(propertyId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/property/{propertyId}/summary/year")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PEMILIK_KOS', 'PENJAGA_KOS')")
    public ResponseEntity<ApiResponse<List<com.skripsi.koma.dto.financial.FinancialSummaryDTO>>> getSummaryFinancialByYear(@PathVariable Long propertyId, @RequestParam Integer year) {
        ApiResponse<List<com.skripsi.koma.dto.financial.FinancialSummaryDTO>> response = financialService.getSummaryFinancialByYear(propertyId, year);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/property/{propertyId}/summary/month")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PEMILIK_KOS', 'PENJAGA_KOS')")
    public ResponseEntity<ApiResponse<List<com.skripsi.koma.dto.financial.FinancialSummaryDTO>>> getSummaryFinancialByMonth(@PathVariable Long propertyId, @RequestParam Integer year, @RequestParam Integer month) {
        ApiResponse<List<com.skripsi.koma.dto.financial.FinancialSummaryDTO>> response = financialService.getSummaryFinancialByMonth(propertyId, year, month);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/property/{propertyId}/summary/day")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PEMILIK_KOS', 'PENJAGA_KOS')")
    public ResponseEntity<ApiResponse<List<com.skripsi.koma.dto.financial.FinancialSummaryDTO>>> getSummaryFinancialByDay(@PathVariable Long propertyId, @RequestParam Integer year, @RequestParam Integer month, @RequestParam Integer day) {
        ApiResponse<List<com.skripsi.koma.dto.financial.FinancialSummaryDTO>> response = financialService.getSummaryFinancialByDay(propertyId, year, month, day);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('PEMILIK_KOS', 'PENJAGA_KOS')")
    public ResponseEntity<ApiResponse<FinancialDTO>> createReport(@RequestBody FinancialDTO request) {
        ApiResponse<FinancialDTO> response = financialService.createReport(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PEMILIK_KOS', 'PENJAGA_KOS')")
    public ResponseEntity<ApiResponse<FinancialDTO>> updateReport(@PathVariable Long id, @RequestBody FinancialDTO request) {
        ApiResponse<FinancialDTO> response = financialService.updateReport(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PEMILIK_KOS', 'PENJAGA_KOS')")
    public ResponseEntity<ApiResponse<Void>> deleteReport(@PathVariable Long id) {
        ApiResponse<Void> response = financialService.deleteReport(id);
        return ResponseEntity.ok(response);
    }
}
