package com.vaultora.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Lets React Router handle a direct visit or refresh of a client-side route
 * after the frontend has been packaged into Spring Boot's static resources.
 */
@Controller
public class SpaController {
    @GetMapping({"/login", "/register", "/unlock", "/vault", "/generator", "/settings"})
    public String application() {
        return "forward:/index.html";
    }
}
