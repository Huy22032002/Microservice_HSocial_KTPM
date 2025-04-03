package vn.edu.iuh.fit.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.iuh.fit.models.Friend;
import vn.edu.iuh.fit.services.FriendService;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
public class FriendController {
    @Autowired
    private FriendService friendService;

    @GetMapping("/id")
    public ResponseEntity<List<Friend>> getListFriend(@RequestParam int id) {
        return ResponseEntity.ok(friendService.getAllFriends(id));
    }
}
