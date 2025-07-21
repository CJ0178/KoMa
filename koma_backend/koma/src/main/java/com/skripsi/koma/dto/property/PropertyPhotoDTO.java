package com.skripsi.koma.dto.property;

import org.springframework.beans.BeanUtils;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.skripsi.koma.model.property.PropertyPhotoModel;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(Include.NON_NULL)
public class PropertyPhotoDTO {

  @JsonProperty("property_photo_id")
  private Long propertyPhotoId;

  @JsonProperty("property_id")
  private Long propertyId;

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

  public static PropertyPhotoDTO mapToDTO(PropertyPhotoModel propertyPhoto) {
    if(propertyPhoto==null){
      return null;
    }
    PropertyPhotoDTO dto = new PropertyPhotoDTO();
    BeanUtils.copyProperties(propertyPhoto, dto);
    dto.setPropertyId(propertyPhoto.getProperty().getId());
    dto.setPropertyPhotoId(propertyPhoto.getId());
    dto.setUploaderId(propertyPhoto.getUploader().getId());
    return dto;
  }

}
