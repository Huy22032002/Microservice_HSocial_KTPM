package vn.edu.iuh.fit.chatservice.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.chatservice.models.Conversation;
import vn.edu.iuh.fit.chatservice.models.ConversationStatus;
import vn.edu.iuh.fit.chatservice.repositories.ConversationRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ConversationService {
    @Autowired
    private ConversationRepository conversationRepository;

    public List<Conversation> getAllConversations(){
        return conversationRepository.findAll();
    }

    public void createConversation(Conversation conversation){
        conversationRepository.save(conversation);
    }

    public Conversation checkConversationExist(List<String> participants) {
        return conversationRepository.findByParticipants(participants);
    }

    public Conversation updateConversation(Conversation conversation) {
        return conversationRepository.save(conversation);
    }

    public Conversation getConversationById(String id){
        return conversationRepository.findById(id).orElse(null);
    }
    public void deleteConversation(String id){
        if(conversationRepository.existsById(id)){
            conversationRepository.deleteById(id);
        }else {
            throw new IllegalArgumentException("Cant delete bc Conversation with id " + id + " not found");
        }
    }

    public List<Conversation> getAllConversationsByUser(String user) {
        return conversationRepository.findByUserId(user);
    }
}
