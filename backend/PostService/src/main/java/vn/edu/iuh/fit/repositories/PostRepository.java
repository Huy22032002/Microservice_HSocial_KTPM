package vn.edu.iuh.fit.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import vn.edu.iuh.fit.models.Post;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> , JpaSpecificationExecutor<Post> {
    List<Post> findAllByUserId(Long userId);

    //get lastest post
    Post findFirstByOrderByCreatedAtDesc();
}