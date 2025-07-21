package com.skripsi.koma.dto.unit;

import java.math.BigDecimal;

import org.springframework.beans.BeanUtils;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.skripsi.koma.model.unit.UnitModel;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(Include.NON_NULL)
public class UnitDTO {
  @JsonProperty(access = JsonProperty.Access.READ_ONLY)
  private Long id;

  @JsonProperty(value = "property_id")
  private Long propertyId;

  @JsonProperty(value = "unit_name")
  private String unitName;

  @JsonProperty(value = "price")
  private BigDecimal price;

  @JsonProperty(value = "unit_width")
  private Double unitWidth;

  @JsonProperty(value = "unit_height")
  private Double unitHeight;

  @JsonProperty(value = "description")
  private String description;

  @JsonProperty(value = "available")
  private Boolean available;

  @JsonProperty(value = "keeper_id")
  private Long keeperId;

  @JsonProperty(value = "promo_price")
  private BigDecimal promoPrice;

  @JsonProperty(value = "deposit_fee")
  private BigDecimal depositFee;

  @JsonProperty(value = "unit_capacity")
  private Integer unitCapacity;

  @JsonProperty(value = "occupant_id")
  private Long occupantId;

  @JsonProperty(value = "user_create")
  private String userCreate;

  @JsonProperty(value = "floor")
  private Integer floor;

  @JsonProperty(value = "bed_type_id")
  private Long bedTypeId;

  @JsonProperty(value = "bed_type_name")
  private String bedTypeName;

  public static UnitDTO mapToDTO(UnitModel unit) {
    UnitDTO dto = new UnitDTO();
    BeanUtils.copyProperties(unit, dto);
    dto.setPropertyId(unit.getProperty().getId());
    dto.setOccupantId(unit.getOccupant().getId());
    dto.setBedTypeId(unit.getBedType().getId());
    dto.setBedTypeName(unit.getBedType().getFacilityName());
    return dto;
  }
}
