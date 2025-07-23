package com.skripsi.koma.service.facilitycategory;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import com.skripsi.koma.dto.ApiResponse;
import com.skripsi.koma.dto.facility.FacilityCategoryDTO;
import com.skripsi.koma.enums.StatusCode;
import com.skripsi.koma.model.facility.FacilityCategoryModel;
import com.skripsi.koma.repository.facility.FacilityCategoryRepository;
import com.skripsi.koma.util.CustomExceptions;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class FacilityCategoryService {

  private final FacilityCategoryRepository facilityCategoryRepository;

  public ApiResponse<FacilityCategoryDTO> getFacilityCategoryById(Long id) {
    FacilityCategoryDTO facilityCategoryDTO = new FacilityCategoryDTO();
    FacilityCategoryModel facilityCategoryModel = facilityCategoryRepository.findById(id).orElseThrow(() -> new CustomExceptions(StatusCode.NOT_FOUND));
    if(facilityCategoryModel.getActive()){
      BeanUtils.copyProperties(facilityCategoryModel, facilityCategoryDTO);
    }
    return new ApiResponse<FacilityCategoryDTO>(true, "Facility category berhasil diambil", facilityCategoryDTO);
  }

  public ApiResponse<List<FacilityCategoryDTO>> getAllFacilityCategory() {
    List<FacilityCategoryDTO> facilityCategoryDTOs = new ArrayList<>();
    List<FacilityCategoryModel> facilityCategoryModels = facilityCategoryRepository.findAll();
    for (FacilityCategoryModel facilityCategoryModel : facilityCategoryModels) {
      if(facilityCategoryModel.getActive()){
        FacilityCategoryDTO facilityCategoryDTO = new FacilityCategoryDTO();
        BeanUtils.copyProperties(facilityCategoryModel, facilityCategoryDTO);
        facilityCategoryDTOs.add(facilityCategoryDTO);
      }
    }
    return new ApiResponse<List<FacilityCategoryDTO>>(true, "Daftar facility category berhasil diambil", facilityCategoryDTOs);
  }

  public ApiResponse<FacilityCategoryDTO> createFacilityCategory(Long id, FacilityCategoryDTO request) {
    FacilityCategoryDTO response = new FacilityCategoryDTO();
    FacilityCategoryModel facilityCategoryModel = facilityCategoryRepository.findById(id).orElseThrow(()->new CustomExceptions(StatusCode.NOT_FOUND));
    if(facilityCategoryModel!=null && facilityCategoryModel.getActive()){
      facilityCategoryModel.setCategoryName(request.getCategoryName());
      facilityCategoryModel.setFacilityName(request.getFacilityName());
      facilityCategoryRepository.save(facilityCategoryModel);
      BeanUtils.copyProperties(facilityCategoryModel, response);
    }
    return new ApiResponse<FacilityCategoryDTO>(true, "Facility category berhasil diperbarui", response);
  }

  public ApiResponse<FacilityCategoryDTO> updateFacilityCategory(Long id, FacilityCategoryDTO request) {
    FacilityCategoryDTO response = new FacilityCategoryDTO();
    FacilityCategoryModel facilityCategoryModel = facilityCategoryRepository.findById(id).orElseThrow(()->new CustomExceptions(StatusCode.NOT_FOUND));
    if(facilityCategoryModel!=null && facilityCategoryModel.getActive()){
      facilityCategoryModel.setCategoryName(request.getCategoryName());
      facilityCategoryModel.setFacilityName(request.getFacilityName());
      facilityCategoryRepository.save(facilityCategoryModel);
      BeanUtils.copyProperties(facilityCategoryModel, response);
    }
    return new ApiResponse<FacilityCategoryDTO>(true, "Facility category berhasil diperbarui", response);
  }

  public ApiResponse<Void> deleteFacilityCategory(Long id) {
    FacilityCategoryModel facilityCategoryModel = facilityCategoryRepository.findById(id).orElseThrow(()->new CustomExceptions(StatusCode.NOT_FOUND));
    facilityCategoryModel.setActive(false);
    facilityCategoryRepository.save(facilityCategoryModel);
    return new ApiResponse<Void>(true, "Facility category berhasil dihapus", null);
  }

}
