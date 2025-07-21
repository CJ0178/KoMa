package com.skripsi.koma.dto.approval;

import com.skripsi.koma.enums.ApprovalStatus;

import lombok.Data;

@Data
public class ApprovalDTO {
  private ApprovalStatus decision;
  private String remarks;
}
