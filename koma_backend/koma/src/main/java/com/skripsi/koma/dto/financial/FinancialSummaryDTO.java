package com.skripsi.koma.dto.financial;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FinancialSummaryDTO {
    @JsonProperty(value = "total_income")
    private Double totalIncome;

    @JsonProperty(value = "total_expense")
    private Double totalExpense;

    @JsonProperty(value = "year")
    private Integer year;

    @JsonProperty(value = "month")
    private Integer month;

    @JsonProperty(value = "day")
    private Integer day;
}
