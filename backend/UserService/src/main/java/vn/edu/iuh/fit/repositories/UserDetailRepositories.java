package vn.edu.iuh.fit.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import vn.edu.iuh.fit.models.UserDetail;

@Repository
public interface UserDetailRepositories extends MongoRepository<UserDetail, String> {
}
