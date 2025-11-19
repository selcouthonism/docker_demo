package org.brokerage.spring_api.controller;

import org.brokerage.spring_api.config.AppConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

public class HelloWorldTest {

    private AppConfig config;
    private HelloWorld controller;

    @BeforeEach
    void setUp() {
        config = Mockito.mock(AppConfig.class);
        when(config.getName()).thenReturn("spring_api");

        controller = new HelloWorld(config);
    }

    @Test
    void hello_shouldReturnFormattedResponse() {
        ResponseEntity<String> response = controller.hello();

        // Assert HTTP status
        assertThat(response.getStatusCode().value()).isEqualTo(200);

        String body = response.getBody();
        assertThat(body).isNotNull();

        // Validate it contains the app name
        assertThat(body).contains("The app name is: spring_api");

        // Validate it contains a timestamp
        assertThat(body).contains("Current time is:");

        // Validate greeting text
        assertThat(body).contains("Hello world from spring_api.");
    }
}
