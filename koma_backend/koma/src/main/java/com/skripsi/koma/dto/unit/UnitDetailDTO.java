package com.skripsi.koma.dto.unit;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.BeanUtils;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.skripsi.koma.dto.facility.FacilityDTO;
import com.skripsi.koma.enums.ApprovalStatus;
import com.skripsi.koma.dto.contact.ContactDTO;
import com.skripsi.koma.model.unit.UnitFacilityModel;
import com.skripsi.koma.model.unit.UnitModel;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(Include.NON_NULL)
@EqualsAndHashCode(callSuper = true)
public class UnitDetailDTO extends UnitDTO {
  @JsonProperty(value = "photos")
  private List<UnitPhotoDTO> photos;

  @JsonProperty(value = "facilities")
  private List<FacilityDTO> facilities;

  @JsonProperty(value = "contacts")
  private List<ContactDTO> contacts;

  public static UnitDetailDTO mapToDTO(UnitModel unit) {
    UnitDetailDTO dto = new UnitDetailDTO();
    BeanUtils.copyProperties(unit, dto);
    dto.setPropertyId(unit.getProperty().getId());
    if(dto.getOccupantId() != null){
      dto.setOccupantId(unit.getOccupant().getId());
    }

    List<UnitPhotoDTO> photoDTOs = null;
    if (unit.getPhotos() != null) {
      photoDTOs = unit.getPhotos().stream()
          .filter(photo -> photo.getActive())
          .map(photo -> UnitPhotoDTO.mapToDTO(photo))
          .collect(Collectors.toList());
    }
    dto.setPhotos(photoDTOs);

    if (unit.getFacilities() != null) {
      List<FacilityDTO> facilityDTOs = new ArrayList<>();
      for (UnitFacilityModel unitFacilityModel : unit.getFacilities()) {
        if(unitFacilityModel.getActive()){
          FacilityDTO facilityDTO = new FacilityDTO();
          facilityDTO.setFacilityId(unitFacilityModel.getId());
          if(unitFacilityModel.getFacilityCategory()!=null){
            facilityDTO.setFacilityCategoryId(unitFacilityModel.getFacilityCategory().getId());
            facilityDTO.setFacilityCategory(unitFacilityModel.getFacilityCategory().getCategoryName());
            facilityDTO.setFacilityName(unitFacilityModel.getFacilityCategory().getFacilityName());
          }
          facilityDTO.setQuantity(unitFacilityModel.getQuantity());
          facilityDTO.setNotes(unitFacilityModel.getNotes());
          facilityDTOs.add(facilityDTO);
        }
      }
      dto.setFacilities(facilityDTOs);
    }

    // Mapping contacts
    List<ContactDTO> contactList = new ArrayList<>();
    // Pemilik kos
    if (unit.getProperty() != null && unit.getProperty().getOwner() != null) {
      ContactDTO ownerContact = new ContactDTO();
      ownerContact.setName(unit.getProperty().getOwner().getName());
      ownerContact.setPhone(unit.getProperty().getOwner().getPhoneNumber());
      ownerContact.setRole("PEMILIK_KOS");
      contactList.add(ownerContact);
    }
    // Penjaga kos
    if (unit.getProperty() != null && unit.getProperty().getKeepers() != null) {
      unit.getProperty().getKeepers().forEach(keeper -> {
        if (ApprovalStatus.APPROVE.equals(keeper.getApprovalStatus()) && keeper.getKeeper() != null && keeper.getActive()) {
          ContactDTO keeperContact = new ContactDTO();
          keeperContact.setName(keeper.getKeeper().getName());
          keeperContact.setPhone(keeper.getKeeper().getPhoneNumber());
          keeperContact.setRole("PENJAGA_KOS");
          contactList.add(keeperContact);
        }
      });
    }
    dto.setContacts(contactList);
    if(unit.getBedType() != null) {
      dto.setBedTypeId(unit.getBedType().getId());
      dto.setBedTypeName(unit.getBedType().getFacilityName());
    }
    return dto;
  }
}
