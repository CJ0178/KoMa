package com.skripsi.koma.dto.facility;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FacilityCategoryDTO {
  @JsonProperty("id")
  private Long id;
  @JsonProperty("category")
  private String categoryName;
  @JsonProperty("facility_name")
  private String facilityName;
  @JsonProperty(value = "user_create")
  private String userCreate;
}
