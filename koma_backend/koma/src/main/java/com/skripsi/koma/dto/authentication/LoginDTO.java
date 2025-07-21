package com.skripsi.koma.dto.authentication;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.skripsi.koma.dto.user.UserDetailDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginDTO {
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String email;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    @JsonProperty(value = "access_token" , access = JsonProperty.Access.READ_ONLY)
    private String jwtToken;
    @JsonProperty(value = "user_detail" , access = JsonProperty.Access.READ_ONLY)
    private UserDetailDTO userDetail;
}
