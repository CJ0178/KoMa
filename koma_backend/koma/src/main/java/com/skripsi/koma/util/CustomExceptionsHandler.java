package com.skripsi.koma.util;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import com.skripsi.koma.dto.ApiResponse;

@RestControllerAdvice
public class CustomExceptionsHandler {
  @Order(1)
  @ExceptionHandler(CustomExceptions.class)
  public ResponseEntity<ApiResponse<Object>> customExceptionHandler(CustomExceptions e, WebRequest webRequest) {
    return new ResponseEntity<>(new ApiResponse<>(false, e.getMessage(), e.getData()), e.getHttpStatus());
  }

  @Order(Ordered.LOWEST_PRECEDENCE)
  @ExceptionHandler({AuthorizationDeniedException.class, AccessDeniedException.class})
  public ResponseEntity<ApiResponse<Object>> accessDeniedHandler(Exception e, WebRequest webRequest) {
    e.printStackTrace();
    return new ResponseEntity<>(new ApiResponse<>(false, "Access denied", null), HttpStatus.FORBIDDEN);
  }

  @Order(Ordered.LOWEST_PRECEDENCE)
  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiResponse<Object>> exceptionHandler(Exception e, WebRequest webRequest) {
    e.printStackTrace();
    return new ResponseEntity<>(new ApiResponse<>(false, "Server Error", null), HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
