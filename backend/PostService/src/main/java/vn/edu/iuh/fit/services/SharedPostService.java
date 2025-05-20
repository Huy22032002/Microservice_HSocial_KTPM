package vn.edu.iuh.fit.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.models.SharedPost;
import vn.edu.iuh.fit.repositories.SharedPostRepository;

import java.util.List;
import java.util.Optional;

@Service
public class SharedPostService {
    // Add these implementations to the PostServiceImpl class
    @Autowired
    private SharedPostRepository sharedPostRepository;

    public SharedPost saveSharedPost(SharedPost sharedPost) {
        return sharedPostRepository.save(sharedPost);
    }

    public List<SharedPost> getSharesByUserId(int userId) {
        return sharedPostRepository.findByUserId(userId);
    }

    public List<SharedPost> getSharesByPostId(Long postId) {
        return sharedPostRepository.findByPostPostId(postId);
    }

    public Optional<SharedPost> findById(Long sharedPostId) {
        return sharedPostRepository.findById(sharedPostId);
    }

    public void deleteSharedPost(SharedPost sharedPost) {
        sharedPostRepository.delete(sharedPost);
    }
}
