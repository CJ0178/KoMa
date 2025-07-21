package com.skripsi.koma;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class KomaApplication {

	public static void main(String[] args) {
		SpringApplication.run(KomaApplication.class, args);
	}

}
