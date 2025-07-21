package com.skripsi.koma.dto.property;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.BeanUtils;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.skripsi.koma.dto.facility.FacilityDTO;
import com.skripsi.koma.dto.unit.UnitDetailDTO;
import com.skripsi.koma.model.property.PropertyModel;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(Include.NON_NULL)
@EqualsAndHashCode(callSuper = true)
public class PropertyDetailDTO extends PropertyDTO {

  @JsonProperty(value = "units")
  private List<UnitDetailDTO> units;

  @JsonProperty(value = "photos")
  private List<PropertyPhotoDTO> photos;

  @JsonProperty(value = "facilities")
  private List<FacilityDTO> facilities;

  public static PropertyDetailDTO mapToDTO(PropertyModel property) {
    if (property == null) {
      return null;
    }
    PropertyDetailDTO dto = new PropertyDetailDTO();
    BeanUtils.copyProperties(property, dto);

    List<UnitDetailDTO> unitDTOs = null;
    if (property.getUnits() != null) {
      unitDTOs = property.getUnits().stream()
          .map(unit -> UnitDetailDTO.mapToDTO(unit))
          .collect(Collectors.toList());
    }
    dto.setUnits(unitDTOs);

    List<PropertyPhotoDTO> photoDTOs = null;
    if (property.getPhotos() != null) {
      photoDTOs = property.getPhotos().stream()
          .map(photo -> PropertyPhotoDTO.mapToDTO(photo))
          .collect(Collectors.toList());
    }
    dto.setPhotos(photoDTOs);

    List<FacilityDTO> facilityDTOs = null;
    if (property.getFacilities() != null) {
      facilityDTOs = property.getFacilities().stream()
          .map(facility -> FacilityDTO.mapUnitFacilityToDTO(facility))
          .collect(Collectors.toList());
    }
    dto.setFacilities(facilityDTOs);

    return dto;
  }
}
