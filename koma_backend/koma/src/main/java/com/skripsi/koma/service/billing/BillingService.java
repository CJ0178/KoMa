package com.skripsi.koma.service.billing;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.midtrans.Midtrans;
import com.midtrans.httpclient.SnapApi;
import com.midtrans.httpclient.error.MidtransError;
import com.skripsi.koma.dto.ApiResponse;
import com.skripsi.koma.dto.approval.ApprovalDTO;
import com.skripsi.koma.dto.billing.BillingDetailDTO;
import com.skripsi.koma.dto.billing.BillingRequestDTO;
import com.skripsi.koma.dto.notification.NotificationDTO;
import com.skripsi.koma.dto.payment.CustomerDetailDTO;
import com.skripsi.koma.dto.payment.ItemDetailDTO;
import com.skripsi.koma.dto.payment.PaymentRequestDTO;
import com.skripsi.koma.dto.payment.TransactionDetailDTO;
import com.skripsi.koma.dto.financial.FinancialDTO;
import com.skripsi.koma.service.financial.FinancialService;
import com.skripsi.koma.dto.property.PropertyDetailDTO;
import com.skripsi.koma.dto.unit.UnitDetailDTO;
import com.skripsi.koma.dto.user.UserDetailDTO;
import com.skripsi.koma.enums.ApprovalStatus;
import com.skripsi.koma.enums.BillingStatus;
import com.skripsi.koma.model.billing.BillingModel;
import com.skripsi.koma.model.property.PropertyModel;
import com.skripsi.koma.model.unit.UnitModel;
import com.skripsi.koma.model.unit.UnitReferrenceModel;
import com.skripsi.koma.model.user.UserModel;
import com.skripsi.koma.repository.billing.BillingRepository;
import com.skripsi.koma.repository.property.PropertyRepository;
import com.skripsi.koma.repository.unit.UnitReferrenceRepository;
import com.skripsi.koma.repository.unit.UnitRepository;
import com.skripsi.koma.repository.user.UserRepository;
import com.skripsi.koma.service.notification.NotificationService;
import com.skripsi.koma.service.user.UserService;
import com.skripsi.koma.util.CustomExceptions;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BillingService {

  private final UnitReferrenceRepository unitReferrenceRepository;
  private final UserService userService;
  private final PropertyRepository propertyRepository;
  private final UnitRepository unitRepository;
  private final UserRepository userRepository;
  private final BillingRepository billingRepository;
  private final NotificationService notificationService;
  private final FinancialService financialService;

  @Transactional
  public ApiResponse<BillingRequestDTO> createBooking(BillingRequestDTO billingDTO, String ref) {
    ApiResponse<BillingRequestDTO> apiResponse = new ApiResponse<>();
    UserModel user = userService.getUser();
    UnitModel unit = unitRepository.findById(billingDTO.getUnitId()).orElse(null);
    if (unit == null) {
      throw new CustomExceptions(HttpStatus.NOT_FOUND, "Kamar tidak ditemukkan", null);
    }
    PropertyModel property = unit.getProperty();
    // Validasi jenis kelamin user dengan tipe unit
    if (property.getPropertyType() != null && property.getPropertyType().toLowerCase().contains("putra")) {
      if (user.getGender() == null || !user.getGender().equalsIgnoreCase("L")) {
        throw new CustomExceptions(HttpStatus.FORBIDDEN, "Unit ini khusus laki-laki", null);
      }
    } else if (property.getPropertyType() != null && property.getPropertyType().toLowerCase().contains("putri")) {
      if (user.getGender() == null || !user.getGender().equalsIgnoreCase("P")) {
        throw new CustomExceptions(HttpStatus.FORBIDDEN, "Unit ini khusus perempuan", null);
      }
    }
    UnitModel occupantUnit = unitRepository.findByOccupant(user);
    if (occupantUnit != null) {
      throw new CustomExceptions(HttpStatus.CONFLICT, "Anda sudah memiliki kamar yang dibooking", null);
    }
    if (billingRepository.existsActiveBookingByUnit(unit)) {
        throw new CustomExceptions(HttpStatus.CONFLICT, "Kamar ini sudah dibooking oleh penghuni lain", null);
    }
    unit.setAvailable(false);
    unitRepository.save(unit);
    BillingModel billingModel = new BillingModel();
    billingModel.setOccupant(user);
    billingModel.setProperty(property);
    billingModel.setUnit(unit);
    billingModel.setNominal(unit.getDepositFee());
    billingModel.setStatusBilling(BillingStatus.BOOKING_REQUEST);
    billingModel.setReferenceNo("BOOKING-" + UUID.randomUUID().toString());
    billingModel.setBillingType("BOOKING");
    LocalDate dueDate = LocalDate.now().plusDays(7);
    billingModel.setDueDate(dueDate);
    if (ref != null) {
      UnitReferrenceModel unitReferrenceModel = unitReferrenceRepository.findByReferrerCode(ref);
      billingModel.setUnitReference(unitReferrenceModel);
    }
    billingRepository.save(billingModel);


    apiResponse.setData(billingDTO);
    apiResponse.setMessage("Tagihan kamar berhasil dilakukkan");
    apiResponse.setSuccess(true);
    NotificationDTO notificationRequest = new NotificationDTO();
    notificationRequest.setPropertyId(property.getId());
    notificationRequest.setUnitId(unit.getId());
    notificationRequest.setBillingId(billingModel.getId());
    notificationRequest.setUserId(property.getOwner().getId());
    notificationRequest.setNotificationCategory("APPROVAL-BOOKING");
    notificationRequest.setContent("Permintaan booking kamar dari " + user.getName() + " untuk unit "
        + unit.getUnitName() + " di properti " + property.getPropertyName());
    notificationService.createNotification(notificationRequest);
    return apiResponse;
  }

  public ApiResponse<List<BillingDetailDTO>> getAllBookingByProperty(Long propertyId) {
    ApiResponse<List<BillingDetailDTO>> apiResponse = new ApiResponse<>();
    PropertyModel property = propertyRepository.findById(propertyId).orElse(null);
    if (property == null) {
      throw new CustomExceptions(HttpStatus.NOT_FOUND, "Kos tidak ditemukkan", null);
    }
    List<BillingModel> billingList = billingRepository.findAllByProperty(property);
    List<BillingDetailDTO> billingDTOs = new ArrayList<>();
    for (BillingModel billing : billingList) {
      BillingDetailDTO billingDetailDTO = new BillingDetailDTO();
      billingDetailDTO.setBookingId(billing.getId());
      billingDetailDTO.setReferenceNo(billing.getReferenceNo());
      billingDetailDTO.setMultiPayReferenceNo(billing.getMultiPayReferenceNo());
      billingDetailDTO.setBillingType(billing.getBillingType());
      billingDetailDTO.setDueDate(billing.getDueDate());
      billingDetailDTO.setLastMidtransStatus(billing.getLastMidtransStatus());
      if (billing.getOccupant() != null) {
        billingDetailDTO.setOccupant(UserDetailDTO.mapToDTO(billing.getOccupant()));
      }
      if (billing.getProperty() != null) {
        PropertyDetailDTO dto = PropertyDetailDTO.mapToDTO(billing.getProperty());
        billingDetailDTO.setProperty(dto);
      }
      if (billing.getUnit() != null) {
        billingDetailDTO.setUnit(UnitDetailDTO.mapToDTO(billing.getUnit()));
      }
      billingDetailDTO.setStatusBilling(billing.getStatusBilling());
      billingDetailDTO.setNominal(billing.getNominal());
      billingDTOs.add(billingDetailDTO);
    }
    apiResponse.setSuccess(true);
    apiResponse.setMessage("Transaksi berhasil");
    apiResponse.setData(billingDTOs);
    return apiResponse;
  }

  public ApiResponse<List<BillingDetailDTO>> getAllBookingByOccupant() {
    ApiResponse<List<BillingDetailDTO>> apiResponse = new ApiResponse<>();
    UserModel user = userService.getUser();
    List<BillingModel> billingList = billingRepository.findAllByOccupant(user);
    List<BillingDetailDTO> billingDTOs = new ArrayList<>();
    for (BillingModel billing : billingList) {
      BillingDetailDTO billingDetailDTO = new BillingDetailDTO();
      billingDetailDTO.setBookingId(billing.getId());
      billingDetailDTO.setReferenceNo(billing.getReferenceNo());
      billingDetailDTO.setMultiPayReferenceNo(billing.getMultiPayReferenceNo());
      billingDetailDTO.setBillingType(billing.getBillingType());
      billingDetailDTO.setDueDate(billing.getDueDate());
      billingDetailDTO.setLastMidtransStatus(billing.getLastMidtransStatus());
      if (billing.getOccupant() != null) {
        billingDetailDTO.setOccupant(UserDetailDTO.mapToDTO(billing.getOccupant()));
      }
      if (billing.getProperty() != null) {
        PropertyDetailDTO dto = PropertyDetailDTO.mapToDTO(billing.getProperty());
        billingDetailDTO.setProperty(dto);
      }
      if (billing.getUnit() != null) {
        billingDetailDTO.setUnit(UnitDetailDTO.mapToDTO(billing.getUnit()));
      }
      billingDetailDTO.setStatusBilling(billing.getStatusBilling());
      billingDetailDTO.setNominal(billing.getNominal());
      billingDTOs.add(billingDetailDTO);
    }
    apiResponse.setSuccess(true);
    apiResponse.setMessage("Transaksi berhasil");
    apiResponse.setData(billingDTOs);
    return apiResponse;
  }

  public ApiResponse<BillingDetailDTO> getBookingDetail(Long id) {
    ApiResponse<BillingDetailDTO> apiResponse = new ApiResponse<>();
    BillingModel billing = billingRepository.findById(id).orElseThrow(
        () -> new CustomExceptions(HttpStatus.NOT_FOUND, "Tagihan tidak ditemukkan", null));
    BillingDetailDTO billingDetailDTO = new BillingDetailDTO();
    billingDetailDTO.setBookingId(billing.getId());
    billingDetailDTO.setReferenceNo(billing.getReferenceNo());
    billingDetailDTO.setMultiPayReferenceNo(billing.getMultiPayReferenceNo());
    billingDetailDTO.setBillingType(billing.getBillingType());
    billingDetailDTO.setDueDate(billing.getDueDate());
    billingDetailDTO.setLastMidtransStatus(billing.getLastMidtransStatus());
    if (billing.getOccupant() != null) {
      billingDetailDTO.setOccupant(UserDetailDTO.mapToDTO(billing.getOccupant()));
    }
    if (billing.getProperty() != null) {
      PropertyDetailDTO dto = PropertyDetailDTO.mapToDTO(billing.getProperty());
      billingDetailDTO.setProperty(dto);
    }
    if (billing.getUnit() != null) {
      billingDetailDTO.setUnit(UnitDetailDTO.mapToDTO(billing.getUnit()));
    }
    billingDetailDTO.setStatusBilling(billing.getStatusBilling());
    billingDetailDTO.setNominal(billing.getNominal());
    apiResponse.setSuccess(true);
    apiResponse.setMessage("Transaksi berhasil");
    apiResponse.setData(billingDetailDTO);
    return apiResponse;
  }

  public ApiResponse<Void> approvalBooking(Long id, ApprovalDTO approvalDTO) {
    ApiResponse<Void> apiResponse = new ApiResponse<>();
    BillingModel billing = billingRepository.findById(id).orElse(null);
    if (billing == null) {
      throw new CustomExceptions(HttpStatus.NOT_FOUND, "Tagihan tidak ditemukkan", null);
    }
    UnitModel unit = billing.getUnit();

    if (approvalDTO.getDecision().equals(ApprovalStatus.APPROVE)) {
      billing.setStatusBilling(BillingStatus.PENDING_PAYMENT);
      NotificationDTO notificationRequest = new NotificationDTO();
      notificationRequest.setUnitId(unit.getId());
      notificationRequest.setPropertyId(id);
      notificationRequest.setUserId(billing.getOccupant().getId());
      notificationRequest.setBillingId(billing.getId());
      notificationRequest.setNotificationCategory("BOOKING-APPROVED");
      notificationRequest.setContent(
          "Permintaan booking kamar anda telah disetujui. Silahkan lakukan pembayaran tagihan booking kamar anda");
      notificationService.createNotification(notificationRequest);
    } else {
      unit.setAvailable(true);
      billing.setStatusBilling(BillingStatus.BOOKING_REJECTED);
      NotificationDTO notificationRequest = new NotificationDTO();
      notificationRequest.setUnitId(unit.getId());
      notificationRequest.setPropertyId(id);
      notificationRequest.setUserId(billing.getOccupant().getId());
      notificationRequest.setBillingId(billing.getId());
      notificationRequest.setNotificationCategory("BOOKING-REJECTED");
      notificationRequest.setContent(
          "Permintaan booking kamar anda telah ditolak. Silahkan hubungi pemilik untuk informasi lebih lanjut");
      notificationService.createNotification(notificationRequest);
    }
    unitRepository.save(unit);
    billingRepository.save(billing);
    apiResponse.setSuccess(true);
    apiResponse.setMessage("Approval billing berhasil");
    return apiResponse;
  }

  public ApiResponse<String> bookingPayment(Long id, Integer usedPoint) {
    ApiResponse<String> apiResponse = new ApiResponse<>();
    Midtrans.clientKey = "SB-Mid-client-q7B-ww2fj54K6UWS";
    Midtrans.serverKey = "SB-Mid-server-IJ6nXGH_BrBHEbabGlvQBl-0";
    Midtrans.isProduction = false;
    Midtrans.enableLog = true;
    ObjectMapper objectMapper = JsonMapper.builder().findAndAddModules().build();
    PaymentRequestDTO paymentRequestDTO = new PaymentRequestDTO();
    UserModel user = userService.getUser();
    BillingModel billing = billingRepository.findById(id)
        .orElseThrow(() -> new CustomExceptions(HttpStatus.NOT_FOUND, "Billing tidak ditemukan", null));
    BigDecimal totalBayar = billing.getNominal();
    if (usedPoint != null && usedPoint > 0) {
      if (user.getAccumulatedPoint() == null || usedPoint > user.getAccumulatedPoint()) {
        throw new CustomExceptions(HttpStatus.BAD_REQUEST, "Used point tidak valid atau melebihi point yang dimiliki", null);
      }
      BigDecimal pointValue = BigDecimal.valueOf(usedPoint);
      totalBayar = totalBayar.subtract(pointValue);
      if (totalBayar.compareTo(BigDecimal.ZERO) < 0) {
        totalBayar = BigDecimal.ZERO;
      }
      billing.setUsedPoint(usedPoint);
      billingRepository.save(billing);
    }
    if (user.getId() != billing.getOccupant().getId()) {
      throw new CustomExceptions(HttpStatus.UNAUTHORIZED, "Anda tidak memiliki akses", null);
    }
    CustomerDetailDTO customer = CustomerDetailDTO.fromUserModel(user);
    paymentRequestDTO.setCustomerDetails(customer);
    List<ItemDetailDTO> itemDetails = new ArrayList<>();
    ItemDetailDTO itemDetailDTO = ItemDetailDTO.fromBillingModel(billing);
    itemDetailDTO.setPrice(totalBayar);
    itemDetails.add(itemDetailDTO);
    paymentRequestDTO.setItemDetails(itemDetails);
    TransactionDetailDTO transactionDetailDTO = new TransactionDetailDTO();
    transactionDetailDTO.setOrderId(billing.getReferenceNo());
    paymentRequestDTO.setTransactionDetail(transactionDetailDTO);
    paymentRequestDTO.calculateGrossAmount();

    Map<String, Object> requestBody = objectMapper.convertValue(paymentRequestDTO,
        new TypeReference<Map<String, Object>>() {
        });
    try {
      String token = SnapApi.createTransactionToken(requestBody);
      apiResponse.setSuccess(true);
      apiResponse.setMessage("Token berhasil digenerate");
      apiResponse.setData(token);
    } catch (MidtransError e) {
      e.printStackTrace();
    }
    return new ApiResponse<>(apiResponse.isSuccess(), apiResponse.getMessage(), (String) apiResponse.getData());
  }

  public ApiResponse<List<BillingDetailDTO>> getAllBillingHistories() {
    ApiResponse<List<BillingDetailDTO>> apiResponse = new ApiResponse<>();
    UserModel user = userService.getUser();
    List<BillingModel> billingList = billingRepository.findAllByOccupantAndStatusBillingIsNot(user,
        BillingStatus.PENDING_PAYMENT);
    List<BillingDetailDTO> billingDTOs = new ArrayList<>();
    for (BillingModel billing : billingList) {
      BillingDetailDTO billingDetailDTO = new BillingDetailDTO();
      billingDetailDTO.setBookingId(billing.getId());
      billingDetailDTO.setReferenceNo(billing.getReferenceNo());
      billingDetailDTO.setMultiPayReferenceNo(billing.getMultiPayReferenceNo());
      billingDetailDTO.setBillingType(billing.getBillingType());
      billingDetailDTO.setDueDate(billing.getDueDate());
      billingDetailDTO.setLastMidtransStatus(billing.getLastMidtransStatus());
      if (billing.getOccupant() != null) {
        billingDetailDTO.setOccupant(UserDetailDTO.mapToDTO(billing.getOccupant()));
      }
      if (billing.getProperty() != null) {
        PropertyDetailDTO dto = PropertyDetailDTO.mapToDTO(billing.getProperty());
        billingDetailDTO.setProperty(dto);
      }
      if (billing.getUnit() != null) {
        billingDetailDTO.setUnit(UnitDetailDTO.mapToDTO(billing.getUnit()));
      }
      billingDetailDTO.setStatusBilling(billing.getStatusBilling());
      billingDetailDTO.setNominal(billing.getNominal());
      billingDTOs.add(billingDetailDTO);
    }
    apiResponse.setSuccess(true);
    apiResponse.setMessage("Transaksi berhasil");
    apiResponse.setData(billingDTOs);
    return apiResponse;
  }

  public ApiResponse<List<BillingDetailDTO>> getAllPendingBill() {
    ApiResponse<List<BillingDetailDTO>> apiResponse = new ApiResponse<>();
    UserModel user = userService.getUser();
    List<BillingModel> billingList = billingRepository.findAllByOccupantAndStatusBilling(user,
        BillingStatus.PENDING_PAYMENT);
    List<BillingDetailDTO> billingDTOs = new ArrayList<>();
    for (BillingModel billing : billingList) {
      BillingDetailDTO billingDetailDTO = new BillingDetailDTO();
      billingDetailDTO.setBookingId(billing.getId());
      billingDetailDTO.setReferenceNo(billing.getReferenceNo());
      billingDetailDTO.setMultiPayReferenceNo(billing.getMultiPayReferenceNo());
      billingDetailDTO.setBillingType(billing.getBillingType());
      billingDetailDTO.setDueDate(billing.getDueDate());
      billingDetailDTO.setLastMidtransStatus(billing.getLastMidtransStatus());
      if (billing.getOccupant() != null) {
        billingDetailDTO.setOccupant(UserDetailDTO.mapToDTO(billing.getOccupant()));
      }
      if (billing.getProperty() != null) {
        PropertyDetailDTO dto = PropertyDetailDTO.mapToDTO(billing.getProperty());
        billingDetailDTO.setProperty(dto);
      }
      if (billing.getUnit() != null) {
        billingDetailDTO.setUnit(UnitDetailDTO.mapToDTO(billing.getUnit()));
      }
      billingDetailDTO.setStatusBilling(billing.getStatusBilling());
      billingDetailDTO.setNominal(billing.getNominal());
      billingDTOs.add(billingDetailDTO);
    }
    apiResponse.setSuccess(true);
    apiResponse.setMessage("Transaksi berhasil");
    apiResponse.setData(billingDTOs);
    return apiResponse;
  }

  @Transactional
  public ApiResponse<BillingRequestDTO> createMonthlyBill(BillingRequestDTO billingDTO) {
    ApiResponse<BillingRequestDTO> apiResponse = new ApiResponse<>();
    UnitModel unit = unitRepository.findById(billingDTO.getUnitId()).orElse(null);
    if (unit == null) {
      throw new CustomExceptions(HttpStatus.NOT_FOUND, "Kamar tidak ditemukkan", null);
    }
    PropertyModel property = unit.getProperty();
    UserModel user = unit.getOccupant();
    BillingModel billingModel = new BillingModel();
    billingModel.setOccupant(user);
    billingModel.setProperty(property);
    billingModel.setUnit(unit);
    billingModel.setNominal(unit.getPrice());
    billingModel.setStatusBilling(BillingStatus.PENDING_PAYMENT);
    billingModel.setReferenceNo("MONTHLY_BILL-" + UUID.randomUUID().toString());
    billingModel.setBillingType("MONTHLY_BILL");
    LocalDate dueDate = LocalDate.now().plusMonths(1);
    billingModel.setDueDate(dueDate);
    billingRepository.save(billingModel);
    apiResponse.setData(billingDTO);
    apiResponse.setMessage("Tagihan bulanan berhasil dibuat");
    apiResponse.setSuccess(true);
    return apiResponse;
  }

  public ApiResponse<String> payMonthlyBill(List<Long> ids, Integer usedPoint) {
    ApiResponse<String> apiResponse = new ApiResponse<>();
    Midtrans.clientKey = "SB-Mid-client-q7B-ww2fj54K6UWS";
    Midtrans.serverKey = "SB-Mid-server-IJ6nXGH_BrBHEbabGlvQBl-0";
    Midtrans.isProduction = false;
    Midtrans.enableLog = true;
    ObjectMapper objectMapper = JsonMapper.builder().findAndAddModules().build();
    PaymentRequestDTO paymentRequestDTO = new PaymentRequestDTO();
    UserModel user = userService.getUser();
    List<ItemDetailDTO> itemDetails = new ArrayList<>();
    String multiPayReferenceNo = null;
    if (ids.size() > 1) {
      multiPayReferenceNo = "MUL-MTH_BILL-" + UUID.randomUUID().toString();
    }
    BigDecimal totalBayar = BigDecimal.ZERO;
    for (int i = 0; i < ids.size(); i++) {
      Long id = ids.get(i);
      BillingModel billing = billingRepository.findById(id).orElse(null);
      if (billing == null) {
        throw new CustomExceptions(HttpStatus.NOT_FOUND, "Tagihan tidak ditemukkan", null);
      }
      if (user.getId() != billing.getOccupant().getId()) {
        throw new CustomExceptions(HttpStatus.UNAUTHORIZED, "Anda tidak memiliki akses", null);
      }
      billing.setMultiPayReferenceNo(multiPayReferenceNo);
      // Set usedPoint hanya pada billing pertama jika ada lebih dari satu ID
      if (usedPoint != null && usedPoint > 0 && i == 0) {
        if (user.getAccumulatedPoint() == null || usedPoint > user.getAccumulatedPoint()) {
          throw new CustomExceptions(HttpStatus.BAD_REQUEST, "Used point tidak valid atau melebihi point yang dimiliki", null);
        }
        billing.setUsedPoint(usedPoint);
        billing.setNominal(billing.getNominal().subtract(BigDecimal.valueOf(usedPoint)));
      }
      billingRepository.save(billing);
      if (ids.size() == 1) {
        multiPayReferenceNo = billing.getReferenceNo();
      }
      ItemDetailDTO itemDetailDTO = ItemDetailDTO.fromBillingModel(billing);
      itemDetails.add(itemDetailDTO);
      totalBayar = totalBayar.add(billing.getNominal());
    }
    // Hitung totalBayar setelah pengurangan point
    if (usedPoint != null && usedPoint > 0) {
      BigDecimal pointValue = BigDecimal.valueOf(usedPoint);
      totalBayar = totalBayar.subtract(pointValue);
      if (totalBayar.compareTo(BigDecimal.ZERO) < 0) {
        totalBayar = BigDecimal.ZERO;
      }
    }
    paymentRequestDTO.setItemDetails(itemDetails);
    TransactionDetailDTO transactionDetailDTO = new TransactionDetailDTO();
    transactionDetailDTO.setOrderId(multiPayReferenceNo);
    paymentRequestDTO.setTransactionDetail(transactionDetailDTO);
    paymentRequestDTO.calculateGrossAmount();

    Map<String, Object> requestBody = objectMapper.convertValue(paymentRequestDTO,
        new TypeReference<Map<String, Object>>() {
        });
    try {
      String token = SnapApi.createTransactionToken(requestBody);
      apiResponse.setSuccess(true);
      apiResponse.setMessage("Token berhasil digenerate");
      apiResponse.setData(token);
    } catch (MidtransError e) {
      e.printStackTrace();
    }
    return new ApiResponse<>(apiResponse.isSuccess(), apiResponse.getMessage(), (String) apiResponse.getData());
  }

  @Transactional
  public ApiResponse<Void> createMonthlyBillsForAllOccupants() {
    List<UnitModel> units = unitRepository.findAll();
    int createdCount = 0;
    for (UnitModel unit : units) {
      if (unit.getOccupant() != null) {
        BillingRequestDTO billingDTO = new BillingRequestDTO();
        billingDTO.setUnitId(unit.getId());
        createMonthlyBill(billingDTO);
        createdCount++;
      }
    }
    ApiResponse<Void> response = new ApiResponse<>();
    response.setSuccess(true);
    response.setMessage("Tagihan bulanan berhasil dibuat untuk " + createdCount + " penghuni.");
    return response;
  }

  @Transactional
  public ApiResponse<Void> updateMidtransStatus(String orderId, String transactionStatus, String ref) {
    ApiResponse<Void> apiResponse = new ApiResponse<>();
    if (orderId.startsWith("MUL-MTH_BILL-")) {
      List<BillingModel> billingList = billingRepository.findAllByMultiPayReferenceNoAndStatusBillingIsNot(orderId,
          BillingStatus.PAID);
      boolean pointDeducted = false;
      for (BillingModel billing : billingList) {
        if (transactionStatus.equals("settlement")) {
          billing.setStatusBilling(BillingStatus.PAID);
          NotificationDTO notificationRequest = new NotificationDTO();
          notificationRequest.setBillingId(billing.getId());
          notificationRequest.setUserId(billing.getOccupant().getId());
          notificationRequest.setPropertyId(billing.getProperty().getId());
          notificationRequest.setUnitId(billing.getUnit().getId());
          notificationRequest.setNotificationCategory("PAYMENT");
          notificationRequest.setContent("Pembayaran tagihan bulanan anda telah berhasil");
          notificationService.createNotification(notificationRequest);
          // Kurangi accumulated point sesuai usedPoint di billing (hanya sekali untuk multi bill)
          Integer usedPoint = billing.getUsedPoint();
          if (!pointDeducted && usedPoint != null && usedPoint > 0) {
            Integer currentPoint = billing.getOccupant().getAccumulatedPoint() != null ? billing.getOccupant().getAccumulatedPoint() : 0;
            billing.getOccupant().setAccumulatedPoint(currentPoint - usedPoint);
            userRepository.save(billing.getOccupant());
            pointDeducted = true;
          }
        }
        billingRepository.save(billing);
        List<BillingModel> pendingBillingList = billingRepository
            .findAllByOccupantAndStatusBillingIsNot(billing.getOccupant(), BillingStatus.PAID);
        if (pendingBillingList.isEmpty()) {
          createMonthlyBill(new BillingRequestDTO(billing.getUnit().getId()));
        }
      }
    }

    if (orderId.startsWith("BOOKING-")) {
      BillingModel billing = billingRepository.findByReferenceNoAndStatusBillingIsNot(orderId,
          BillingStatus.PAID);
      if (billing == null) {
        throw new CustomExceptions(HttpStatus.NOT_FOUND, "Tagihan tidak ditemukkan", null);
      }
      if (transactionStatus.equals("settlement")) {
        billing.setStatusBilling(BillingStatus.PAID);
        UnitModel unit = billing.getUnit();
        unit.setOccupant(billing.getOccupant());
        unit.setUserUpdate(billing.getOccupant().getEmail());
        unit.setAvailable(false);
        unitRepository.save(unit);
        NotificationDTO notificationRequest = new NotificationDTO();
        notificationRequest.setBillingId(billing.getId());
        notificationRequest.setPropertyId(billing.getProperty().getId());
        notificationRequest.setUnitId(billing.getUnit().getId());
        notificationRequest.setUserId(billing.getOccupant().getId());
        notificationRequest.setNotificationCategory("PAYMENT");
        notificationRequest.setContent("Pembayaran booking kamar anda telah berhasil");
        notificationService.createNotification(notificationRequest);
        // Kurangi accumulated point sesuai usedPoint di billing
        Integer usedPoint = billing.getUsedPoint();
        if (usedPoint != null && usedPoint > 0) {
          Integer currentPoint = billing.getOccupant().getAccumulatedPoint() != null ? billing.getOccupant().getAccumulatedPoint() : 0;
          billing.getOccupant().setAccumulatedPoint(currentPoint - usedPoint);
          userRepository.save(billing.getOccupant());
        }
        // Tambahkan laporan keuangan
        FinancialDTO financialDTO = new FinancialDTO();
        financialDTO.setPropertyId(billing.getProperty().getId());
        financialDTO.setUnitId(billing.getUnit().getId());
        financialDTO.setIncome(billing.getNominal().doubleValue());
        financialDTO.setDescription("Pembayaran booking kamar");
        financialDTO.setDate(LocalDate.now());
        financialService.createReport(financialDTO);
      }
      billingRepository.save(billing);

      UnitReferrenceModel unitReferrenceModel = billing.getUnitReference();
      if (unitReferrenceModel != null) {
        UserModel referrer = unitReferrenceModel.getReferrerId();
        if (unitReferrenceModel.getIsValid() == true) {
          unitReferrenceModel.setIsValid(false);
          unitReferrenceRepository.save(unitReferrenceModel);
          if(referrer.getAccumulatedPoint() == null){
              referrer.setAccumulatedPoint(10000);
            } else {
              referrer.setAccumulatedPoint(referrer.getAccumulatedPoint() + 10000);
            }
            userRepository.save(referrer);
        }
      }

      // after successfully paid, create monthly bill
      createMonthlyBill(new BillingRequestDTO(billing.getUnit().getId()));
    }
    if (orderId.startsWith("MONTHLY_BILL-")) {
      BillingModel billing = billingRepository.findByReferenceNoAndStatusBillingIsNot(orderId,
          BillingStatus.PAID);
      if (billing == null) {
        throw new CustomExceptions(HttpStatus.NOT_FOUND, "Tagihan tidak ditemukkan", null);
      }
      if (transactionStatus.equals("settlement")) {
        billing.setStatusBilling(BillingStatus.PAID);
        NotificationDTO notificationRequest = new NotificationDTO();
        notificationRequest.setBillingId(billing.getId());
        notificationRequest.setPropertyId(billing.getProperty().getId());
        notificationRequest.setUnitId(billing.getUnit().getId());
        notificationRequest.setUserId(billing.getOccupant().getId());
        notificationRequest.setNotificationCategory("PAYMENT");
        notificationRequest.setContent("Pembayaran tagihan bulanan anda telah berhasil");
        notificationService.createNotification(notificationRequest);
        // Kurangi accumulated point sesuai usedPoint di billing
        Integer usedPoint = billing.getUsedPoint();
        if (usedPoint != null && usedPoint > 0) {
          Integer currentPoint = billing.getOccupant().getAccumulatedPoint() != null ? billing.getOccupant().getAccumulatedPoint() : 0;
          billing.getOccupant().setAccumulatedPoint(currentPoint - usedPoint);
          userRepository.save(billing.getOccupant());
        }
        // Tambahkan laporan keuangan
        FinancialDTO financialDTO = new FinancialDTO();
        financialDTO.setPropertyId(billing.getProperty().getId());
        financialDTO.setUnitId(billing.getUnit().getId());
        financialDTO.setIncome(billing.getNominal().doubleValue());
        financialDTO.setDescription("Pembayaran tagihan bulanan");
        financialDTO.setDate(LocalDate.now());
        financialService.createReport(financialDTO);
      }
      billingRepository.save(billing);
      List<BillingModel> pendingBillingList = billingRepository.findAllByOccupantAndStatusBillingIsNot(
          billing.getOccupant(),
          BillingStatus.PAID);
      if (pendingBillingList.isEmpty()) {
        createMonthlyBill(new BillingRequestDTO(billing.getUnit().getId()));
      }
    }
    apiResponse.setSuccess(true);
    apiResponse.setMessage("Tagihan berhasil diperbarui");
    return apiResponse;
  }

}
