package com.makemytrip.makemytrip;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@EnableScheduling
@SpringBootApplication
public class MakemytripApplication {

	public static void main(String[] args) {
		SpringApplication.run(MakemytripApplication.class, args);
	}

}
