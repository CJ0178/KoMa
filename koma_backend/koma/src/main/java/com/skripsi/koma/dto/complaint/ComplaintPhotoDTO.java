package com.skripsi.koma.dto.complaint;

import org.springframework.beans.BeanUtils;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.skripsi.koma.model.complaint.ComplaintPhotoModel;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(Include.NON_NULL)
public class ComplaintPhotoDTO {

  @JsonProperty("complaint_photo_id")
  private Long complaintPhotoId;

  @JsonProperty("complaint_id")
  private Long complaintId;

  @JsonProperty(value = "uploader_id")
  private Long uploaderId;

  @JsonProperty(value = "file_name")
  private String fileName;

  @JsonProperty(value = "file_path")
  private String filePath;

  @JsonProperty(value = "width")
  private Integer width;

  @JsonProperty(value = "height")
  private Integer height;

  public static ComplaintPhotoDTO mapToDTO(ComplaintPhotoModel complaintPhoto) {
    if(complaintPhoto==null){
      return null;
    }
    ComplaintPhotoDTO dto = new ComplaintPhotoDTO();
    BeanUtils.copyProperties(complaintPhoto, dto);
    dto.setComplaintId(complaintPhoto.getComplaint().getId());
    dto.setComplaintPhotoId(complaintPhoto.getId());
    dto.setUploaderId(complaintPhoto.getUploader().getId());
    return dto;
  }

}
