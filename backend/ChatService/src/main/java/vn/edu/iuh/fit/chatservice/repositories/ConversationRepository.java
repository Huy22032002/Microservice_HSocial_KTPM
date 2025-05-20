package vn.edu.iuh.fit.chatservice.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import vn.edu.iuh.fit.chatservice.models.Conversation;

import java.util.List;

public interface ConversationRepository extends MongoRepository<Conversation, String> {
    @Query("{participants :  {$all: [?0, ?1]}, 'participants.2': {$exists: false}}")
    Conversation findByTwoParticipants(String participant1, String participant2);

    @Query("{ 'participants' : ?0  }")
    List<Conversation> findByUserId(String user);
}
