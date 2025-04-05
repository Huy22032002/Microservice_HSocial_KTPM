package vn.edu.iuh.fit.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.service.annotation.GetExchange;
import vn.edu.iuh.fit.services.UserStatusService;

@RestController
@RequestMapping("/api/userStatus")
public class UserStatusController {
    @Autowired
    private UserStatusService userStatusService;

    @PostMapping("/{userId}")
    public ResponseEntity<?> setStatus(@PathVariable int userId, @RequestParam String status) {
        return ResponseEntity.ok(userStatusService.setStatus(userId, status)) ;
    }
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserStatus(@PathVariable int userId) {
        return ResponseEntity.ok(userStatusService.getStatus(userId));
    }
}
