package vn.edu.iuh.fit.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.iuh.fit.models.UserStatus;
import vn.edu.iuh.fit.services.UserStatusService;

@RestController
@RequestMapping("/api/userstatus")
public class UserStatusController {
    @Autowired
    private UserStatusService userStatusService;

    @PostMapping("/update")
    public ResponseEntity<?> updateUserStatus(UserStatus userStatus) {
        UserStatus userStatus1 = userStatusService.updateUserStatus(userStatus);
        return new ResponseEntity<>(userStatus1, HttpStatus.OK);
    }
}
