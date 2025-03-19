package vn.edu.iuh.fit.chatservice.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.iuh.fit.chatservice.models.*;
import vn.edu.iuh.fit.chatservice.services.ConversationService;
import vn.edu.iuh.fit.chatservice.services.MessageService;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    @Autowired
    private MessageService messageService;
    @Autowired
    private ConversationService conversationService;

    @PostMapping("/save-message")
    public ResponseEntity<Message> saveMessage(@RequestBody Message message) {
        //check conversation da co chua
        List<String> participants = new ArrayList<>(message.getReceivers());
        participants.add(message.getSender());
        Conversation conversation = conversationService.checkConversationExist(participants);
        if (conversation == null) {
            conversation = new Conversation();
            conversation.setParticipants(participants);

            //cap nhat lastMessage
            LastMessage lastMessage = new LastMessage(message.getContent(), Instant.now());
            conversation.setLastMessage(lastMessage);
            //xac dinh loai conversation
            if(participants.size() > 2){
                conversation.setType(ConversationType.GROUP);
            } else {
                conversation.setType(ConversationType.SINGLE);
            }
            conversation.setUpdatedAt(Instant.now());
            conversation.setStatus(ConversationStatus.ACTIVE);

            conversationService.createConversation(conversation);
        }
        message.setConversationId(conversation.getId());
        message.setCreatedAt(Instant.now());
        Message savedMessage = messageService.save(message);

        return ResponseEntity.ok(savedMessage);
    }
}
