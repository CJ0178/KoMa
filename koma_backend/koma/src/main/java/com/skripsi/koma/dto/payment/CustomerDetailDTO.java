package com.skripsi.koma.dto.payment;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.skripsi.koma.model.user.UserModel;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CustomerDetailDTO {
  @JsonProperty("first_name")
  private String firstName;
  @JsonProperty("email")
  private String email;
  @JsonProperty("phone")
  private String phone;

  public static CustomerDetailDTO fromUserModel(UserModel userModel) {
    CustomerDetailDTO customerDetailDTO = new CustomerDetailDTO();
    customerDetailDTO.setFirstName(userModel.getName());
    customerDetailDTO.setEmail(userModel.getEmail());
    customerDetailDTO.setPhone(userModel.getPhoneNumber());
    return customerDetailDTO;
  }
}
