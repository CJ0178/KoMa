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
import com.skripsi.koma.dto.facility.FacilityCategoryDTO;
import com.skripsi.koma.dto.user.UpdatePasswordRequest;
import com.skripsi.koma.service.facilitycategory.FacilityCategoryService;
import com.skripsi.koma.service.user.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/facility-category")
@RequiredArgsConstructor
public class FacilityCategoryController {

    private final FacilityCategoryService facilityCategoryService;

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PEMILIK_KOS', 'PENJAGA_KOS', 'PENGHUNI')")
    public ResponseEntity<ApiResponse<FacilityCategoryDTO>> getUserDetailById(@PathVariable Long id) {
        ApiResponse<FacilityCategoryDTO> response = (ApiResponse<FacilityCategoryDTO>) facilityCategoryService.getFacilityCategoryById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','PEMILIK_KOS', 'PENJAGA_KOS')")
    public ResponseEntity<ApiResponse<List<FacilityCategoryDTO>>> getAllUsers() {
        ApiResponse<List<FacilityCategoryDTO>> response = (ApiResponse<List<FacilityCategoryDTO>>) facilityCategoryService.getAllFacilityCategory();
        return ResponseEntity.ok(response);
    }

    @PutMapping
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<FacilityCategoryDTO>> createFacilityCategory(@PathVariable Long id, @RequestBody FacilityCategoryDTO requestDto) {
        ApiResponse<FacilityCategoryDTO> response = (ApiResponse<FacilityCategoryDTO>) facilityCategoryService.updateFacilityCategory(id, requestDto);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<FacilityCategoryDTO>> updateUser(@PathVariable Long id, @RequestBody FacilityCategoryDTO requestDto) {
        ApiResponse<FacilityCategoryDTO> response = (ApiResponse<FacilityCategoryDTO>) facilityCategoryService.createFacilityCategory(id, requestDto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        ApiResponse<Void> response = (ApiResponse<Void>) facilityCategoryService.deleteFacilityCategory(id);
        return ResponseEntity.ok(response);
    }
}
