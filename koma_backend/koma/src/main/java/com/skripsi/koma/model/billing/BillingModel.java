package com.skripsi.koma.model.billing;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.skripsi.koma.enums.BillingStatus;
import com.skripsi.koma.model.BaseModel;
import com.skripsi.koma.model.property.PropertyModel;
import com.skripsi.koma.model.unit.UnitModel;
import com.skripsi.koma.model.unit.UnitReferrenceModel;
import com.skripsi.koma.model.user.UserModel;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "billing")
@Data
@EqualsAndHashCode(callSuper = true)
public class BillingModel extends BaseModel {
    @Column(name = "reference_no", nullable = false)
    private String referenceNo;
    @Column(name = "multipay_reference_no")
    private String multiPayReferenceNo;
    @ManyToOne
    @JoinColumn(name = "occupant_id")
    private UserModel occupant;
    @ManyToOne
    @JoinColumn(name = "property_id")
    private PropertyModel property;
    @ManyToOne
    @JoinColumn(name = "unit_id")
    private UnitModel unit;
    @Enumerated(EnumType.STRING)
    @Column(name = "status_billing", nullable = false)
    private BillingStatus statusBilling;
    @Column(name = "nominal", nullable = false)
    private BigDecimal nominal;
    @Column(name = "billing_type", nullable = false)
    private String billingType;
    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;
    @Column(name = "last_midtrans_status")
    private String lastMidtransStatus;
    @ManyToOne
    @JoinColumn(name = "unit_reference_id")
    private UnitReferrenceModel unitReference;
    @Column(name = "used_point")
    private Integer usedPoint;
}
