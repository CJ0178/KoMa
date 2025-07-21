package com.skripsi.koma.model.property;

import com.skripsi.koma.model.BaseModel;
import com.skripsi.koma.model.facility.FacilityCategoryModel;

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
@Table(name = "property_facility")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class PropertyFacilityModel extends BaseModel {
    @ManyToOne
    @JoinColumn(name = "proprety_id")
    private PropertyModel property;

    @ManyToOne
    @JoinColumn(name = "facility_category_id")
    private FacilityCategoryModel facilityCategory;

    @Column(name = "quantity")
    private Integer quantity;
}
