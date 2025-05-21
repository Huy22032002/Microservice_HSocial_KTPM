package vn.edu.iuh.fit.chatservice.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.chatservice.dtos.UserDTO;
import vn.edu.iuh.fit.chatservice.models.Conversation;
import vn.edu.iuh.fit.chatservice.models.ConversationStatus;
import vn.edu.iuh.fit.chatservice.models.ConversationType;
import vn.edu.iuh.fit.chatservice.models.LastMessage;
import vn.edu.iuh.fit.chatservice.repositories.ConversationRepository;

import java.time.Instant;
import java.util.List;

@Service
public class ConversationService {
    @Autowired
    private ConversationRepository conversationRepository;

    private final UserServiceClient userServiceClient;
    @Autowired
    public ConversationService(UserServiceClient userServiceClient) {
        this.userServiceClient = userServiceClient;
    }

    public List<Conversation> getAllConversations(){
        return conversationRepository.findAll();
    }

    public Conversation checkConversationExist(String userId, String senderId) {
        Conversation conversation = conversationRepository.findByTwoParticipants(userId, senderId);
        if (conversation == null) {
            Conversation newConversation = new Conversation();
            newConversation.setType(ConversationType.SINGLE);
            newConversation.setStatus(ConversationStatus.ACTIVE);
            LastMessage lastMessage = new LastMessage("", null);
            newConversation.setLastMessage(lastMessage);
            newConversation.setParticipants(List.of(userId, senderId));
            newConversation.setUpdatedAt(Instant.now());
            return conversationRepository.save(newConversation);
        }
        return conversation;
    }

    public void updateConversation(Conversation conversation) {
        conversationRepository.save(conversation);
    }
    public Conversation getConversationById(String id, String senderId) {
        return conversationRepository.findById(id).orElse(null);
    }

    public Conversation getSingleConversation(String userId, String senderId) {
        System.out.println(conversationRepository.findByTwoParticipants(userId, senderId));
        return conversationRepository.findByTwoParticipants(userId, senderId);
    }

    public void deleteConversation(String id){
        if(conversationRepository.existsById(id)){
            conversationRepository.deleteById(id);
        }else {
            throw new IllegalArgumentException("Cant delete bc Conversation with id " + id + " not found");
        }
    }

    public List<Conversation> getAllConversationsByUser(String user) {
        //lay token
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String token = (String) authentication.getDetails();

        List<Conversation> lstConversation = conversationRepository.findByUserId(user);
        for(Conversation conversation: lstConversation){
            for(String userId: conversation.getParticipants()){
                if(!userId.equals(user)){ //khong lay minh
                    UserDTO userDetail = userServiceClient.getUserById(userId, token).block();
                    //dat ten conversation theo ten receiver
                    conversation.setName(userDetail.getFullname());
                    conversation.setAvatar(userDetail.getAvatar());
                }
            }
        }
        return lstConversation;
    }
}
