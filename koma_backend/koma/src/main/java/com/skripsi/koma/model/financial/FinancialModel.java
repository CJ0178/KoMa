package com.skripsi.koma.model.financial;

import java.time.LocalDate;

import com.skripsi.koma.model.BaseModel;
import com.skripsi.koma.model.property.PropertyModel;
import com.skripsi.koma.model.unit.UnitModel;

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
@Table(name = "financial")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class FinancialModel extends BaseModel {
    @ManyToOne
    @JoinColumn(name = "property_id")
    private PropertyModel property;

    @ManyToOne
    @JoinColumn(name = "unit_id")
    private UnitModel unit;

    @Column(name = "income")
    private Double income;

    @Column(name = "expense")
    private Double expense;

    @Column(name = "description")
    private String description;

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "financial_photo_path")
    private String financialPhotoPath;
}
