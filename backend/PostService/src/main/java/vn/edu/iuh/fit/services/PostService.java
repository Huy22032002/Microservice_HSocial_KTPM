package vn.edu.iuh.fit.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.enums.Privacy;
import vn.edu.iuh.fit.models.Post;
import vn.edu.iuh.fit.repositories.PostRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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

    public List<Post> getAllPostsByUserId(int userId) {
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

    public List<Post> getAllPublicPosts() {
        return postRepository.findByPostPrivacy(Privacy.PUBLIC);
    }

    public List<Post> getFriendPosts(List<Integer> friendIds) {
        List<Post> allFriendsPosts = new ArrayList<>();
        friendIds.forEach(friendId -> {
            List<Post> posts = postRepository.findAllByUserIdAndPostPrivacy(friendId, Privacy.FRIENDS );
            allFriendsPosts.addAll(posts);
        });
        return allFriendsPosts;
    }

    public Optional<Post> findById(Long postId) {
        return postRepository.findById(postId);
    }

    public Optional<Post> toggleLike(Long postId, int userId) {
        Optional<Post> optionalPost = postRepository.findById(postId);
        if (optionalPost.isPresent()) {
            Post post = optionalPost.get();
            List<Integer> likedUsers = post.getLikedUsers();

            if (likedUsers.contains(userId)) {
                likedUsers.remove(Integer.valueOf(userId));
            } else {
                likedUsers.add(userId);
            }

            post.setLikedUsers(likedUsers);
            postRepository.save(post);
            return Optional.of(post);
        }
        return Optional.empty();
    }



}
