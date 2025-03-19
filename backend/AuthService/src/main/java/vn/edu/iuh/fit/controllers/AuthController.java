package vn.edu.iuh.fit.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.iuh.fit.dto.LoginRequest;
import vn.edu.iuh.fit.dto.UserDTO;
import vn.edu.iuh.fit.models.User;
import vn.edu.iuh.fit.services.AuthService;
import vn.edu.iuh.fit.services.UserService;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@RestController
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class.getName());

    private final AuthService authService;

    @Autowired
    private UserService userService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        return authService.login(loginRequest.getUsername(), loginRequest.getPassword());
    }

    @PostMapping("/signup")
    public ResponseEntity<?> createUser(@RequestBody UserDTO userDTO) {
        try {
            User user = userService.createUser(userDTO);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/auth/getPublicKey")
    public ResponseEntity<Map<String, String>> getPublicKey() {
        try {
            ClassPathResource resource = new ClassPathResource("certs/public.pem");
            String publicKey = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);

            // Loại bỏ header/footer và xuống dòng
            publicKey = publicKey.replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s", "");

            // Trả về JSON thay vì string thuần
            Map<String, String> response = new HashMap<>();
            response.put("publicKey", publicKey);
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Cannot read public key file"));
        }
    }
}
