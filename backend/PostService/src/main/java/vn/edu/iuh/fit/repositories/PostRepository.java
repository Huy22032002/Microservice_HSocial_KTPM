package vn.edu.iuh.fit.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import vn.edu.iuh.fit.models.Post;

public interface PostRepository extends JpaRepository<Post, Long> , JpaSpecificationExecutor<Post> {
  }