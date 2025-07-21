package com.skripsi.koma.dto.financial;

import java.time.LocalDate;

import org.springframework.beans.BeanUtils;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;
import com.skripsi.koma.model.financial.FinancialModel;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FinancialDTO {
  @JsonProperty(access = Access.READ_ONLY)
  private Long id;

  @JsonProperty(value = "property_id")
  private Long propertyId;

  @JsonProperty(value = "unit_id")
  private Long unitId;

  @JsonProperty(value = "income")
  private Double income;

  @JsonProperty(value = "expense")
  private Double expense;

  @JsonProperty(value = "description")
  private String description;

  @JsonProperty(value = "date")
  private LocalDate date;

  @JsonProperty(value = "user_create")
  private String userCreate;

  @JsonProperty(value = "financial_photo_path")
  private String financialPhotoPath;

  public static FinancialDTO mapToDTO(FinancialModel financial) {
    if (financial == null) {
      return null;
    }
    FinancialDTO dto = new FinancialDTO();
    BeanUtils.copyProperties(financial, dto);
    if(financial.getProperty() != null) {
      dto.setPropertyId(financial.getProperty().getId());
    }
    if(financial.getUnit() != null) {
      dto.setUnitId(financial.getUnit().getId());
    }
    dto.setUserCreate(financial.getUserCreate());
    return dto;
  }
}
