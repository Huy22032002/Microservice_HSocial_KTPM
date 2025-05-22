package vn.edu.iuh.fit.chatservice.configs;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import vn.edu.iuh.fit.chatservice.models.Conversation;
import vn.edu.iuh.fit.chatservice.models.Message;

@Configuration
public class MongoDBConfig {

    @Autowired
    private MongoTemplate mongoTemplate;

    @PostConstruct
    public void initCollections() {
        if (!mongoTemplate.collectionExists(Conversation.class)) {
            mongoTemplate.createCollection(Conversation.class);
        }
        if (!mongoTemplate.collectionExists(Message.class)) {
            mongoTemplate.createCollection(Message.class);
        }
    }
}