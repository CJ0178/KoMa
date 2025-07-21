package com.skripsi.koma.model.facility;

import com.skripsi.koma.model.BaseModel;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "facility_category")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class FacilityCategoryModel extends BaseModel{
    @Column(name = "category", nullable = false)
    private String categoryName;

    @Column(name = "facility_name", nullable = false)
    private String facilityName;
}
