package com.skripsi.koma.dto.billing;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonFormat.Shape;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.skripsi.koma.dto.property.PropertyDetailDTO;
import com.skripsi.koma.dto.unit.UnitDetailDTO;
import com.skripsi.koma.dto.user.UserDetailDTO;
import com.skripsi.koma.enums.BillingStatus;

import lombok.Data;

@Data
public class BillingDetailDTO {
  @JsonProperty("booking_id")
  private Long bookingId;
  @JsonProperty("occupant")
  private UserDetailDTO occupant;
  @JsonProperty("property")
  private PropertyDetailDTO property;
  @JsonProperty("unit")
  private UnitDetailDTO unit;
  @JsonProperty("status_billing")
  private BillingStatus statusBilling;
  @JsonProperty("nominal")
  private BigDecimal nominal;
  @JsonProperty("reference_no")
  private String referenceNo;
  @JsonProperty("multipay_reference_no")
  private String multiPayReferenceNo;
  @JsonProperty("billing_type")
  private String billingType;
  @JsonProperty("due_date")
  @JsonFormat(shape = Shape.STRING, pattern = "yyyy-MM-dd")
  private LocalDate dueDate;
  @JsonProperty("last_midtrans_status")
  private String lastMidtransStatus;
}
