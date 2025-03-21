package vn.edu.iuh.fit.chatservice.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.iuh.fit.chatservice.models.*;
import vn.edu.iuh.fit.chatservice.services.ConversationService;
import vn.edu.iuh.fit.chatservice.services.MessageService;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    @Autowired
    private MessageService messageService;
    @Autowired
    private ConversationService conversationService;

    @PostMapping("/save-message")
    public ResponseEntity<Message> saveMessage(@RequestBody Message message) {

            Conversation conversation = conversationService.getConversationById(message.getConversationId());
            //cap nhat lastMessage
            LastMessage lastMessage = new LastMessage(message.getContent(), Instant.now());
            conversation.setLastMessage(lastMessage);
            conversation.setUpdatedAt(Instant.now());

            conversationService.updateConversation(conversation);

            message.setCreatedAt(Instant.now());
            messageService.save(message);

            return ResponseEntity.ok(message);
    }
    @GetMapping("{id}")
    public ResponseEntity<List<Message>> getMessageByConversationId(@PathVariable String id){
        return ResponseEntity.ok(messageService.getAllMessagesByConversationId(id));
    }
}
