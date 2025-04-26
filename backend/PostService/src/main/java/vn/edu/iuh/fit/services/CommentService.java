package vn.edu.iuh.fit.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.models.Comment;
import vn.edu.iuh.fit.repositories.CommentRepository;

@Service
public class CommentService {
    public CommentService() {
    }

    @Autowired
    private CommentRepository commentRepository;

    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }

    public void updateComment(Comment comment) {
        commentRepository.save(comment);
    }

    public void createComment(Comment comment) {
        commentRepository.save(comment);
    }

    public void getAllPostComments(String postId) {
        commentRepository.getAllPostComments(postId);
    }

    public void saveComment(Comment comment) {
        commentRepository.save(comment);
    }
}
