package com.skripsi.koma.model.unit;

import java.math.BigDecimal;
import java.util.List;

import com.skripsi.koma.model.BaseModel;
import com.skripsi.koma.model.facility.FacilityCategoryModel;
import com.skripsi.koma.model.property.PropertyModel;
import com.skripsi.koma.model.user.UserModel;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "unit")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class UnitModel extends BaseModel{

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne
    @JoinColumn(name = "property_id", nullable = false)
    private PropertyModel property;

    @Column(name = "unit_name", nullable = false)
    private String unitName;

    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @Column(name = "unit_width", nullable = false)
    private Double unitWidth;

    @Column(name = "unit_height", nullable = false)
    private Double unitHeight;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "available", nullable = false)
    private Boolean available;

    @Column(name = "deposit_fee")
    private BigDecimal depositFee;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_referrence_id")
    private UnitReferrenceModel unitReferrenceId;

    @Column(name = "unit_capacity", nullable = false)
    private Integer unitCapacity;

    @Column(name = "floor")
    private Integer floor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "bed_type_id")
    private FacilityCategoryModel bedType;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "occupant_id")
    private UserModel occupant;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "unit", fetch = FetchType.EAGER)
    private List<UnitPhotoModel> photos;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "unit", fetch = FetchType.EAGER)
    private List<UnitFacilityModel> facilities;
}
