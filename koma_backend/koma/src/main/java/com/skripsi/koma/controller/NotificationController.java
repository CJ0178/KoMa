package com.skripsi.koma.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.skripsi.koma.dto.ApiResponse;
import com.skripsi.koma.dto.notification.NotificationDTO;
import com.skripsi.koma.service.notification.NotificationService;

import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/notification")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/property/{propertyId}")
    @PreAuthorize("hasAnyAuthority('PEMILIK_KOS','PENGHUNI','PENJAGA_KOS')")
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getAllByPropertyId(@PathVariable Long propertyId) {
        return ResponseEntity.ok(notificationService.getAllByPropertyId(propertyId));
    }

    @GetMapping("/user")
    @PreAuthorize("hasAnyAuthority('PEMILIK_KOS','PENGHUNI','PENJAGA_KOS')")
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getAllByUserId() {
        return ResponseEntity.ok(notificationService.getAllByUserId());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PEMILIK_KOS','PENGHUNI','PENJAGA_KOS')")
    public ResponseEntity<ApiResponse<NotificationDTO>> getNotificationDetail(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.getNotificationDetail(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('PEMILIK_KOS','PENGHUNI','PENJAGA_KOS')")
    public ResponseEntity<ApiResponse<NotificationDTO>> createNotification(@RequestBody NotificationDTO request) {
        return ResponseEntity.ok(notificationService.createNotification(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PEMILIK_KOS','PENGHUNI','PENJAGA_KOS')")
    public ResponseEntity<ApiResponse<NotificationDTO>> updateNotification(@PathVariable Long id, @RequestBody NotificationDTO request) {
        return ResponseEntity.ok(notificationService.updateNotification(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PEMILIK_KOS','PENGHUNI','PENJAGA_KOS')")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.deleteNotification(id));
    }

    @PostMapping("/reminder")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> sendPendingBillReminder() {
        return ResponseEntity.ok(notificationService.sendPendingBillReminder());
    }
}
