package com.skripsi.koma.model.unit;

import com.skripsi.koma.model.BaseModel;
import com.skripsi.koma.model.facility.FacilityCategoryModel;
import com.skripsi.koma.model.unit.UnitFacilityModel;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "unit_facility")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class UnitFacilityModel extends BaseModel{
    @ManyToOne
    @JoinColumn(name = "unit_id")
    private UnitModel unit;

    @ManyToOne
    @JoinColumn(name = "facility_category_id")
    private FacilityCategoryModel facilityCategory;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "notes")
    private String notes;
}
