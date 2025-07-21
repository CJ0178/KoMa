package com.skripsi.koma.model.property;

import com.skripsi.koma.model.BaseModel;
import com.skripsi.koma.model.user.UserModel;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "property_rating")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyRatingModel extends BaseModel{
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "propertyId", nullable = false)
    private PropertyModel property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "occupant_id", nullable = false)
    private UserModel occupant;

    private Integer rating;
}
