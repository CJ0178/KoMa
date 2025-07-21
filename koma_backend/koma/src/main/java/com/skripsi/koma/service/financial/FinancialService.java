package com.skripsi.koma.service.financial;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.skripsi.koma.dto.ApiResponse;
import com.skripsi.koma.dto.financial.FinancialDTO;
import com.skripsi.koma.dto.financial.FinancialSummaryDTO;
import com.skripsi.koma.model.financial.FinancialModel;
import com.skripsi.koma.model.property.PropertyModel;
import com.skripsi.koma.model.unit.UnitModel;
import com.skripsi.koma.model.user.UserModel;
import com.skripsi.koma.repository.financial.FinancialRepository;
import com.skripsi.koma.repository.property.PropertyRepository;
import com.skripsi.koma.repository.unit.UnitRepository;
import com.skripsi.koma.service.user.UserService;
import com.skripsi.koma.util.CustomExceptions;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FinancialService {
    private final FinancialRepository financialRepository;
    private final PropertyRepository propertyRepository;
    private final UnitRepository unitRepository;
    private final UserService userService;

    public ApiResponse<List<FinancialDTO>> getAllFinancialByProperty(Long propertyId) {
        List<FinancialModel> financialList = financialRepository.findAllByPropertyId(propertyId);
        List<FinancialDTO> dtoList = new ArrayList<>();
        financialList.stream().forEach(financial -> {
            FinancialDTO dto = FinancialDTO.mapToDTO(financial);
            dtoList.add(dto);
        });
        return new ApiResponse<>(true, "Daftar keuangan berhasil diambil", dtoList);
    }

    public ApiResponse<List<FinancialDTO>> getAllFinancialByYear(Long propertyId, Integer year) {
        List<FinancialModel> financialList = financialRepository.findAllByYear(propertyId, year);
        List<FinancialDTO> dtoList = new ArrayList<>();
        financialList.stream().forEach(financial -> {
            FinancialDTO dto = FinancialDTO.mapToDTO(financial);
            dtoList.add(dto);
        });
        return new ApiResponse<>(true, "Daftar keuangan berhasil diambil", dtoList);
    }

    public ApiResponse<List<FinancialDTO>> getAllFinancialByMonth(Long propertyId, Integer year, Integer month) {
        List<FinancialModel> financialList = financialRepository.findAllByMonth(propertyId, year, month);
        List<FinancialDTO> dtoList = new ArrayList<>();
        financialList.stream().forEach(financial -> {
            FinancialDTO dto = FinancialDTO.mapToDTO(financial);
            dtoList.add(dto);
        });
        return new ApiResponse<>(true, "Daftar keuangan berhasil diambil", dtoList);
    }

    public ApiResponse<List<FinancialDTO>> getAllFinancialByDay(Long propertyId, Integer year, Integer month, Integer day) {
        List<FinancialModel> financialList = financialRepository.findAllByDay(propertyId, year, month, day);
        List<FinancialDTO> dtoList = new ArrayList<>();
        financialList.stream().forEach(financial -> {
            FinancialDTO dto = FinancialDTO.mapToDTO(financial);
            dtoList.add(dto);
        });
        return new ApiResponse<>(true, "Daftar keuangan berhasil diambil", dtoList);
    }

    public ApiResponse<List<FinancialSummaryDTO>> getSummaryFinancialByProperty(Long propertyId) {
        List<FinancialSummaryDTO> financialList = financialRepository.findSummaryByProperty(propertyId);
        return new ApiResponse<>(true, "Summary keuangan berhasil diambil", financialList);
    }

    public ApiResponse<List<FinancialSummaryDTO>> getSummaryFinancialByYear(Long propertyId, Integer year) {
        List<FinancialSummaryDTO> financialList = financialRepository.findSummaryByYear(propertyId, year);
        return new ApiResponse<>(true, "Summary keuangan berhasil diambil", financialList);
    }

    public ApiResponse<List<FinancialSummaryDTO>> getSummaryFinancialByMonth(Long propertyId, Integer year, Integer month) {
        List<FinancialSummaryDTO> financialList = financialRepository.findSummaryByMonth(propertyId, year, month);
        return new ApiResponse<>(true, "Summary keuangan berhasil diambil", financialList);
    }

    public ApiResponse<List<FinancialSummaryDTO>> getSummaryFinancialByDay(Long propertyId, Integer year, Integer month, Integer day) {
        List<FinancialSummaryDTO> financialList = financialRepository.findSummaryByDay(propertyId, year, month, day);
        return new ApiResponse<>(true, "Summary keuangan berhasil diambil", financialList);
    }

    @Transactional
    public ApiResponse<FinancialDTO> createReport(FinancialDTO request) {
        UserModel user = userService.getCurrentUser();
        PropertyModel property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new CustomExceptions(HttpStatus.NOT_FOUND, "Property tidak ditemukan", null));
        UnitModel unit = unitRepository.findById(request.getUnitId()).get();
        FinancialModel financial = new FinancialModel();
        BeanUtils.copyProperties(request, financial);
        financial.setProperty(property);
        financial.setUnit(unit);
        financial.setIncome(request.getIncome());
        financial.setExpense(request.getExpense());
        financial.setDate(request.getDate());
        financial.setUserCreate(user.getEmail());
        financialRepository.save(financial);
        request.setId(financial.getId());
        return new ApiResponse<>(true, "Financial report dibuat", FinancialDTO.mapToDTO(financial));
    }

    @Transactional
    public ApiResponse<FinancialDTO> updateReport(Long id, FinancialDTO request) {
        UserModel user = userService.getCurrentUser();
        FinancialModel financial = financialRepository.findById(id)
                .orElseThrow(
                        () -> new CustomExceptions(HttpStatus.NOT_FOUND, "Financial " + id + " tidak ditemukan",
                                null));
        BeanUtils.copyProperties(request, financial, "id", "userCreate", "dateCreate");
        PropertyModel property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new CustomExceptions(HttpStatus.NOT_FOUND, "Property tidak ditemukan", null));
        UnitModel unit = unitRepository.findById(request.getUnitId()).get();
        financial.setProperty(property);
        financial.setUnit(unit);
        financial.setIncome(request.getIncome());
        financial.setExpense(request.getExpense());
        financial.setDate(request.getDate());
        financial.setUserUpdate(user.getEmail());
        financialRepository.save(financial);
        return new ApiResponse<>(true, "Financial report berhasil diperbarui!", FinancialDTO.mapToDTO(financial));
    }

    @Transactional
    public ApiResponse<Void> deleteReport(Long id) {
        if (!financialRepository.existsById(id)) {
            throw new CustomExceptions(HttpStatus.NOT_FOUND, "Financial report ID " + id + " tidak ditemukan", null);
        }
        financialRepository.deleteById(id);
        return new ApiResponse<>(true, "Financial report dihapus", null);
    }
}
