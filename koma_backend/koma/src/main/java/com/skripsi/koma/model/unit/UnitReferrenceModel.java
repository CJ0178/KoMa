package com.skripsi.koma.model.unit;


import com.skripsi.koma.model.BaseModel;
import com.skripsi.koma.model.user.UserModel;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "unit_referrence")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UnitReferrenceModel extends BaseModel{
    @ManyToOne
    @JoinColumn(name = "referrer_id", nullable = false)
    private UserModel referrerId;
    @ManyToOne
    @JoinColumn(name = "unit_id", nullable = false)
    private UnitModel unitId;
    private String referrerCode;
    private Boolean isValid;
}
