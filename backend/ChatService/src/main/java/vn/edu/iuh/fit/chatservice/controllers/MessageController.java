package vn.edu.iuh.fit.chatservice.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.iuh.fit.chatservice.exceptions.ErrorResponse;
import vn.edu.iuh.fit.chatservice.models.*;
import vn.edu.iuh.fit.chatservice.services.ConversationService;
import vn.edu.iuh.fit.chatservice.services.MessageService;
import vn.edu.iuh.fit.chatservice.services.UserServiceClient;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    @Autowired
    private MessageService messageService;
    @Autowired
    private ConversationService conversationService;

    @PostMapping("/save-message")
    public ResponseEntity<?> saveMessage(@RequestBody Message message) {
        try {
            Conversation conversation = conversationService.getConversationById(message.getConversationId(), message.getSender());
            //cap nhat lastMessage
            LastMessage lastMessage = new LastMessage(message.getContent(), Instant.now());
            conversation.setLastMessage(lastMessage);
            conversation.setUpdatedAt(Instant.now());
            conversationService.updateConversation(conversation);

            message.setCreatedAt(Instant.now());
            messageService.save(message);

            Map<String, Object> map = new HashMap<>();
            map.put("message", message);
            map.put("conversation", conversation);

            return ResponseEntity.ok(map);
        }catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(500, "Internal Server Error", e.getMessage(), Instant.now()));
        }
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getMessageByConversationId(@PathVariable String id){
        try {
            return ResponseEntity.ok(messageService.getAllMessagesByConversationId(id));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ErrorResponse(500, "Internal Server Error", e.getMessage(), Instant.now()));
        }
    }
}
