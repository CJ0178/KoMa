package com.skripsi.koma.dto.complaint;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.BeanUtils;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;
import com.skripsi.koma.dto.user.UserDetailDTO;
import com.skripsi.koma.model.complaint.ComplaintModel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintDTO {

  @JsonProperty(access = Access.READ_ONLY)
  private Long id;

  @JsonProperty(value = "property_id")
  private Long propertyId;

  @JsonProperty(value = "unit_id")
  private Long unitId;

  @JsonProperty(value = "complainer_id", access = Access.READ_ONLY)
  private Long complainterId;

  @JsonProperty(value = "complainer_detail", access = Access.READ_ONLY)
  private UserDetailDTO complainerDetail;

  @NotNull(message = "Title harus diisi")
  @NotBlank(message = "Title tidak boleh kosong")
  private String title;

  @NotNull(message = "Description harus diisi")
  @NotBlank(message = "Description tidak boleh kosong")
  private String description;

  @JsonProperty(value = "photos")
  private List<ComplaintPhotoDTO> photos;

  @JsonProperty(value = "status", access = Access.READ_ONLY)
  private String status;

  @JsonProperty(value = "user_create")
  private String userCreate;

  @JsonProperty(value = "date_create", access = Access.READ_ONLY)
  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
  private Date dateCreate;

  @JsonProperty(value = "date_update", access = Access.READ_ONLY)
  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
  private Date dateUpdate;

  public static ComplaintDTO mapToDTO(ComplaintModel complaint) {
    if (complaint == null) {
      return null;
    }
    ComplaintDTO dto = new ComplaintDTO();
    BeanUtils.copyProperties(complaint, dto);
    dto.setPropertyId(complaint.getProperty() != null ? complaint.getProperty().getId() : null);
    dto.setUnitId(complaint.getUnit() != null ? complaint.getUnit().getId() : null);
    dto.setComplainterId(complaint.getComplainer() != null ? complaint.getComplainer().getId() : null );
    dto.setComplainerDetail(UserDetailDTO.mapToDTO(complaint.getComplainer()));
    List<ComplaintPhotoDTO> photoDTOs = null;
    if (complaint.getPhotos() != null) {
      photoDTOs = complaint.getPhotos().stream()
          .filter(photo -> photo.getActive())
          .map(photo -> ComplaintPhotoDTO.mapToDTO(photo))
          .collect(Collectors.toList());
    }
    dto.setPhotos(photoDTOs);
    dto.setStatus(complaint.getStatus() != null ? complaint.getStatus().name() : null);
    dto.setUserCreate(complaint.getUserCreate());
    dto.setDateCreate(complaint.getDateCreate());
    dto.setDateUpdate(complaint.getDateUpdate());
    return dto;
  }

}
