package vn.edu.iuh.fit.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import vn.edu.iuh.fit.models.UserFriend;

@Repository
public interface UserFriendRepositories extends MongoRepository<UserFriend, String> {

    UserFriend findByUserId(int userId);
}
