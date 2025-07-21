package com.skripsi.koma.model.unit;

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
@Table(name = "unit_photo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class UnitPhotoModel extends BasePhotoModel{
    @ManyToOne
    @JoinColumn(name = "unit_id")
    private UnitModel unit;
}
