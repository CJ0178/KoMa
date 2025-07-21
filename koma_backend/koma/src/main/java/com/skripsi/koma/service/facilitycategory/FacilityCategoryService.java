package com.skripsi.koma.service.facilitycategory;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.skripsi.koma.dto.ApiResponse;
import com.skripsi.koma.dto.authentication.LoginDTO;
import com.skripsi.koma.dto.authentication.RegisterDTO;
import com.skripsi.koma.dto.authentication.ResetPasswordDTO;
import com.skripsi.koma.dto.facility.FacilityCategoryDTO;
import com.skripsi.koma.dto.user.UserDetailDTO;
import com.skripsi.koma.enums.Role;
import com.skripsi.koma.enums.StatusCode;
import com.skripsi.koma.model.user.UserModel;
import com.skripsi.koma.model.user.UserRoleModel;
import com.skripsi.koma.repository.user.UserRepository;
import com.skripsi.koma.repository.user.UserRoleRepository;
import com.skripsi.koma.service.email.EmailService;
import com.skripsi.koma.util.CustomExceptions;
import com.skripsi.koma.util.JwtUtil;
import com.skripsi.koma.model.property.PropertyModel;
import com.skripsi.koma.model.property.PropertyRatingModel;
import com.skripsi.koma.model.facility.FacilityCategoryModel;
import com.skripsi.koma.model.property.PropertyKeeperModel;
import com.skripsi.koma.model.unit.UnitModel;
import com.skripsi.koma.repository.property.PropertyRepository;
import com.skripsi.koma.repository.facility.FacilityCategoryRepository;
import com.skripsi.koma.repository.property.PropertyKeeperRepository;
import com.skripsi.koma.repository.property.PropertyRatingRepository;
import com.skripsi.koma.repository.unit.UnitRepository;

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
    BeanUtils.copyProperties(facilityCategoryModel, facilityCategoryDTO);
    return new ApiResponse<FacilityCategoryDTO>(true, "Facility category berhasil diambil", facilityCategoryDTO);
  }

  public ApiResponse<List<FacilityCategoryDTO>> getAllFacilityCategory() {
    List<FacilityCategoryDTO> facilityCategoryDTOs = new ArrayList<>();
    List<FacilityCategoryModel> facilityCategoryModels = facilityCategoryRepository.findAll();
    for (FacilityCategoryModel facilityCategoryModel : facilityCategoryModels) {
      FacilityCategoryDTO facilityCategoryDTO = new FacilityCategoryDTO();
      BeanUtils.copyProperties(facilityCategoryModel, facilityCategoryDTO);
      facilityCategoryDTOs.add(facilityCategoryDTO);
    }
    return new ApiResponse<List<FacilityCategoryDTO>>(true, "Daftar facility category berhasil diambil", facilityCategoryDTOs);
  }

  public ApiResponse<FacilityCategoryDTO> createFacilityCategory(Long id, FacilityCategoryDTO request) {
    FacilityCategoryDTO response = new FacilityCategoryDTO();
    FacilityCategoryModel facilityCategoryModel = facilityCategoryRepository.findById(id).orElseThrow(()->new CustomExceptions(StatusCode.NOT_FOUND));
    if(facilityCategoryModel!=null){
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
    if(facilityCategoryModel!=null){
      facilityCategoryModel.setCategoryName(request.getCategoryName());
      facilityCategoryModel.setFacilityName(request.getFacilityName());
      facilityCategoryRepository.save(facilityCategoryModel);
      BeanUtils.copyProperties(facilityCategoryModel, response);
    }
    return new ApiResponse<FacilityCategoryDTO>(true, "Facility category berhasil diperbarui", response);
  }

  public ApiResponse<Void> deleteFacilityCategory(Long id) {
    FacilityCategoryModel facilityCategoryModel = facilityCategoryRepository.findById(id).orElseThrow(()->new CustomExceptions(StatusCode.NOT_FOUND));
    facilityCategoryRepository.delete(facilityCategoryModel);
    return new ApiResponse<Void>(true, "Facility category berhasil dihapus", null);
  }

}
