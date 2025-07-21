package com.skripsi.koma.model;

import com.skripsi.koma.model.user.UserModel;

import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MappedSuperclass;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@MappedSuperclass
@EqualsAndHashCode(callSuper = true)
public abstract class BasePhotoModel extends BaseModel {
  @ManyToOne
  @JoinColumn(name = "uploader_id")
  private UserModel uploader;

  @Column(name = "file_name")
  private String fileName;

  @Column(name = "file_path")
  private String filePath;

  @Column(name = "width")
  private Integer width;

  @Column(name = "height")
  private Integer height;
}
