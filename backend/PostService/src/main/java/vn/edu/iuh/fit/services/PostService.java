package vn.edu.iuh.fit.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.models.Post;
import vn.edu.iuh.fit.repositories.PostRepository;

import java.util.List;

@Service
public class PostService {
    @Autowired
    private PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    public Post savePost(Post post) {
        return postRepository.save(post);
    }

    public void updatePost(Post post) {
        postRepository.save(post);
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public List<Post> getAllPostsByUserId(Long userId) {
        return postRepository.findAllByUserId(userId);
    }


    public Post getPostById(Long id) {
        return postRepository.findById(id).orElse(null);
    }

    public void deletePostById(Long id) {
        postRepository.deleteById(id);
    }

    public Post getLastestPost() {
        return postRepository.findFirstByOrderByCreatedAtDesc();
    }
}
