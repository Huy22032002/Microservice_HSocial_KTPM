package vn.edu.iuh.fit.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.retry.annotation.Retryable;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.iuh.fit.dtos.NotificationDto;
import vn.edu.iuh.fit.dtos.PostFetchRequest;
import vn.edu.iuh.fit.dtos.PostRequest;
import vn.edu.iuh.fit.models.*;
import vn.edu.iuh.fit.repositories.CommentRepository;
import vn.edu.iuh.fit.services.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("api/posts")
public class PostController {
    @Autowired
    private PostService postService;
    @Autowired
    private NotificationProducer notificationProducer;
    @Autowired
    private ContentService contentService;
    @Autowired
    private S3Service s3Service;
    @Autowired
    private CommentService commentService;

    public PostController(PostService postService,ContentService contentService, NotificationProducer notificationProducer, S3Service s3Service, CommentService commentService) {
        this.postService = postService;
        this.contentService = contentService;
        this.s3Service = s3Service;
        this.notificationProducer = notificationProducer;
        this.commentService = commentService;
    }

    @Retryable(value = {IOException.class, java.io.IOException.class}, maxAttempts = 3)
    @PostMapping("/s3upload")
    public ResponseEntity<List<String>> uploadFiles(@RequestParam("files") MultipartFile[] files) {
        // Kiểm tra xem có file nào được gửi lên không
        if (files.length == 0) {
            return ResponseEntity.badRequest().body(Collections.singletonList("Không có file nào được gửi lên."));
        }else if (files.length > 3) {
            return ResponseEntity.badRequest().body(Collections.singletonList("Chỉ được tải lên tối đa 3 file."));
        }else{
            System.out.println("Có file được gửi lên");
        }
        List<String> fileUrls = new ArrayList<>();

        // Kiểm tra số lượng file (giới hạn 3 file)
        if (files.length > 3) {
            return ResponseEntity.badRequest().body(Collections.singletonList("Chỉ được tải lên tối đa 3 file."));
        }

        for (MultipartFile file : files) {
            try {
                // Giới hạn dung lượng file (10MB)
                if (file.getSize() > 10 * 1024 * 1024) {
                    return ResponseEntity.badRequest().body(Collections.singletonList("File " + file.getOriginalFilename() + " vượt quá giới hạn 10MB."));
                }

                String fileUrl = s3Service.uploadFile(file);
                fileUrls.add(fileUrl);
            } catch (IOException | java.io.IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonList("Lỗi khi upload file: " + e.getMessage()));
            }
        }
        System.out.println("File URLs: " + fileUrls);
        return ResponseEntity.ok(fileUrls);
    }

    @PostMapping("/create")
    public ResponseEntity<Post> createPost(@RequestBody PostRequest postRequest) {
        System.out.println("PostRequest: " + postRequest);
        Post post = postRequest.getPost();
        System.out.println("PostReceived: " + post);
        List<String> fileUrls = postRequest.getMediaUrls(); // Danh sách URL file từ S3

        // Tạo nội dung bài viết
        Content content = new Content();
        content.setText(postRequest.getContent());
        content.setFiles(fileUrls); // Chỉ lưu danh sách URL file

        contentService.saveContent(content);

        // Gán nội dung vào bài viết
        post.setContent(content);
        post.setCreatedAt(LocalDateTime.now());

        // Lưu bài viết
        Post savedPost = postService.savePost(post);
        System.out.println("Saved Post: " + savedPost);
        Post latestPost = postService.getLastestPost();


        // Tạo thông báo
        NotificationDto notificationDto = new NotificationDto(
                savedPost.getUserId(),
                "Bạn có một bài viết mới!",
                latestPost.getPostId(),
                LocalDateTime.now(),
                "POST"

        );
        notificationProducer.sendNotification(notificationDto);

        return ResponseEntity.ok(savedPost);
    }



//    //list all public posts
//    @GetMapping("/list")
//    public List<Post> listAllPublicPosts(){
//        return postService.getAllPublicPosts();
//    }
    //list
    @PostMapping("/listPost")
    public ResponseEntity<List<Post>> listPost(@RequestBody PostFetchRequest request) {
        int userId = request.getUserId();
        List<Integer> friendIds = request.getFriendIds();

        List<Post> userPosts = postService.getAllPostsByUserId(userId);
        List<Post> publicPosts = postService.getAllPublicPosts();
        List<Post> friendPosts = postService.getFriendPosts(friendIds);
        //lọc bài public post trừ bài của user
        publicPosts.removeIf(post -> post.getUserId() == userId);

        List<Post> allPosts = new ArrayList<>();
        allPosts.addAll(userPosts);
        allPosts.addAll(publicPosts);
        allPosts.addAll(friendPosts);
        //sắp xếp theo thời gian tạo bài viết
        allPosts.sort((post1, post2) -> post2.getCreatedAt().compareTo(post1.getCreatedAt()));
        return ResponseEntity.ok(allPosts);
    }

//    @GetMapping("/userPosts/{user_id}")
//    public ResponseEntity<List<Post>> listUserPost( @PathVariable int user_id) {
//
//
//        List<Post> userPosts = postService.getAllPostsByUserId(user_id);
//
//        List<Post> allPosts = new ArrayList<>();
//        allPosts.addAll(userPosts);
//        //sắp xếp theo thời gian tạo bài viết
//        allPosts.sort((post1, post2) -> post2.getCreatedAt().compareTo(post1.getCreatedAt()));
//        return ResponseEntity.ok(allPosts);
//    }

    @PostMapping("/listPostId")
    public ResponseEntity<List<Long>> listPostId(@RequestBody PostFetchRequest request) {
        int userId = request.getUserId();
        List<Integer> friendIds = request.getFriendIds();

        List<Post> userPosts = postService.getAllPostsByUserId(userId);
        List<Post> publicPosts = postService.getAllPublicPosts();
        List<Post> friendPosts = postService.getFriendPosts(friendIds);
        //lọc bài public post trừ bài của user
        publicPosts.removeIf(post -> post.getUserId() == userId);

        List<Post> allPosts = new ArrayList<>();
        allPosts.addAll(userPosts);
        allPosts.addAll(publicPosts);
        allPosts.addAll(friendPosts);
        //sắp xếp theo thời gian tạo bài viết
        allPosts.sort((post1, post2) -> post2.getCreatedAt().compareTo(post1.getCreatedAt()));

        List<Long> postIds = new ArrayList<>();
        for (Post post : allPosts) {
            postIds.add(post.getPostId());
        }

        return ResponseEntity.ok(postIds);
    }

    //list postId by userId
    @GetMapping("/userPosts/{user_id}")
    public ResponseEntity<List<Post>> listUserPost(@PathVariable int user_id) {
        List<Post> userPosts = postService.getAllPostsByUserId(user_id);
        List<Post> allPosts = new ArrayList<>();
        allPosts.addAll(userPosts);
        //sắp xếp theo thời gian tạo bài viết
        allPosts.sort((post1, post2) -> post2.getCreatedAt().compareTo(post1.getCreatedAt()));
        return ResponseEntity.ok(allPosts);
    }

    //get post by id
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Long id){
        return ResponseEntity.ok(postService.getPostById(id));
    }

    //delete post by id
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePostById(@PathVariable Long id){
        postService.deletePostById(id);
        return ResponseEntity.ok("Delete post successfully!");
    }

    @PostMapping("/{postId}/like/{userId}")
    public ResponseEntity<Map<String, Object>> likePost(@PathVariable Long postId, @PathVariable int userId) {
        Optional<Post> updatedPost = postService.toggleLike(postId, userId);

        if (updatedPost.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Post not found"
            ));
        }

        Post post = updatedPost.get();
        boolean isLiked = post.getLikedUsers().contains(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", isLiked ? "liked" : "unliked");
        response.put("likeCount", post.getLikedUsers().size());

        return ResponseEntity.ok(response);
    }



    @PostMapping("/{postId}/comment")
    public ResponseEntity<?> addCommentToPost(
            @PathVariable Long postId,
            @RequestBody Map<String, Object> payload
    ) {
        try {
            Integer userId = (Integer) payload.get("userId");
            String commentText = (String) payload.get("comment");
            System.out.println("Comment: " + commentText);

            if (commentText == null || commentText.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Nội dung bình luận không được để trống.");
            }

            Optional<Post> optionalPost = postService.findById(postId);
            if (optionalPost.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy bài viết.");
            }

            Post post = optionalPost.get();

            Comment comment = new Comment();
            comment.setContent(commentText);
            comment.setUserId(userId);
            comment.setPost(post);
            comment.setCreatedAt(LocalDateTime.now());

            post.getComments().add(comment);
            postService.savePost(post);

            commentService.saveComment(comment);

            return ResponseEntity.ok("Bình luận đã được thêm.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi thêm bình luận: " + e.getMessage());
        }
    }


}
