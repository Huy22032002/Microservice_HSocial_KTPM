package vn.edu.iuh.fit.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.edu.iuh.fit.enums.Privacy;
import vn.edu.iuh.fit.models.Post;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> , JpaSpecificationExecutor<Post> {
    List<Post> findAllByUserId(int userId);

    List<Post> findAllByUserIdAndPostPrivacy(int userId, Privacy postPrivacy);

    //get lastest post
    Post findFirstByOrderByCreatedAtDesc();

    @Query("SELECT p FROM Post p WHERE p.postPrivacy = :privacy")
    List<Post> findAllPublicPosts(@Param("privacy") Privacy privacy);

    List<Post> findByPostPrivacy(Privacy postPrivacy);
    List<Post> findTop20ByOrderByCreatedAtDesc();
    List<Post> findByContentTextContainingIgnoreCase(String text);


    void deleteByPostId(Long id);
}