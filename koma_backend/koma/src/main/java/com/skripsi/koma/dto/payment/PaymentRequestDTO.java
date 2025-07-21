package com.skripsi.koma.dto.payment;

import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(value = Include.NON_NULL)
public class PaymentRequestDTO {

  @JsonProperty("transaction_details")
  private TransactionDetailDTO transactionDetail = new TransactionDetailDTO();

  @JsonProperty("credit_card")
  private CreditCardDTO creditCard = new CreditCardDTO();

  @JsonProperty("customer_details")
  private CustomerDetailDTO customerDetails;

  @JsonProperty("item_details")
  private List<ItemDetailDTO> itemDetails;

  public void calculateGrossAmount() {
    if (itemDetails != null && !itemDetails.isEmpty()) {
      transactionDetail.setGrossAmount(itemDetails.stream()
          .map(item -> item.getPrice().multiply(new BigDecimal(item.getQuantity())))
          .reduce(BigDecimal.ZERO, BigDecimal::add));
    }
  }

}
