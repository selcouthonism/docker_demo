package org.brokerage.spring_api.controller;

import org.brokerage.spring_api.config.AppConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest
public class HelloWorldWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AppConfig config;

    @Test
    void hello_shouldReturnFormattedResponse() throws Exception {
        when(config.getName()).thenReturn("spring_api");

        mockMvc.perform(get("/")) // GET mapping of the controller
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Hello world from spring_api.")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("The app name is: spring_api.")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Current time is:")));
    }
}
