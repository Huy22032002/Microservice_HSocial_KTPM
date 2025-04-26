package vn.edu.iuh.fit.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import vn.edu.iuh.fit.models.UserDetail;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDetailRepositories extends MongoRepository<UserDetail, String> {
    Optional<UserDetail> findById(int id);

    List<UserDetail> findByFullnameContainingIgnoreCase(String value);
}
