package vn.edu.iuh.fit.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.catalina.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.iuh.fit.exceptions.ErrorResponse;
import vn.edu.iuh.fit.models.UserDetail;
import vn.edu.iuh.fit.services.S3Service;
import vn.edu.iuh.fit.services.UserDetailService;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/userdetails")
public class UserDetailController {
    @Autowired
    private UserDetailService userDetailService;
    @Autowired
    private S3Service s3Service;

    @PostMapping("/create")
    public ResponseEntity<?> createUserDetail(@RequestBody UserDetail userDetail) {

        try {
            UserDetail newUserDetail = userDetailService.create(userDetail);
            return ResponseEntity.status(201).body(newUserDetail);
        } catch (Exception e) {
            return ResponseEntity
                    .status(500)
                    .body(new ErrorResponse(500, "Internal Server Error", e.getMessage(), Instant.now()));
        }
    }

    @PostMapping("/upload-avatar/{id}")
    public ResponseEntity<?> uploadAvatar(@RequestParam("avatar") MultipartFile avatar,
                                          @PathVariable int id,
                                          @RequestParam("data") String dataJson) {
        try {
            //doc userdetail tu dataJson
            ObjectMapper mapper = new ObjectMapper();
            UserDetail userDetail = mapper.readValue(dataJson, UserDetail.class);
            //upload hinh len s3 va lay url gan cho userdetail
            String imageUrl = s3Service.uploadFile(avatar);
            userDetail.setAvatar(imageUrl);
            //update userDetail vao csdl
            UserDetail updatedUserDetail = userDetailService.update(id, userDetail);
            return ResponseEntity.ok(updatedUserDetail);
        } catch (IOException e) {
            return ResponseEntity
                    .status(500)
                    .body(new ErrorResponse(500, e.getMessage(), e.getMessage(), Instant.now()));
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUserDetail(@RequestBody UserDetail userDetail, @PathVariable int id) {
        System.out.println("update: " + userDetail.getAddress());
        try {
            UserDetail updatedUserDetail = userDetailService.update(id, userDetail);
            return ResponseEntity.status(201).body(updatedUserDetail);
        }catch (Exception e) {
            return ResponseEntity
                    .status(500)
                    .body(new ErrorResponse(500, "Internal Server Error", e.getMessage(), Instant.now()));
        }
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserDetailById(@PathVariable int id) {
        try {
            UserDetail userDetail = userDetailService.findById(id);
            if (userDetail == null) {
                return ResponseEntity.status(404).body(
                        new ErrorResponse(404, "Not Found", "User detail not found", Instant.now())
                );
            }
            return ResponseEntity.ok(userDetail);
        } catch (Exception e) {
            return ResponseEntity
                    .status(500)
                    .body(new ErrorResponse(500, "Internal Server Error", e.getMessage(), Instant.now()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> getUserDetailByFullname(@RequestParam("value") String value) {
        if(value == null || value.trim().isEmpty()) {
            return ResponseEntity.status(404).body("null");
        }
        try {
            List<UserDetail> lstUser = userDetailService.findAllByValue(value);
            return ResponseEntity.status(200).body(lstUser);
        }catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse(500, "Internal Server Error", e.getMessage(), Instant.now()));
        }
    }

}
