package vn.edu.iuh.fit.chatservice.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.chatservice.models.Message;
import vn.edu.iuh.fit.chatservice.repositories.MessageRepository;

import java.util.List;

@Service
public class MessageService {
    @Autowired
    private MessageRepository messageRepository;

    public List<Message> getAllMessagesByConversationId(String conversationId) {
        return messageRepository.findAllByConversationId(conversationId);
    }

    public Message save(Message message) {
        return messageRepository.save(message);
    }



}
