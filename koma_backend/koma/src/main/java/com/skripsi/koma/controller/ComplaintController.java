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
import org.springframework.web.bind.annotation.RestController;

import com.skripsi.koma.dto.ApiResponse;
import com.skripsi.koma.dto.complaint.ComplaintDTO;
import com.skripsi.koma.service.complaint.ComplaintService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/complaint")
@RequiredArgsConstructor
public class ComplaintController {
    private final ComplaintService complaintService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PEMILIK_KOS', 'PENJAGA_KOS', 'PENGHUNI')")
    public ResponseEntity<ApiResponse<List<ComplaintDTO>>> getAllComplaint() {
        ApiResponse<List<ComplaintDTO>> response = complaintService.getAllComplaint();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'PEMILIK_KOS', 'PENJAGA_KOS', 'PENGHUNI')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ComplaintDTO>> getComplaintById(@PathVariable Long id) {
        ApiResponse<ComplaintDTO> response = complaintService.getComplaintById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/property/{propertyId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PEMILIK_KOS', 'PENJAGA_KOS', 'PENGHUNI')")
    public ResponseEntity<ApiResponse<List<ComplaintDTO>>> getAllComplaintByProperty(@PathVariable Long propertyId) {
        ApiResponse<List<ComplaintDTO>> response = complaintService.getAllComplaintByProperty(propertyId);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('PENGHUNI')")
    public ResponseEntity<ApiResponse<ComplaintDTO>> createComplaint(@RequestBody ComplaintDTO request) {
        ApiResponse<ComplaintDTO> response = complaintService.createComplaint(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PENGHUNI')")
    public ResponseEntity<ApiResponse<ComplaintDTO>> updateComplaint(@PathVariable Long id, @RequestBody ComplaintDTO request) {
        ApiResponse<ComplaintDTO> response = complaintService.updateComplaint(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PENGHUNI','ADMIN', 'PEMILIK_KOS')")
    public ResponseEntity<ApiResponse<Void>> deleteComplaint(@PathVariable Long id) {
        ApiResponse<Void> response = complaintService.deleteComplaint(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/on-progress")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PEMILIK_KOS', 'PENJAGA_KOS')")
    public ResponseEntity<ApiResponse<ComplaintDTO>> markAsOnProgress(@PathVariable Long id) {
        ApiResponse<ComplaintDTO> response = complaintService.markAsOnProgress(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/done")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PEMILIK_KOS', 'PENJAGA_KOS')")
    public ResponseEntity<ApiResponse<ComplaintDTO>> markAsDone(@PathVariable Long id) {
        ApiResponse<ComplaintDTO> response = complaintService.markAsDone(id);
        return ResponseEntity.ok(response);
    }
}
