package vn.edu.iuh.fit.chatservice.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import vn.edu.iuh.fit.chatservice.models.Message;

import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {

    List<Message> findAllByConversationId(String conversationId);
}
