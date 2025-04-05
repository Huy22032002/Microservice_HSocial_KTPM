package vn.edu.iuh.fit.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import vn.edu.iuh.fit.models.UserStatus;

@Repository
public interface UserStatusRepositories extends MongoRepository<UserStatus, String> {

    UserStatus findByUserId(int userId);
}
