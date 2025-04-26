package vn.edu.iuh.fit.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.iuh.fit.dtos.UserStatusDTO;
import vn.edu.iuh.fit.exceptions.ErrorResponse;
import vn.edu.iuh.fit.services.UserStatusService;

import java.time.Instant;

@RestController
@RequestMapping("/api/userStatus")
public class UserStatusController {
    @Autowired
    private UserStatusService userStatusService;

    @PutMapping("/{userId}")
    public ResponseEntity<?> setUserStatus(@PathVariable int userId, @RequestBody UserStatusDTO status, @RequestHeader("Authorization") String token) {
        System.out.println("token: " + token + "userid: " + userId + " status: " + status);
        if (status == null || status.getStatus().isBlank()) {
            return ResponseEntity.badRequest().body("Trạng thái không được để trống");
        }
        try {
            return ResponseEntity.ok(userStatusService.setStatus(userId, status.getStatus()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(500, "Không thể cập nhật trạng thái", e.getMessage(), Instant.now()));
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserStatus(@PathVariable int userId) {
        try {
            return ResponseEntity.ok(userStatusService.getStatus(userId));
        }catch (RuntimeException e) {
            return ResponseEntity
                    .status(404)
                    .body(new ErrorResponse(404, "Không tìm thấy người dùng", e.getMessage(), Instant.now()));
        }
    }
}
