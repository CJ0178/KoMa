package com.skripsi.koma.dto.notification;

import java.util.Date;

import org.springframework.beans.BeanUtils;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.skripsi.koma.dto.user.UserDetailDTO;
import com.skripsi.koma.model.notification.NotificationModel;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(Include.NON_NULL)
public class NotificationDTO {
  @JsonProperty(access = JsonProperty.Access.READ_ONLY)
  private Long id;

  @JsonProperty(value = "user_id")
  private Long userId;

  @JsonProperty(value = "property_id")
  private Long propertyId;

  @JsonProperty(value = "unit_id")
  private Long unitId;

  @JsonProperty(value = "billing_id")
  private Long billingId;

  @JsonProperty(value = "property_keeper_id")
  private Long propertyKeeperId;

  @JsonProperty(value = "notification_category")
  private String notificationCategory;

  @JsonProperty(value = "content")
  private String content;

  @JsonProperty(value = "user_detail", access = JsonProperty.Access.READ_ONLY)
  private UserDetailDTO userDetail;

  @JsonProperty(value = "user_create")
  private String userCreate;

  @JsonProperty(value = "date_create", access = JsonProperty.Access.READ_ONLY)
  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
  private Date dateCreate;

  @JsonProperty(value = "date_update", access = JsonProperty.Access.READ_ONLY)
  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
  private Date dateUpdate;

  @JsonProperty(value = "allow_approve")
  private Boolean allowApprove;

  @JsonProperty(value = "status_approve")
  private String statusApprove;

  public static NotificationDTO mapToDTO(NotificationModel notification) {
    if (notification == null) {
      return null;
    }
    NotificationDTO dto = new NotificationDTO();
    BeanUtils.copyProperties(notification, dto);
    dto.setId(notification.getId());
    if (notification.getProperty() != null) {
      dto.setPropertyId(notification.getProperty().getId());
    }
    if (notification.getUnit() != null) {
      dto.setUnitId(notification.getUnit().getId());
    }
    if (notification.getBilling() != null) {
      dto.setBillingId(notification.getBilling().getId());
    }
    if (notification.getPropertyKeeper() != null) {
      dto.setPropertyKeeperId(notification.getPropertyKeeper().getId());
    }
    if(notification.getUser() != null) {
      dto.setUserId(notification.getUser().getId());
      dto.setUserDetail(UserDetailDTO.mapToDTO(notification.getUser()));
    }
    dto.setUserCreate(notification.getUserCreate());
    dto.setDateCreate(notification.getDateCreate());
    dto.setDateUpdate(notification.getDateUpdate());
    return dto;
  }
}
