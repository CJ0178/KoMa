package com.skripsi.koma.model.property;

import com.skripsi.koma.model.BasePhotoModel;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "property_photo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class PropertyPhotoModel extends BasePhotoModel {
  @ManyToOne
  @JoinColumn(name = "property_id")
  private PropertyModel property;
}
