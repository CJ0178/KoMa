package com.skripsi.koma.model.complaint;

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
@Table(name = "complaint_photo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ComplaintPhotoModel extends BasePhotoModel{
    @ManyToOne
    @JoinColumn(name = "complaint_id")
    private ComplaintModel complaint;
}
