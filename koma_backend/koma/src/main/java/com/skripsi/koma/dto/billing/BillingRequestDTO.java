package com.skripsi.koma.dto.billing;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BillingRequestDTO {
  @JsonProperty("unit_id")
  private Long unitId;
}
