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
import com.skripsi.koma.dto.approval.ApprovalDTO;
import com.skripsi.koma.dto.property.PropertyDTO;
import com.skripsi.koma.service.property.PropertyRatingService;
import com.skripsi.koma.dto.property.PropertyPhotoDTO;
import com.skripsi.koma.service.property.PropertyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/property")
@RequiredArgsConstructor
public class PropertyController {
    private final PropertyService propertyService;
    private final PropertyRatingService propertyRatingService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PropertyDTO>>> getAllProperty() {
        ApiResponse<List<PropertyDTO>> response = propertyService.getAllProperty();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'PEMILIK_KOS', 'PENJAGA_KOS')")
    @GetMapping("/owner")
    public ResponseEntity<ApiResponse<List<PropertyDTO>>> getAllPropertyByOwnerId() {
        ApiResponse<List<PropertyDTO>> response = propertyService.getAllPropertyByOwnerId();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<com.skripsi.koma.dto.property.PropertyDetailDTO>> getPropertyDetail(@PathVariable Long id) {
        ApiResponse<com.skripsi.koma.dto.property.PropertyDetailDTO> response = propertyService.getPropertyDetail(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PEMILIK_KOS')")
    public ResponseEntity<ApiResponse<PropertyDTO>> createProperty(@RequestBody PropertyDTO request) {
        ApiResponse<PropertyDTO> response = propertyService.createProperty(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PEMILIK_KOS')")
    public ResponseEntity<ApiResponse<PropertyDTO>> updateProperty(@PathVariable Long id, @RequestBody PropertyDTO request) {
        ApiResponse<PropertyDTO> response = propertyService.updateProperty(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PEMILIK_KOS')")
    public ResponseEntity<ApiResponse<Void>> deleteProperty(@PathVariable Long id) {
        ApiResponse<Void> response = propertyService.deleteProperty(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/photo")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PEMILIK_KOS')")
    public ResponseEntity<ApiResponse<List<PropertyPhotoDTO>>> uploadPropertyPhotos(
            @PathVariable Long id,
            @RequestBody List<PropertyPhotoDTO> photoDTOs) {
        ApiResponse<List<PropertyPhotoDTO>> response = propertyService.uploadPhotos(id, photoDTOs);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/facility")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PEMILIK_KOS')")
    public ResponseEntity<ApiResponse<List<com.skripsi.koma.dto.facility.FacilityDTO>>> addPropertyFacilities(
            @PathVariable Long id,
            @RequestBody List<com.skripsi.koma.dto.facility.FacilityDTO> facilityDTOs) {
        ApiResponse<List<com.skripsi.koma.dto.facility.FacilityDTO>> response = propertyService.addPropertyFacilities(id, facilityDTOs);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/rate/{id}")
    @PreAuthorize("hasAnyAuthority('PENGHUNI','PENJAGA_KOS')")
    public ResponseEntity<ApiResponse> rateProperty(@PathVariable Long id, @RequestParam int rating) {
        return ResponseEntity.ok(propertyRatingService.giveOrUpdateRating(id, rating));
    }

    @PostMapping("/{id}/apply-keeper")
    @PreAuthorize("hasAuthority('PENJAGA_KOS')")
    public ResponseEntity<ApiResponse<Void>> applyAsPropertyKeeper(@PathVariable Long id) {
        ApiResponse<Void> response = propertyService.applyAsPropertyKeeper(id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyAuthority('PEMILIK_KOS')")
    @PutMapping("/keeper/{id}/approval")
    public ResponseEntity<ApiResponse<Void>> approvalPropertyKeeper(@PathVariable Long id,
        @RequestBody ApprovalDTO approvalDTO) {
      return ResponseEntity.ok(propertyService.approvalBooking(id, approvalDTO));
    }

    @PostMapping("/{id}/leave-keeper")
    @PreAuthorize("hasAuthority('PENJAGA_KOS')")
    public ResponseEntity<ApiResponse<Void>> leavePropertyAsKeeper(@PathVariable Long id) {
        ApiResponse<Void> response = propertyService.leavePropertyAsKeeper(id);
        return ResponseEntity.ok(response);
    }

}
