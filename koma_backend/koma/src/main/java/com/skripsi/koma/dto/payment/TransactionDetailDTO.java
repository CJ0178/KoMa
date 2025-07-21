package com.skripsi.koma.dto.payment;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TransactionDetailDTO {
  @JsonProperty("order_id")
  private String orderId;
  @JsonProperty("gross_amount")
  private BigDecimal grossAmount;
}
