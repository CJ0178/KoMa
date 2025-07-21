package com.skripsi.koma.dto.unit;

import org.springframework.beans.BeanUtils;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.skripsi.koma.model.unit.UnitPhotoModel;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(Include.NON_NULL)
public class UnitPhotoDTO {

  @JsonProperty("unit_photo_id")
  private Long unitPhotoId;

  @JsonProperty("unit_id")
  private Long unitId;

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

  @JsonProperty(value = "user_create")
  private String userCreate;

  public static UnitPhotoDTO mapToDTO(UnitPhotoModel unitPhoto) {
    if(unitPhoto==null){
      return null;
    }
    UnitPhotoDTO dto = new UnitPhotoDTO();
    BeanUtils.copyProperties(unitPhoto, dto);
    dto.setUnitId(unitPhoto.getUnit().getId());
    dto.setUnitPhotoId(unitPhoto.getId());
    dto.setUploaderId(unitPhoto.getUploader().getId());
    dto.setUserCreate(unitPhoto.getUserCreate());
    return dto;
  }

}
