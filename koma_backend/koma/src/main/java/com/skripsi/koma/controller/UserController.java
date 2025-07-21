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
import com.skripsi.koma.dto.user.UserDetailDTO;
import com.skripsi.koma.dto.user.UpdatePasswordRequest;
import com.skripsi.koma.service.user.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PEMILIK_KOS', 'PENJAGA_KOS', 'PENGHUNI')")
    public ResponseEntity<ApiResponse<UserDetailDTO>> getUserDetailById(@PathVariable Long id) {
        ApiResponse<UserDetailDTO> response = (ApiResponse<UserDetailDTO>) userService.getUserDetailById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDetailDTO>>> getAllUsers() {
        ApiResponse<List<UserDetailDTO>> response = (ApiResponse<List<UserDetailDTO>>) userService.getAllUsers();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PEMILIK_KOS', 'PENJAGA_KOS', 'PENGHUNI')")
    public ResponseEntity<ApiResponse<UserDetailDTO>> updateUser(@PathVariable Long id, @RequestBody UserDetailDTO userDTO) {
        ApiResponse<UserDetailDTO> response = (ApiResponse<UserDetailDTO>) userService.updateUser(id, userDTO);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        ApiResponse<Void> response = (ApiResponse<Void>) userService.deleteUser(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/update-password")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PEMILIK_KOS', 'PENJAGA_KOS', 'PENGHUNI')")
    public ResponseEntity<ApiResponse<Void>> updatePassword(@RequestBody UpdatePasswordRequest request) {
        ApiResponse<Void> response = userService.updatePassword(request.getOldPassword(), request.getNewPassword(), request.getConfirmPassword());
        return ResponseEntity.ok(response);
    }
}
