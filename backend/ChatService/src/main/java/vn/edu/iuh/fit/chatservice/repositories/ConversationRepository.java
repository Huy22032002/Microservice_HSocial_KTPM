package vn.edu.iuh.fit.chatservice.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import vn.edu.iuh.fit.chatservice.models.Conversation;

import java.util.List;

public interface ConversationRepository extends MongoRepository<Conversation, String> {
//    @Query("{ 'participants': { $all: ?0 } }")
    Conversation findByParticipants(List<String> participants);

    @Query("{ 'participants' : ?0  }")
    List<Conversation> findByUserId(String user);
}
