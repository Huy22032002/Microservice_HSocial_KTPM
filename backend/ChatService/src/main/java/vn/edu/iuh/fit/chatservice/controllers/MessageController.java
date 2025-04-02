package vn.edu.iuh.fit.chatservice.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.iuh.fit.chatservice.handles.RabbitProducer;
import vn.edu.iuh.fit.chatservice.models.*;
import vn.edu.iuh.fit.chatservice.services.ConversationService;
import vn.edu.iuh.fit.chatservice.services.MessageService;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    @Autowired
    private MessageService messageService;
    @Autowired
    private ConversationService conversationService;
    @Autowired
    private RabbitProducer rabbitProducer;

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestParam String message) {
        rabbitProducer.sendMessagae(message);
        return ResponseEntity.ok(Map.of("message", message));
    }

    @PostMapping("/save-message")
    public ResponseEntity<Message> saveMessage(@RequestBody Message message) {

            Conversation conversation = conversationService.getConversationById(message.getConversationId());
            //cap nhat lastMessagew
            LastMessage lastMessage = new LastMessage(message.getContent(), Instant.now());
            conversation.setLastMessage(lastMessage);
            conversation.setUpdatedAt(Instant.now());

            conversationService.updateConversation(conversation);

            message.setCreatedAt(Instant.now());
            messageService.save(message);

            return ResponseEntity.ok(message);
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getMessageByConversationId(@PathVariable String id){
        System.out.println(messageService.getAllMessagesByConversationId(id));
        return ResponseEntity.ok(messageService.getAllMessagesByConversationId(id));
    }
}
