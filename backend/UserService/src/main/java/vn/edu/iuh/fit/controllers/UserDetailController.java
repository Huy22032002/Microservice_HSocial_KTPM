package vn.edu.iuh.fit.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.iuh.fit.models.UserDetail;
import vn.edu.iuh.fit.services.UserDetailService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/userdetails")
public class UserDetailController {
    @Autowired
    private UserDetailService userDetailService;

    @PostMapping("/create")
    public ResponseEntity<?> createUserDetail(@RequestBody UserDetail userDetail) {
        try {
            UserDetail newUserDetail = userDetailService.create(userDetail);
            return ResponseEntity.status(201).body(newUserDetail);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
