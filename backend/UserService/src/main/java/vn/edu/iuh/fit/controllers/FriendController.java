package vn.edu.iuh.fit.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.iuh.fit.dtos.FriendRequest;
import vn.edu.iuh.fit.exceptions.ErrorResponse;
import vn.edu.iuh.fit.models.UserFriend;
import vn.edu.iuh.fit.services.MessageProducer;
import vn.edu.iuh.fit.services.UserFriendService;

import java.time.Instant;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/friends")
public class FriendController {
    @Autowired
    private  UserFriendService friendService;
    @Autowired
    private MessageProducer messageProducer;

    @GetMapping("/suggest/{userId}")
    public ResponseEntity<?> suggestFriends(@PathVariable int userId) {
        List<Map<String, Object>> suggestions = friendService.suggestFriends(userId);
        return ResponseEntity.ok(suggestions);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addFriend(@RequestBody FriendRequest friendRequest) {
        System.out.println("UserId: " + friendRequest.getUserId() + ", FriendId: " + friendRequest.getFriendId());

        try {
            if (friendRequest == null || friendRequest.getUserId() == 0 || friendRequest.getFriendId() == 0) {
                return ResponseEntity.badRequest().body(new ErrorResponse(400, "Bad Request", "Thiếu thông tin bạn bè", Instant.now()));
            }
            //gui message qua notification service
            messageProducer.sendToNotificationService(friendRequest);
            //loai bo khoi danh sach goi y
            friendService.removeSuggestion(friendRequest.getUserId(), friendRequest.getFriendId());

            return ResponseEntity.ok(friendService.addFriend(friendRequest));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(500, "Internal Server Error", e.getMessage(), Instant.now()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getListFriend(@PathVariable int id) {
        try {
            UserFriend lstFriend = friendService.getAllFriendsOfUser(id);
            return ResponseEntity.ok(lstFriend);
        }
        catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(500, "Internal Server Error", e.getMessage(), Instant.now()));
        }
    }
    @GetMapping("/name/{id}")
    public ResponseEntity<?> getListFriendsWithName(@PathVariable int id) {
        try {
            List<Map<String, Object>> lstFriend = friendService.getAllFriendsWithFullNameOfUser(id);
            return ResponseEntity.ok(lstFriend);
        }catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(500, "Internal Server Error", e.getMessage(), Instant.now()));
        }
    }

    @GetMapping("{id}/pending")
    public ResponseEntity<?> getListPending(@PathVariable int id) {
        try{
            UserFriend lstPending = friendService.getListPendingOfUser(id);
            return ResponseEntity.ok(lstPending);
        } catch (Exception e) {
            return ResponseEntity
                    .status(500)
                    .body(new ErrorResponse(500, "Internal Server Error", e.getMessage(), Instant.now()));
        }
    }

    @PutMapping("/accept")
    public ResponseEntity<?> acceptFriend(@RequestBody FriendRequest friendRequest) {
        System.out.println("UserId: " + friendRequest.getUserId() + ", FriendId: " + friendRequest.getFriendId());
        try {
            if (friendRequest == null || friendRequest.getUserId() == 0 || friendRequest.getFriendId() == 0) {
                return ResponseEntity.badRequest().body(new ErrorResponse(400, "Bad Request", "Thiếu thông tin bạn bè", Instant.now()));
            }
            UserFriend acceptedFriend = friendService.acceptFriend(friendRequest);
            return ResponseEntity.ok(acceptedFriend);
        }
        catch (RuntimeException  e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(404, "Not Found", e.getMessage(), Instant.now()));
        }
    }
    @DeleteMapping("/removeFriend")
    public ResponseEntity<?> removeFriend(@RequestBody FriendRequest friendRequest) {
        if (friendRequest == null || friendRequest.getUserId() == 0 || friendRequest.getFriendId() == 0) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, "Bad Request", "Thiếu thông tin bạn bè", Instant.now()));
        }
        try {
            boolean rs = friendService.removeFriend(friendRequest);
            if (rs) {
                return ResponseEntity.ok("Xoa ban be thanh cong");
            }
            else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Không thể xóa bạn bè.");
            }
        }catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Not Found", e.getMessage(), Instant.now()));
        }
    }
    @DeleteMapping("/decline")
    public ResponseEntity<?> declineFriend(@RequestBody FriendRequest friendRequest) {
        if (friendRequest == null || friendRequest.getUserId() == 0 || friendRequest.getFriendId() == 0) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, "Bad Request", "Thiếu thông tin bạn bè", Instant.now()));
        }
        System.out.println("UserId: " + friendRequest.getUserId() + ", FriendId: " + friendRequest.getFriendId());
        try {
            UserFriend userFriend = friendService.declineFriendRequest(friendRequest);
            return ResponseEntity.ok(userFriend);
        }catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(404, "Not Found", e.getMessage(), Instant.now()));
        }
    }
}
