package vn.edu.iuh.fit.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import vn.edu.iuh.fit.models.Comment;
import vn.edu.iuh.fit.models.Post;

public interface CommentRepository extends JpaRepository<Comment, Long>, JpaSpecificationExecutor<Comment> {

    @Query(value = "SELECT c FROM Comment c WHERE c.post.postId = :postId")
    void getAllPostComments(long postId);

    @Modifying
    @Query(value = "DELETE FROM Comment c WHERE c.post.postId = :postId")
    void deleteAllByPostId(long postId);
}