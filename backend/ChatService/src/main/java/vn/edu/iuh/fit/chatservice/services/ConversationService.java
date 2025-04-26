package vn.edu.iuh.fit.chatservice.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.chatservice.dtos.UserDTO;
import vn.edu.iuh.fit.chatservice.models.Conversation;
import vn.edu.iuh.fit.chatservice.repositories.ConversationRepository;

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

    public void createConversation(Conversation conversation){
        conversationRepository.save(conversation);
    }

    public Conversation checkConversationExist(List<String> participants) {
        return conversationRepository.findByParticipants(participants);
    }

    public void updateConversation(Conversation conversation) {
        conversationRepository.save(conversation);
    }
    public Conversation getConversationById(String id, String senderId) {
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
