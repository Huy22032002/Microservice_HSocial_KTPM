package vn.edu.iuh.fit.chatservice.controllers;

import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.iuh.fit.chatservice.exceptions.ErrorResponse;
import vn.edu.iuh.fit.chatservice.models.Conversation;
import vn.edu.iuh.fit.chatservice.services.ConversationService;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {
    @Autowired
    private ConversationService conversationService;

    @PostMapping("/checkOrCreate")
    public ResponseEntity<?> createConversation(@RequestParam String user1, @RequestParam String user2) {
        try {
            Conversation conv = conversationService.checkConversationExist(user1, user2);
            if (conv != null) {
                return ResponseEntity.status(HttpStatus.OK).body(conv); // đã tồn tại
            } else {
                return ResponseEntity.status(HttpStatus.CREATED).build(); // vừa tạo
            }
        }catch (Exception e){
            return ResponseEntity.status(500).body(new ErrorResponse(500, "Internal Server Error", e.getMessage(), Instant.now()));
        }
    }

    @GetMapping("/conversation")
    public ResponseEntity<?> getConversation(@RequestParam String userId, @RequestParam String senderId){
        try {
            Conversation conversation = conversationService.getSingleConversation(userId, senderId);
            if(conversation != null){
                return ResponseEntity.ok(conversation);
            }
            else {
                return ResponseEntity.status(404).body(new ErrorResponse(404, "Not found", "Not found Conversation", Instant.now()));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse(404, "Internal Server Error", e.getMessage(), Instant.now()));
        }
    }

    @GetMapping
    @RateLimiter(name = "conversationApi")
    public ResponseEntity<?> getAll(){
        List<Conversation> lstConversation = conversationService.getAllConversations();
        if(lstConversation.isEmpty()){
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body(new ErrorResponse(200, "No Conversation", "There are no conversation available", Instant.now()));
        }
        return ResponseEntity.ok(lstConversation);
    }
    @RateLimiter(name = "conversationApi")
    @GetMapping("/{userId}")
    public ResponseEntity<?> getAllConversationsOfUser( @PathVariable String userId) {
        try {
            List<Conversation> conversations = conversationService.getAllConversationsByUser(userId);
            if (conversations.isEmpty())
                return ResponseEntity.ok(new ErrorResponse(200, "No Conversations", "User has no conversations", Instant.now()));
            return ResponseEntity.ok(conversations);
        }
        catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(500, "Internal Server Error", e.getMessage(), Instant.now()));
        }
    }

}
