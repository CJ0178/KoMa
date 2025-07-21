package com.skripsi.koma.dto.facility;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.skripsi.koma.model.property.PropertyFacilityModel;
import com.skripsi.koma.model.unit.UnitFacilityModel;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FacilityDTO {
  @JsonProperty("facility_id")
  private Long facilityId;
  @JsonProperty("facility_category_id")
  private Long facilityCategoryId;
  @JsonProperty("facility_category")
  private String facilityCategory;
  @JsonProperty("facility_name")
  private String facilityName;
  @JsonProperty("quantity")
  private Integer quantity;
  @JsonProperty("notes")
  private String notes;
  @JsonProperty(value = "user_create")
  private String userCreate;

  public static FacilityDTO mapUnitFacilityToDTO(UnitFacilityModel unitFacility) {
    if(unitFacility==null){
      return null;
    }
    FacilityDTO dto = new FacilityDTO();
    dto.setFacilityId(unitFacility.getId());
    dto.setFacilityCategoryId(unitFacility.getFacilityCategory().getId());
    dto.setFacilityCategory(unitFacility.getFacilityCategory().getCategoryName());
    dto.setFacilityName(unitFacility.getFacilityCategory().getFacilityName());
    dto.setQuantity(unitFacility.getQuantity());
    dto.setNotes(unitFacility.getNotes());
    dto.setUserCreate(unitFacility.getUserCreate());
    return dto;
  }

  public static FacilityDTO mapUnitFacilityToDTO(PropertyFacilityModel propertyFacility) {
    if(propertyFacility==null){
      return null;
    }
    FacilityDTO dto = new FacilityDTO();
    dto.setFacilityId(propertyFacility.getId());
    dto.setFacilityCategoryId(propertyFacility.getFacilityCategory().getId());
    dto.setFacilityCategory(propertyFacility.getFacilityCategory().getCategoryName());
    dto.setFacilityName(propertyFacility.getFacilityCategory().getFacilityName());
    dto.setUserCreate(propertyFacility.getUserCreate());
    return dto;
  }
}
