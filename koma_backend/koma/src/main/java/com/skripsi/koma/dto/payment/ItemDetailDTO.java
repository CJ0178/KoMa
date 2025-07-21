package com.skripsi.koma.dto.payment;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.skripsi.koma.model.billing.BillingModel;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ItemDetailDTO {
  @JsonProperty("id")
  private String id;
  @JsonProperty("price")
  private BigDecimal price;
  @JsonProperty("quantity")
  private Integer quantity;
  @JsonProperty("name")
  private String name;
  @JsonProperty("category")
  private String category;

  public static ItemDetailDTO fromBillingModel(BillingModel billingModel) {
    ItemDetailDTO itemDetailDTO = new ItemDetailDTO();
    itemDetailDTO.setId(billingModel.getId().toString());
    itemDetailDTO.setPrice(billingModel.getNominal());
    itemDetailDTO.setQuantity(1);
    itemDetailDTO.setName(billingModel.getReferenceNo());
    itemDetailDTO.setCategory(billingModel.getBillingType());
    return itemDetailDTO;
  }
}
