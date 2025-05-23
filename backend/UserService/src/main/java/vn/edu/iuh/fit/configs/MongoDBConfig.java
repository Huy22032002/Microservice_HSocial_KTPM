package vn.edu.iuh.fit.configs;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import vn.edu.iuh.fit.models.UserDetail;
import vn.edu.iuh.fit.models.UserFriend;
import vn.edu.iuh.fit.models.UserStatus;


@Configuration
public class MongoDBConfig {

    @Autowired
    private MongoTemplate mongoTemplate;
//
//    @PostConstruct
//    public void initCollections() {
//        if (!mongoTemplate.collectionExists(UserDetail.class)) {
//            mongoTemplate.createCollection(UserDetail.class);
//        }
//        if (!mongoTemplate.collectionExists(UserFriend.class)) {
//            mongoTemplate.createCollection(UserFriend.class);
//        }
//        if (!mongoTemplate.collectionExists(UserStatus.class)) {
//            mongoTemplate.createCollection(UserStatus.class);
//        }
//    }
}