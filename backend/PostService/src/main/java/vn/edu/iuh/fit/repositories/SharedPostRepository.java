package vn.edu.iuh.fit.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import vn.edu.iuh.fit.models.SharedPost;

import java.util.List;

public interface SharedPostRepository extends JpaRepository<SharedPost, Long> , JpaSpecificationExecutor<SharedPost> {
  List<SharedPost> findByUserId(int userId);
  List<SharedPost> findByPostPostId(Long postId);
  // Add these methods to the PostService interface
  List<SharedPost> getSharesByUserId(int userId);
  @Query("select p FROM SharedPost p WHERE p.post.postId= :postid")
  List<SharedPost> getSharesByPostId(Long postId);
}