package vn.edu.iuh.fit.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.iuh.fit.dtos.FriendRequest;
import vn.edu.iuh.fit.models.UserFriend;
import vn.edu.iuh.fit.services.UserFriendService;


@RestController
@RequestMapping("/api/friends")
public class FriendController {
    @Autowired
    private UserFriendService friendService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getListFriend(@PathVariable int id) {
        try {
            UserFriend lstFriend = friendService.getAllFriendsOfUser(id);
            return ResponseEntity.ok(lstFriend);
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
    @PostMapping("/add")
    public ResponseEntity<UserFriend> addFriend(@RequestBody FriendRequest friendRequest) {
            return ResponseEntity.ok(friendService.addFriend(friendRequest));
    }
    @PutMapping("/accept")
    public ResponseEntity<?> acceptFriend(@RequestBody FriendRequest friendRequest) {
        try {
            UserFriend acceptedFriend = friendService.acceptFriend(friendRequest);
            return ResponseEntity.ok(acceptedFriend);
        }
        catch (RuntimeException  e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @DeleteMapping("/removeFriend")
    public ResponseEntity<String> removeFriend(@RequestBody FriendRequest friendRequest) {
        try {
            boolean rs = friendService.removeFriend(friendRequest);
            if (rs) {
                return ResponseEntity.ok("Xoa ban be thanh cong");
            }
            else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Không thể xóa bạn bè.");
            }
        }catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @DeleteMapping("/decline")
    public ResponseEntity<?> declineFriend(@RequestBody FriendRequest friendRequest) {
        UserFriend userFriend = friendService.declineFriendRequest(friendRequest);
        return ResponseEntity.ok(userFriend);
    }
}
