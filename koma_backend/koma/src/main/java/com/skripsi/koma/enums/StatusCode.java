package com.skripsi.koma.enums;

import org.springframework.http.HttpStatus;

public enum StatusCode {

    OK(HttpStatus.OK, "Success"),
    NOT_FOUND(HttpStatus.NOT_FOUND, "Data Tidak Ditemukan"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "Tidak berhak mengakses");

    private final HttpStatus httpstatus;
    private final String message;

    StatusCode(HttpStatus httpStatus, String message){
        this.httpstatus = httpStatus;
        this.message = message;
    }

    public HttpStatus getHttpstatus() {
        return httpstatus;
    }

    public String getMessage() {
        return message;
    }
}
