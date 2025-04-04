package vn.edu.iuh.fit.chatservice.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.iuh.fit.chatservice.dtos.UserDTO;
import vn.edu.iuh.fit.chatservice.exceptions.ErrorResponse;
import vn.edu.iuh.fit.chatservice.models.Conversation;
import vn.edu.iuh.fit.chatservice.services.AuthServiceClient;
import vn.edu.iuh.fit.chatservice.services.ConversationService;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {
    @Autowired
    private ConversationService conversationService;
    @Autowired
    private AuthServiceClient authServiceClient;

    @GetMapping
    public ResponseEntity<?> getAll(){
        List<Conversation> lstConversation = conversationService.getAllConversations();
        if(lstConversation.isEmpty()){
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body(new ErrorResponse(200, "No Conversation", "There are no conversation available", Instant.now()));
        }
        return ResponseEntity.ok(lstConversation);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getAllConversationsOfUser( @PathVariable String userId,
                                                        @RequestHeader(name="Authorization", required = false) String token) {
        try {
            UserDTO userDTO = authServiceClient.getUser(userId, token);
            if(userDTO == null){
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse(404, "Not Found", "User Not Found", Instant.now()));
            }
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
