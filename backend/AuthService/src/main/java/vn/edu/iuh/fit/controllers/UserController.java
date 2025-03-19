package vn.edu.iuh.fit.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import vn.edu.iuh.fit.models.User;
import vn.edu.iuh.fit.services.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers(){
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PreAuthorize("hasAuthority('SCOPE_ROLE_ROLE_USER')")
    @GetMapping("/test")
    public ResponseEntity<String> getFirstWelcomeMessage(Authentication authentication) {

        return ResponseEntity.ok(
                "Welcome to user service: " + authentication.getName()  +
                        " with scope: " + authentication.getAuthorities());
    }
    @GetMapping("/check-auth")
    public ResponseEntity<?> checkAuth(Authentication authentication) {
        System.out.println("Authorities: " + authentication.getAuthorities());
        return ResponseEntity.ok(authentication.getAuthorities());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<User> getUser(@PathVariable int userId) {
        User user = userService.getUser(userId);
        if (user == null) {
            System.out.println("User not found");
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }
}
