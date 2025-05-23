package vn.edu.iuh.fit.services;

import io.micrometer.common.util.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.models.Token;
import vn.edu.iuh.fit.models.User;
import vn.edu.iuh.fit.utils.JwtTokenUtil;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private JwtTokenUtil jwtTokenUtils;
    @Autowired
    private JwtEncoder jwtEncoder;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private UserService userService;
    @Autowired
    private TokenService tokenService;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UserCacheService userCacheService;

public ResponseEntity<?> login(String username, String password) {
    Map<String, String> errors = new HashMap<>();

    if(StringUtils.isBlank(username)) {
        errors.put("username", "Username is required");
    }
    if(StringUtils.isBlank(password)) {
        errors.put("password", "Password is required");
    }
    if(!errors.isEmpty()) {
        return ResponseEntity.badRequest().body(Map.of("errors", errors));
    }

    // 2. Tìm user từ database
    User user = userService.findByUsername(username);
    if (user == null) {
        return ResponseEntity.status(404).body(Map.of("error", "No User Found in DB"));
    }

    // 3. Kiểm tra password
    if (!passwordEncoder.matches(password, user.getPasswordHash())) {
        return ResponseEntity.status(401).body(Map.of("error", "Wrong Password"));
    }

    try {
        // Xác thực người dùng
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );
        // Lưu vào SecurityContext
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Tạo token JWT
        String jwt = jwtTokenUtils.generateToken(authentication, jwtEncoder);

        Token token = Token.builder()
                .token(jwt)
                .user(user)
                .expiryDate(jwtTokenUtils.generateExpirationDate())
                .revoked(false)
                .build();
        tokenService.save(token);

        // response data gom user va token
        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("user", user);

        // Lưu thông tin user vào cache
        userCacheService.cacheUser(String.valueOf(user.getId()), user);
        // Lưu trạng thái online của user
        userCacheService.setUserOnlineStatus(String.valueOf(user.getId()), true);

        return ResponseEntity.ok(response);

    } catch (Exception e) {
        return ResponseEntity.status(500).body(Map.of("error", "Server error while authenticating"));
    }
}

    public ResponseEntity<?> logout(Long userId,String token) {
        Map<String, String> errors = new HashMap<>();

        if(userId == null) {
            errors.put("userId", "User ID is required");
        }
        if(StringUtils.isBlank(token)) {
            errors.put("token", "Token is required");
        }
        if(!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("errors", errors));
        }

        // Xóa token khỏi Redis
        tokenService.invalidateToken(String.valueOf(userId));
        // Thêm token vào blacklist
        tokenService.addToBlacklist(token, 3600); // 1 hour expiration
        // offline user
        userCacheService.setUserOnlineStatus(String.valueOf(userId), false);

        // Đánh dấu token là revoked
        Token tokenEntity = tokenService.findByToken(token);
        if (tokenEntity != null) {
            tokenEntity.setRevoked(true);
            tokenService.save(tokenEntity);
        }

        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }
}
