package com.skripsi.koma.service.notification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.skripsi.koma.dto.ApiResponse;
import com.skripsi.koma.dto.notification.NotificationDTO;
import com.skripsi.koma.enums.BillingStatus;
import com.skripsi.koma.model.billing.BillingModel;
import com.skripsi.koma.model.notification.NotificationModel;
import com.skripsi.koma.model.property.PropertyKeeperModel;
import com.skripsi.koma.model.property.PropertyModel;
import com.skripsi.koma.model.unit.UnitModel;
import com.skripsi.koma.model.user.UserModel;
import com.skripsi.koma.repository.billing.BillingRepository;
import com.skripsi.koma.repository.notification.NotificationRepository;
import com.skripsi.koma.repository.property.PropertyKeeperRepository;
import com.skripsi.koma.repository.property.PropertyRepository;
import com.skripsi.koma.repository.unit.UnitRepository;
import com.skripsi.koma.service.user.UserService;
import com.skripsi.koma.util.CustomExceptions;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

  private final NotificationRepository notificationRepository;
  private final PropertyRepository propertyRepository;
  private final UnitRepository unitRepository;
  private final BillingRepository billingRepository;
  private final UserService userService;
  private final PropertyKeeperRepository propertyKeeperRepository;

  public ApiResponse<List<NotificationDTO>> getAllByPropertyId(Long propertyId) {
    List<NotificationModel> notificationList = notificationRepository.findByPropertyId(propertyId);
    // Urutkan by dateCreate atau dateUpdate terbaru
    notificationList.sort((n1, n2) -> {
      var d1 = n1.getDateUpdate() != null ? n1.getDateUpdate() : n1.getDateCreate();
      var d2 = n2.getDateUpdate() != null ? n2.getDateUpdate() : n2.getDateCreate();
      return d2.compareTo(d1);
    });
    List<NotificationDTO> dtoList = new ArrayList<>();
    for (NotificationModel notification : notificationList) {
      NotificationDTO dto = NotificationDTO.mapToDTO(notification);
      if ("APPROVAL-BOOKING".equals(notification.getNotificationCategory())) {
        BillingModel billing = billingRepository.findById(notification.getBilling().getId()).orElse(null);
        if (billing != null) {
          dto.setStatusApprove(billing.getStatusBilling().name());
          if (billing.getStatusBilling() == BillingStatus.BOOKING_REQUEST) {
            dto.setAllowApprove(true);
          }
        }
      }
      if ("APPROVAL-KEEPER".equals(notification.getNotificationCategory())) {
        PropertyKeeperModel propertyKeeper = propertyKeeperRepository.findById(notification.getPropertyKeeper().getId())
            .orElse(null);
        if (propertyKeeper != null) {
          if (propertyKeeper.getApprovalStatus() != null) {
            dto.setStatusApprove(propertyKeeper.getApprovalStatus().name());
          } else {
            dto.setAllowApprove(true);
          }
        }
      }
      dtoList.add(NotificationDTO.mapToDTO(notification));
    }
    return new ApiResponse<>(true, "Daftar notifikasi berhasil diambil", dtoList);
  }

  public ApiResponse<List<NotificationDTO>> getAllByUserId() {
    UserModel user = userService.getCurrentUser();
    String userRole = user.getRoleId().getRoleName().name();
    List<NotificationModel> notificationList = new ArrayList<>();

    // Notifikasi berdasarkan user id (langsung)
    notificationList.addAll(notificationRepository.findByUserId(user.getId()));

    if (userRole.equals("PEMILIK_KOS")) {
      // Ambil semua property yang dimiliki
      List<PropertyModel> properties = propertyRepository.findAllByOwnerId(user.getId());
      List<Long> propertyIds = properties.stream().map(PropertyModel::getId).toList();
      if (!propertyIds.isEmpty()) {
        List<NotificationModel> propertyNotifs = notificationRepository.findByPropertyIdIn(propertyIds);
        propertyNotifs.removeIf(n -> n.getUser() != null);
        notificationList.addAll(propertyNotifs);
        // Ambil semua unit dari property yang dimiliki
        List<UnitModel> units = unitRepository.findAllByPropertyIdIn(propertyIds);
        List<Long> unitIds = units.stream().map(UnitModel::getId).toList();
        if (!unitIds.isEmpty()) {
          List<NotificationModel> unitNotifs = notificationRepository.findByUnitIdIn(unitIds);
          unitNotifs.removeIf(n -> n.getUser() != null);
          notificationList.addAll(unitNotifs);
        }
      }
    } else if (userRole.equals("PENJAGA_KOS")) {
      // Ambil semua property yang dijaga
      List<PropertyKeeperModel> keepers = propertyKeeperRepository.findAllByKeeperId(user.getId());
      List<Long> propertyIds = keepers.stream().map(pk -> pk.getProperty().getId()).distinct().toList();
      if (!propertyIds.isEmpty()) {
        List<NotificationModel> propertyNotifs = notificationRepository.findByPropertyIdIn(propertyIds);
        propertyNotifs.removeIf(n -> n.getUser() != null);
        notificationList.addAll(propertyNotifs);
        // Ambil semua unit dari property yang dijaga
        List<UnitModel> units = unitRepository.findAllByPropertyIdIn(propertyIds);
        List<Long> unitIds = units.stream().map(UnitModel::getId).toList();
        if (!unitIds.isEmpty()) {
          List<NotificationModel> unitNotifs = notificationRepository.findByUnitIdIn(unitIds);
          unitNotifs.removeIf(n -> n.getUser() != null);
          notificationList.addAll(unitNotifs);
        }
      }
    } else if (userRole.equals("PENGHUNI")) {
      // Ambil unit yang dihuni user
      List<UnitModel> units = unitRepository.findAllByOccupantId(user.getId());
      List<Long> unitIds = units.stream().map(UnitModel::getId).toList();
      List<Long> propertyIds = units.stream().map(unit -> unit.getProperty().getId()).distinct().toList();
      if (!propertyIds.isEmpty()) {
        List<NotificationModel> propertyNotifs = notificationRepository.findByPropertyIdIn(propertyIds);
        propertyNotifs.removeIf(n -> n.getUser() != null);
        notificationList.addAll(propertyNotifs);
      }
      if (!unitIds.isEmpty()) {
        List<NotificationModel> unitNotifs = notificationRepository.findByUnitIdIn(unitIds);
        unitNotifs.removeIf(n -> n.getUser() != null);
        notificationList.addAll(unitNotifs);
      }
    }

    // Hilangkan duplikat notifikasi (berdasarkan id)
    List<Long> seenIds = new ArrayList<>();
    List<NotificationDTO> dtoList = new ArrayList<>();
    // Urutkan by dateCreate atau dateUpdate terbaru
    notificationList.sort((n1, n2) -> {
      var d1 = n1.getDateUpdate() != null ? n1.getDateUpdate() : n1.getDateCreate();
      var d2 = n2.getDateUpdate() != null ? n2.getDateUpdate() : n2.getDateCreate();
      return d2.compareTo(d1);
    });
    for (NotificationModel notification : notificationList) {
      if (!seenIds.contains(notification.getId())) {
        NotificationDTO dto = NotificationDTO.mapToDTO(notification);
        if ("APPROVAL-BOOKING".equals(notification.getNotificationCategory())) {
          BillingModel billing = billingRepository.findById(notification.getBilling().getId()).orElse(null);
          if (billing != null) {
            dto.setStatusApprove(billing.getStatusBilling().name());
            if (billing.getStatusBilling() == BillingStatus.BOOKING_REQUEST) {
              dto.setAllowApprove(true);
            }
          }
        }
        if ("APPROVAL-KEEPER".equals(notification.getNotificationCategory())) {
          if(notification.getPropertyKeeper()!=null){
            PropertyKeeperModel propertyKeeper = propertyKeeperRepository
                .findById(notification.getPropertyKeeper().getId())
                .orElse(null);
            if (propertyKeeper != null) {
              if (propertyKeeper.getApprovalStatus() != null) {
                dto.setStatusApprove(propertyKeeper.getApprovalStatus().name());
              } else {
                dto.setAllowApprove(true);
              }
            }
          }
        }
        dtoList.add(dto);
        seenIds.add(notification.getId());
      }
    }
    if (dtoList.isEmpty()) {
      throw new CustomExceptions(HttpStatus.NOT_FOUND, "Notifikasi tidak ditemukan", null);
    }
    return new ApiResponse<>(true, "Daftar notifikasi berhasil diambil", dtoList);
  }

  public ApiResponse<NotificationDTO> getNotificationDetail(Long id) {
    NotificationModel notification = notificationRepository.findById(id)
        .orElseThrow(() -> new CustomExceptions(HttpStatus.NOT_FOUND,
            "Notifikasi dengan ID " + id + " tidak ditemukan", null));
    return new ApiResponse<>(true, "Notifikasi berhasil ditemukan", NotificationDTO.mapToDTO(notification));
  }

  public ApiResponse<NotificationDTO> createNotification(NotificationDTO notificationRequest) {
    NotificationModel notification = new NotificationModel();
    UserModel user = userService.getCurrentUser();
    if (notificationRequest.getUserId() != null) {
      UserModel recipient = userService.getUserById(notificationRequest.getUserId());
      notification.setUser(recipient);
    }
    if (notificationRequest.getPropertyId() != null) {
      PropertyModel property = propertyRepository.findById(notificationRequest.getPropertyId()).orElse(null);
      notification.setProperty(property);
    }
    if (notificationRequest.getUnitId() != null) {
      UnitModel unit = unitRepository.findById(notificationRequest.getUnitId()).orElse(null);
      notification.setUnit(unit);
    }
    if (notificationRequest.getBillingId() != null) {
      BillingModel billingModel = billingRepository.findById(notificationRequest.getBillingId()).orElse(null);
      notification.setBilling(billingModel);
    }
    if (notificationRequest.getPropertyKeeperId() != null) {
      PropertyKeeperModel propertyKeeper = propertyKeeperRepository.findById(notificationRequest.getPropertyKeeperId())
          .orElse(null);
      notification.setPropertyKeeper(propertyKeeper);
    }
    notification.setNotificationCategory(notificationRequest.getNotificationCategory());
    notification.setContent(notificationRequest.getContent());
    if (user != null) {
      notification.setUserCreate(user.getEmail());
    }

    NotificationModel savedNotification = notificationRepository.save(notification);
    return new ApiResponse<>(true, "Notifikasi berhasil dibuat", NotificationDTO.mapToDTO(savedNotification));
  }

  public ApiResponse<NotificationDTO> updateNotification(Long id, NotificationDTO notificationRequest) {
    UserModel user = userService.getCurrentUser();
    NotificationModel notification = notificationRepository.findById(id)
        .orElseThrow(() -> new CustomExceptions(HttpStatus.NOT_FOUND,
            "Notifikasi dengan ID " + id + " tidak ditemukan", null));
    if (notificationRequest.getPropertyId() != null) {
      PropertyModel property = propertyRepository.findById(notificationRequest.getPropertyId()).orElse(null);
      notification.setProperty(property);
    }
    if (notificationRequest.getUnitId() != null) {
      UnitModel unit = unitRepository.findById(notificationRequest.getUnitId()).orElse(null);
      notification.setUnit(unit);
    }
    if (notificationRequest.getBillingId() != null) {
      BillingModel billingModel = billingRepository.findById(notificationRequest.getBillingId()).orElse(null);
      notification.setBilling(billingModel);
    }
    notification.setNotificationCategory(notificationRequest.getNotificationCategory());
    notification.setContent(notificationRequest.getContent());
    notification.setUserUpdate(user.getEmail());

    NotificationModel updatedNotification = notificationRepository.save(notification);
    return new ApiResponse<>(true, "Notifikasi berhasil diperbarui", NotificationDTO.mapToDTO(updatedNotification));
  }

  public ApiResponse<Void> deleteNotification(Long id) {
    NotificationModel notification = notificationRepository.findById(id)
        .orElseThrow(() -> new CustomExceptions(HttpStatus.NOT_FOUND,
            "Notifikasi dengan ID " + id + " tidak ditemukan", null));
    notificationRepository.delete(notification);
    return new ApiResponse<>(true, "Notifikasi berhasil dihapus", null);
  }

  @Scheduled(cron = "0 0 9 * * ?") // Set to run every day at 09:00 AM
  public ApiResponse<Void> sendPendingBillReminder() {
    LocalDate next7days = LocalDate.now().plusDays(7);
    List<BillingModel> pendingBillList = billingRepository
        .findAllByStatusBillingAndDueDate(BillingStatus.PENDING_PAYMENT, next7days);
    for (BillingModel billing : pendingBillList) {
      NotificationDTO notificationRequest = new NotificationDTO();
      notificationRequest.setBillingId(billing.getId());
      notificationRequest.setPropertyId(billing.getProperty().getId());
      notificationRequest.setUnitId(billing.getUnit().getId());
      notificationRequest.setUserId(billing.getOccupant().getId());
      notificationRequest.setNotificationCategory("BILLING");
      notificationRequest
          .setContent("Tagihan Anda untuk pembayaran " + billing.getBillingType() + " jatuh tempo dalam waktu 7 hari.");
      createNotification(notificationRequest);
    }
    return new ApiResponse<>(true, "Notifikasi berhasil dikirim", null);
  }

}
