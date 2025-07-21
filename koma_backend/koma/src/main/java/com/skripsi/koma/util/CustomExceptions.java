package com.skripsi.koma.util;

import org.springframework.http.HttpStatus;

import com.skripsi.koma.enums.StatusCode;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class CustomExceptions extends RuntimeException{
    private HttpStatus httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    private String message;
    private Object data;

    public CustomExceptions(StatusCode statusCode) {
        super(statusCode.getMessage());
        this.data = null;
        this.httpStatus = statusCode.getHttpstatus();
        this.message = statusCode.getMessage();
    }

    public CustomExceptions(){
        super();
    }
}
