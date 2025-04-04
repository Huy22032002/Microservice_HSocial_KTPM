package vn.edu.iuh.fit.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.iuh.fit.models.UserDetail;
import vn.edu.iuh.fit.services.UserDetailService;

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

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUserDetail(@RequestBody UserDetail userDetail, @PathVariable int id) {
        try {
            UserDetail updatedUserDetail = userDetailService.update(id, userDetail);
            return ResponseEntity.status(201).body(updatedUserDetail);
        }catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserDetailById(@PathVariable int id) {
        UserDetail userDetail = userDetailService.findById(id);
        return ResponseEntity.status(200).body(userDetail);
    }
}
