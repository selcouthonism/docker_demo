package org.brokerage.spring_api.controller;

import org.brokerage.spring_api.config.AppConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
public class HelloWorld {

    //@Value("${app.name}")
    //private String appName;

    private final AppConfig config;

    public HelloWorld(AppConfig config) {
        this.config = config;
    }

    @GetMapping
    public ResponseEntity<String> hello(){
        String timestamp = LocalDateTime.now().toString();

        String responseBody = """
        Hello world from spring_api. 
        The app name is: %s. 
        Current time is: %s
        """.formatted(config.getName(), timestamp);

        return new ResponseEntity<>(responseBody, HttpStatus.OK);
    }
}
