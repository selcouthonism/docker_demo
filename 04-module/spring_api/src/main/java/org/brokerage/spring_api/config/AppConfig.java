package org.brokerage.spring_api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app")
public class AppConfig {
    private String name;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
