package com.skripsi.koma.dto.contact;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import lombok.Data;

@Data
@JsonInclude(Include.NON_NULL)
public class ContactDTO {
    private String name;
    private String phone;
    private String role;
}
