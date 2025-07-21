package com.skripsi.koma.model.complaint;

import java.util.List;

import com.skripsi.koma.enums.ComplaintStatus;
import com.skripsi.koma.model.BaseModel;
import com.skripsi.koma.model.property.PropertyModel;
import com.skripsi.koma.model.unit.UnitModel;
import com.skripsi.koma.model.user.UserModel;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "complaint")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ComplaintModel extends BaseModel {
    @ManyToOne
    @JoinColumn(name = "property_id")
    private PropertyModel property;

    @ManyToOne
    @JoinColumn(name = "unit_id")
    private UnitModel unit;

    @ManyToOne
    @JoinColumn(name = "complainer_id")
    private UserModel complainer;

    @Column(name = "title")
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private ComplaintStatus status;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, fetch = jakarta.persistence.FetchType.EAGER)
    private List<ComplaintPhotoModel> photos;
}
