package com.skripsi.koma.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.skripsi.koma.dto.ApiResponse;
import com.skripsi.koma.dto.unit.UnitDetailDTO;
import com.skripsi.koma.service.unit.UnitService;
import com.skripsi.koma.service.user.UserService;
import com.skripsi.koma.repository.billing.BillingRepository;

import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/unit")
@RequiredArgsConstructor
public class UnitController {
    private final UnitService unitService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PEMILIK_KOS', 'PENJAGA_KOS', 'PENGHUNI')")
    public ResponseEntity<ApiResponse<List<UnitDetailDTO>>> getAllUnits() {
      return ResponseEntity.ok(unitService.getAllUnit());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PEMILIK_KOS', 'PENJAGA_KOS', 'PENGHUNI')")
    public ResponseEntity<ApiResponse> getUnitById(@PathVariable Long id, @RequestParam(required = false) String ref) {
      return ResponseEntity.ok(unitService.getUnitById(id, ref));
    }

    @GetMapping("/generateLink/{id}")
    @PreAuthorize("hasAnyAuthority('PENGHUNI')")
    public ResponseEntity<ApiResponse> getReferralLink(@PathVariable Long id) {
      return ResponseEntity.ok(unitService.generateReferralLink(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('PEMILIK_KOS')")
    public ResponseEntity<ApiResponse<UnitDetailDTO>> createUnit(@RequestBody UnitDetailDTO request) {
      return ResponseEntity.ok(unitService.createUnit(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PEMILIK_KOS')")
    public ResponseEntity<ApiResponse<UnitDetailDTO>> updateUnit(
      @PathVariable Long id,
      @RequestBody UnitDetailDTO request) {
        return ResponseEntity.ok(unitService.updateUnit(id, request));
      }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PEMILIK_KOS')")
    public ResponseEntity<ApiResponse<Void>> deleteUnit(@PathVariable Long id) {
        return ResponseEntity.ok(unitService.deleteUnit(id));
    }

    @PostMapping("/leave")
    @PreAuthorize("hasAnyAuthority('PENGHUNI')")
    public ResponseEntity<ApiResponse<Void>> leaveUnit() {
        return ResponseEntity.ok(unitService.leaveUnit());
    }
}
