package vn.edu.iuh.fit.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import vn.edu.iuh.fit.models.Friend;

import java.util.List;

@Repository
public interface FriendRepositories extends MongoRepository<Friend, String> {

    List<Friend> findAllByUserId(int userId);
}
