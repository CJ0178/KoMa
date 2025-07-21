package com.skripsi.koma.config;

import java.util.Collections;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class OpenDocConfig {
  private static final String AUTHORIZATION = "Authorization";

  @Bean
  public OpenAPI customOpenAPI() {
    return new OpenAPI()
        .components(new Components().addSecuritySchemes(AUTHORIZATION, accessKeyySecuritySchema()))
        .info(new Info().title("KOMA API DOC"))
        .security(Collections.singletonList(new SecurityRequirement().addList(AUTHORIZATION)));
  }

  public SecurityScheme accessKeyySecuritySchema() {
    return new SecurityScheme()
        .name(AUTHORIZATION)
        .description("User JWT Token Authorization")
        .in(SecurityScheme.In.HEADER)
        .type(SecurityScheme.Type.APIKEY);
  }
}
