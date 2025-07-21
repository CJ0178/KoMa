package com.skripsi.koma.dto.payment;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CreditCardDTO {

  private Boolean secure = true;

}
