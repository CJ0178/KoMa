package com.skripsi.koma.dto.property;

import org.springframework.beans.BeanUtils;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.skripsi.koma.model.property.PropertyModel;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(Include.NON_NULL)
public class PropertyDTO {
  @JsonProperty(access = JsonProperty.Access.READ_ONLY)
  private Long id;

  @JsonProperty(value = "property_name")
  private String propertyName;

  @JsonProperty(value = "address")
  private String address;

  @JsonProperty(value = "city")
  private String city;

  @JsonProperty(value = "latitude")
  private Double latitude;

  @JsonProperty(value = "longitude")
  private Double longitude;

  @JsonProperty(value ="property_type" )
  private String propertyType;

  @JsonProperty(value = "thumbnail_photo_path")
  private String thumbnailPhotoPath;

  @JsonProperty(value = "description")
  private String description;

  @JsonProperty(value = "rating", access = JsonProperty.Access.READ_ONLY)
  private Double rating;

  @JsonProperty(value = "total_rater", access = JsonProperty.Access.READ_ONLY)
  private Integer totalRater;

  @JsonProperty(value = "price", access = JsonProperty.Access.READ_ONLY)
  private BigDecimal price;

  @JsonProperty(value = "user_create")
  private String userCreate;

  @JsonProperty(value = "available_unit_count", access = JsonProperty.Access.READ_ONLY)
  private Integer availableUnitCount;

  public static PropertyDTO mapToDTO(PropertyModel property) {
    if (property == null) {
      return null;
    }
    PropertyDTO dto = new PropertyDTO();
    BeanUtils.copyProperties(property, dto);
    // Set price dari unit available termurah
    if (property.getUnits() != null && !property.getUnits().isEmpty()) {
      dto.setPrice(property.getUnits().stream()
        .filter(unit -> Boolean.TRUE.equals(unit.getAvailable()))
        .map(unit -> unit.getPrice())
        .min(BigDecimal::compareTo)
        .orElse(null));
      dto.setAvailableUnitCount((int) property.getUnits().stream().filter(unit -> Boolean.TRUE.equals(unit.getAvailable())).count());
    } else {
      dto.setAvailableUnitCount(0);
    }
    return dto;
  }
}
