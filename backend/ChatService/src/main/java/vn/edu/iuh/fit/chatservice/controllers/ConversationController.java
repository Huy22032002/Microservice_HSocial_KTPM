package vn.edu.iuh.fit.chatservice.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.iuh.fit.chatservice.models.Conversation;
import vn.edu.iuh.fit.chatservice.services.ConversationService;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {
    @Autowired
    private ConversationService conversationService;

    @GetMapping
    public ResponseEntity<List<Conversation>> getAll(){
        return ResponseEntity.ok(conversationService.getAllConversations());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Conversation>> getAllConversationsOfUser(@PathVariable String userId){
        return ResponseEntity.ok(conversationService.getAllConversationsByUser(userId)) ;
    }
}
