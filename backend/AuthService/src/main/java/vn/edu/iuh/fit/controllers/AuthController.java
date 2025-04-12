package vn.edu.iuh.fit.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.iuh.fit.dto.LoginRequest;
import vn.edu.iuh.fit.dto.UserDTO;
import vn.edu.iuh.fit.exceptions.ErrorResponse;
import vn.edu.iuh.fit.models.User;
import vn.edu.iuh.fit.services.AuthService;
import vn.edu.iuh.fit.services.MessageProducer;
import vn.edu.iuh.fit.services.UserService;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class.getName());

    private final AuthService authService;

    @Autowired
    private UserService userService;
    @Autowired
    private MessageProducer messageProducer;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        logger.info("Login request received: {}", loginRequest);
        return authService.login(loginRequest.getUsername(), loginRequest.getPassword());
    }

    @PostMapping("/signup")
    public ResponseEntity<?> createUser2(@RequestBody UserDTO userDTO) {
        Map<String, String> errorMap = new HashMap<>();

        if(userDTO.getUsername() == null) errorMap.put("username", "Username is required");
        if(userDTO.getPassword() == null) errorMap.put("password", "Password is required");
        if(userDTO.getEmail() == null) errorMap.put("email", "Email is required");
        if(userDTO.getPhone() == null) errorMap.put("phone", "Phone is required");

        if(!errorMap.isEmpty()) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, "Bad Request", errorMap.toString(), Instant.now()));
        }
        try {
            User user = userService.createUser(userDTO);
            //goi service UserDetail de tao 1 UserDetail
            System.out.println("User id created: " + user.getId());
            messageProducer.sendUserId(user.getId());

            return ResponseEntity.ok(user);
        }
        catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ErrorResponse(500, "Internal Server Error", e.getMessage(), Instant.now()));
        }

    }

    @GetMapping("/getPublicKey")
    public ResponseEntity<?> getPublicKey() {
        try {
            ClassPathResource resource = new ClassPathResource("certs/public.pem");
            String publicKey = Files.readString(Path.of(resource.getURI()), StandardCharsets.UTF_8);

//      Cach2: String Builder thay vi String -> optimize bo nho
            StringBuilder publicKeyBuilder = new StringBuilder(publicKey);

            int start = publicKeyBuilder.indexOf("-----BEGIN PUBLIC KEY-----");
            if (start != -1) {
                publicKeyBuilder.replace(start, start + "-----BEGIN PUBLIC KEY-----".length(), "");
            }

            int end = publicKeyBuilder.indexOf("-----END PUBLIC KEY-----");
            if (end != -1) {
                publicKeyBuilder.replace(end, end + "-----END PUBLIC KEY-----".length(), "");
            }
            // Xoa tat ca khoang trang( xuong dong, tab, backspace)
            String cleanedPublicKey = publicKeyBuilder.toString().replaceAll("\\s+", "");

            Map<String, String> response = new HashMap<>();
            response.put("publicKey", cleanedPublicKey);
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.status(500).body(new ErrorResponse(500, "Internal Server Error", "Cannot read public key file", Instant.now()));
        }
    }
}
