package com.skripsi.koma.controller;

import com.skripsi.koma.dto.ApiResponse;
import com.skripsi.koma.dto.approval.ApprovalDTO;
import com.skripsi.koma.dto.billing.BillingDetailDTO;
import com.skripsi.koma.dto.billing.BillingRequestDTO;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.skripsi.koma.service.billing.BillingService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/billing")
@RequiredArgsConstructor
public class BillingController {

  private final BillingService billingService;

  @PreAuthorize("hasAnyAuthority('PEMILIK_KOS')")
  @GetMapping("/property/{id}")
  public ResponseEntity<ApiResponse<List<BillingDetailDTO>>> getAllBookingByProperty(@PathVariable Long id) {
    return ResponseEntity.ok(billingService.getAllBookingByProperty(id));
  }

  @PreAuthorize("hasAnyAuthority('PENGHUNI')")
  @GetMapping("/occupant")
  public ResponseEntity<ApiResponse<List<BillingDetailDTO>>> getAllBookingByOccupant() {
    return ResponseEntity.ok(billingService.getAllBookingByOccupant());
  }

  @PreAuthorize("hasAnyAuthority('PEMILIK_KOS','PENGHUNI')")
  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<BillingDetailDTO>> getBookingDetailById(@PathVariable Long id) {
    return ResponseEntity.ok(billingService.getBookingDetail(id));
  }

  @PreAuthorize("hasAnyAuthority('PENGHUNI')")
  @PostMapping
  public ResponseEntity<ApiResponse> createBooking(@RequestBody BillingRequestDTO bookingDTO, @RequestParam(required = false) String ref) {
    return ResponseEntity.ok(billingService.createBooking(bookingDTO, ref));
  }

  @PreAuthorize("hasAnyAuthority('PEMILIK_KOS')")
  @PutMapping("/{id}/approval")
  public ResponseEntity<ApiResponse<Void>> approvalBooking(@PathVariable Long id,
      @RequestBody ApprovalDTO bookingApprovalDTO) {
    return ResponseEntity.ok(billingService.approvalBooking(id, bookingApprovalDTO));
  }

  @PreAuthorize("hasAnyAuthority('PENGHUNI')")
  @PutMapping("/{id}/payment")
  public ResponseEntity<ApiResponse<String>> bookingPayment(@PathVariable Long id, @RequestParam(value = "used_point", required = false) Integer usedPoint) {
    return ResponseEntity.ok(billingService.bookingPayment(id, usedPoint));
  }

  @PreAuthorize("hasAnyAuthority('PENGHUNI')")
  @PutMapping("/monthly/bill/payment")
  public ResponseEntity<ApiResponse<String>> payMonthlyBill(@RequestParam("id") List<Long> ids, @RequestParam(value = "used_point", required = false) Integer usedPoint) {
    return ResponseEntity.ok(billingService.payMonthlyBill(ids, usedPoint));
  }

  @PutMapping("/midtrans/status")
  public ResponseEntity<ApiResponse> updateMidtransStatus(@RequestParam("order_id") String orderId, @RequestParam("transaction_status") String transactionStatus, @RequestParam(required = false) String ref) {
    System.out.println("kode ref: "+ref);
    return ResponseEntity.ok(billingService.updateMidtransStatus(orderId, transactionStatus, ref));
  }

  @PreAuthorize("hasAnyAuthority('PEMILIK_KOS','ADMIN')")
  @PostMapping("/monthly/bill/generate")
  public ResponseEntity<ApiResponse<Void>> generateMonthlyBillsForAllOccupants() {
    return ResponseEntity.ok(billingService.createMonthlyBillsForAllOccupants());
  }

}
