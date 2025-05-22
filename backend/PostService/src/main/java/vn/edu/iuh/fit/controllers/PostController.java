package vn.edu.iuh.fit.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.io.IOException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.retry.annotation.Retryable;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.iuh.fit.dtos.NotificationDto;
import vn.edu.iuh.fit.dtos.PostFetchRequest;
import vn.edu.iuh.fit.dtos.PostRequest;
import vn.edu.iuh.fit.enums.Privacy;
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
    @Autowired
    private SharedPostService sharedPostService;



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
        System.out.println("PostRequest: " + postRequest.toString());
        Post post = postRequest.getPost();
        System.out.println("PostReceived: " + post.toString());
        List<String> fileUrls = postRequest.getMediaUrls(); // Danh sách URL file từ S3

        // Tạo nội dung bài viết
        Content content = new Content();
        content.setText(postRequest.getContent());
        content.setFiles(fileUrls); // Chỉ lưu danh sách URL file

        contentService.saveContent(content);

        // Gán nội dung vào bài viết
        post.setContent(content);
        post.setIsStory(postRequest.getIsStory());
        post.setCreatedAt(LocalDateTime.now());
//        post.isStory(); // Mặc định là false, có thể thay đổi sau này
        // Lưu bài viết
        Post savedPost = postService.savePost(post);
        System.out.println("Saved Post: " + savedPost);
        Post latestPost = postService.getLastestPost();


        // Tạo thông báo
        NotificationDto notificationDto = new NotificationDto(
                savedPost.getUserId(),
                "Bạn có một story mới!",
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
        //lọc tất cả bài viết, chỉ lấy post có isStory = false
        allPosts.removeIf(post -> post.isStory() == true);
        return ResponseEntity.ok(allPosts);
    }
    @PostMapping("/stories")
    public ResponseEntity<List<Post>> listStory(@RequestBody PostFetchRequest request) {
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
        //lọc tất cả bài viết, chỉ lấy post có isStory = true
        allPosts.removeIf(post -> post.isStory() == false);
        //chỉ lấy bài viêt trong 24h
        LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);
        allPosts.removeIf(post -> post.getCreatedAt().isBefore(oneDayAgo));

        return ResponseEntity.ok(allPosts);
    }
    //list post by userId
    @GetMapping("/listPost/{user_id}")
    public ResponseEntity<List<Post>> listUserPost(@PathVariable int user_id) {
        List<Post> userPosts = postService.getAllPostsByUserId(user_id);
        List<Post> allPosts = new ArrayList<>();
        allPosts.addAll(userPosts);
        //sắp xếp theo thời gian tạo bài viết
        allPosts.sort((post1, post2) -> post2.getCreatedAt().compareTo(post1.getCreatedAt()));
        return ResponseEntity.ok(allPosts);
    }

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

//    //list postId by userId
//    @GetMapping("/userPosts/{user_id}")
//    public ResponseEntity<List<Post>> listUserPost(@PathVariable int user_id) {
//        List<Post> userPosts = postService.getAllPostsByUserId(user_id);
//        List<Post> allPosts = new ArrayList<>();
//        allPosts.addAll(userPosts);
//        //sắp xếp theo thời gian tạo bài viết
//        allPosts.sort((post1, post2) -> post2.getCreatedAt().compareTo(post1.getCreatedAt()));
//        return ResponseEntity.ok(allPosts);
//    }

    //get all postId và SharedPostId sắp xếp theo thời gian tạo bài viết hoặc thời gian share map<String,Long> trong do string la loai post long la postId hoac sharedPostId
    @PostMapping("/listPostIdAndSharedPostId")
    public ResponseEntity<List<Map<String, Long>>> listPostIdsAndSharedPostIds(@RequestBody PostFetchRequest request) {
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
        List<Map<String, Long>> postIdsList = new ArrayList<>();
        for (Post post : allPosts) {
            Map<String, Long> postMap = new HashMap<>();
            postMap.put("post", post.getPostId());
            postIdsList.add(postMap);

            for (SharedPost sharedPost : post.getSharedPosts()) {
                Map<String, Long> sharedPostMap = new HashMap<>();
                sharedPostMap.put("sharedPost", sharedPost.getSharedPostId());
                postIdsList.add(sharedPostMap);
            }
        }
        //lọc tất cả bài viết, chỉ lấy post có isStory = false
        postIdsList.removeIf(map -> {
            Long postId = map.get("post");
            Long sharedPostId = map.get("sharedPost");
            if (postId != null) {
                Post post = postService.getPostById(postId);
                return post.isStory() == true;
            } else if (sharedPostId != null) {
                SharedPost sharedPost = sharedPostService.findById(sharedPostId).orElse(null);
                return sharedPost != null && sharedPost.getPost().isStory() == true;
            }
            return false;
        });
        //sắp xếp thời gian tạo bài viết/ thời gian share. So sánh lẫn lộn 2 loại bài viết
        postIdsList.sort((map1, map2) -> {
            Long postId1 = map1.get("post");
            Long postId2 = map2.get("post");
            Long sharedPostId1 = map1.get("sharedPost");
            Long sharedPostId2 = map2.get("sharedPost");

            LocalDateTime time1 = null;
            LocalDateTime time2 = null;

            if (postId1 != null) {
                Post post1 = postService.getPostById(postId1);
                time1 = post1.getCreatedAt();
            } else if (sharedPostId1 != null) {
                SharedPost sharedPost1 = sharedPostService.findById(sharedPostId1).orElse(null);
                if (sharedPost1 != null) {
                    time1 = sharedPost1.getSharedTime();
                }
            }

            if (postId2 != null) {
                Post post2 = postService.getPostById(postId2);
                time2 = post2.getCreatedAt();
            } else if (sharedPostId2 != null) {
                SharedPost sharedPost2 = sharedPostService.findById(sharedPostId2).orElse(null);
                if (sharedPost2 != null) {
                    time2 = sharedPost2.getSharedTime();
                }
            }

            return time2.compareTo(time1);
        });

        return ResponseEntity.ok(postIdsList);
    }


    //get post by id
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Long id){
        return ResponseEntity.ok(postService.getPostById(id));
    }

    //delete post by id
    @Transactional
    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable Long postId) {
        try {
            // First delete all comments
            commentService.deleteAllCommentsByPostId(postId);
            // Then delete all shared posts
            List<SharedPost> sharedPosts = sharedPostService.getSharesByPostId(postId);
            for (SharedPost sharedPost : sharedPosts) {
                commentService.deleteAllCommentsBySharedPostId(sharedPost.getSharedPostId());
                sharedPostService.deleteSharedPost(sharedPost);
            }
            // Then delete the content and files
            Optional<Post> optionalPost = postService.findById(postId);
            if (optionalPost.isPresent()) {
                Post post = optionalPost.get();
                Content content = post.getContent();
                if (content != null) {
                    contentService.deleteContent(content.getContentId());
                    // Delete files from S3
                    for (String fileUrl : content.getFiles()) {
                        s3Service.deleteFile(fileUrl);
                    }
                }
            }
            // Finally delete the post
            postService.deletePostById(postId);

            return ResponseEntity.ok("Bài viết đã được xóa thành công");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi xóa bài viết: " + e.getMessage());
        }
    }

    @PostMapping("/{postId}/share/{userId}/{privacy}")
    public ResponseEntity<?> sharePost(
            @PathVariable Long postId,
            @PathVariable int userId,
            @PathVariable String privacy,
            @RequestBody(required = false) Map<String, Object> payload
    ) {
        try {
            // Check if post exists
            Optional<Post> optionalPost = postService.findById(postId);
            if (optionalPost.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy bài viết.");
            }

            Post post = optionalPost.get();

            // Check privacy settings - if the post is private, it shouldn't be shared
            if (post.getPostPrivacy() == Privacy.PRIVATE) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Không thể chia sẻ bài viết riêng tư.");
            }

            // Create new SharedPost entity
            SharedPost sharedPost = new SharedPost();
            sharedPost.setPost(post);
            sharedPost.setUserId(userId);
            sharedPost.setSharedTime(LocalDateTime.now());
            sharedPost.setSharedPrivacy(Privacy.valueOf(privacy));

            // Add caption if provided
            if (payload != null && payload.containsKey("caption")) {
                String caption = (String) payload.get("caption");
                sharedPost.setShareCaption(caption);
            }

            // Save the shared post
            SharedPost savedShare = sharedPostService.saveSharedPost(sharedPost);

            // Create notification for original poster
            if (post.getUserId() != userId) { // Don't notify if user shares their own post
                NotificationDto notificationDto = new NotificationDto(
                        post.getUserId(),
                        "Bài viết của bạn đã được chia sẻ!",
                        post.getPostId(),
                        LocalDateTime.now(),
                        "SHARE"
                );
                notificationProducer.sendNotification(notificationDto);
            }

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Bài viết đã được chia sẻ thành công",
                    "sharedPostId", savedShare.getSharedPostId()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi chia sẻ bài viết: " + e.getMessage());
        }
    }

    @GetMapping("/shared/{userId}")
    public ResponseEntity<List<SharedPost>> getSharedPostsByUser(@PathVariable int userId) {
        List<SharedPost> sharedPosts = sharedPostService.getSharesByUserId(userId);
        return ResponseEntity.ok(sharedPosts);
    }

    @GetMapping("/{postId}/shares")
    public ResponseEntity<List<SharedPost>> getSharesForPost(@PathVariable Long postId) {
        List<SharedPost> shares = sharedPostService.getSharesByPostId(postId);
        return ResponseEntity.ok(shares);
    }

    @GetMapping("/{postId}/shareCount")
    public ResponseEntity<Map<String, Long>> getShareCount(@PathVariable Long postId) {
        List<SharedPost> shares = sharedPostService.getSharesByPostId(postId);
        return ResponseEntity.ok(Map.of("shareCount", (long) shares.size()));
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


    @PostMapping("/post/{postId}/comment")
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

    //thêm comment cho sharedPost
    @PostMapping("/shared/{sharedPostId}/comment")
    public ResponseEntity<?> addCommentToSharedPost(
            @PathVariable Long sharedPostId,
            @RequestBody Map<String, Object> payload
    ) {
        try {
            Integer userId = (Integer) payload.get("userId");
            String commentText = (String) payload.get("comment");

            if (commentText == null || commentText.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Nội dung bình luận không được để trống.");
            }

            Optional<SharedPost> optionalSharedPost = sharedPostService.findById(sharedPostId);
            if (optionalSharedPost.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy bài viết.");
            }

            SharedPost sharedPost = optionalSharedPost.get();

            Comment comment = new Comment();
            comment.setContent(commentText);
            comment.setUserId(userId);
            comment.setSharedPost(sharedPost);
            comment.setCreatedAt(LocalDateTime.now());

            sharedPost.getComments().add(comment);
            sharedPostService.saveSharedPost(sharedPost);

            commentService.saveComment(comment);

            return ResponseEntity.ok("Bình luận đã được thêm.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi khi thêm bình luận: " + e.getMessage());
        }
    }

    /**
     * Endpoint để chỉnh sửa nội dung bài viết
     */
    @PutMapping("/{postId}/edit")
    public ResponseEntity<?> editPost(@PathVariable Long postId, @RequestBody Map<String, String> payload) {
        try {
            String editedContent = payload.get("content");

            if (editedContent == null || editedContent.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Nội dung bài viết không được để trống.");
            }

            Optional<Post> optionalPost = postService.findById(postId);
            if (optionalPost.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy bài viết.");
            }

            Post post = optionalPost.get();
            Content content = post.getContent();
            content.setText(editedContent);

            contentService.saveContent(content);
            post.setContent(content);
            Post updatedPost = postService.savePost(post);

            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi cập nhật bài viết: " + e.getMessage());
        }
    }

    /**
     * Endpoint để cập nhật quyền riêng tư của bài viết
     */
    @PutMapping("/{postId}/privacy")
    public ResponseEntity<?> updatePostPrivacy(@PathVariable Long postId, @RequestBody Map<String, String> payload) {
        try {
            String privacy = payload.get("privacy");

            if (privacy == null || privacy.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Quyền riêng tư không được để trống.");
            }

            // Kiểm tra giá trị privacy hợp lệ
            if (!privacy.equals("PUBLIC") && !privacy.equals("FRIENDS") && !privacy.equals("PRIVATE")) {
                return ResponseEntity.badRequest().body("Giá trị quyền riêng tư không hợp lệ.");
            }

            Optional<Post> optionalPost = postService.findById(postId);
            if (optionalPost.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy bài viết.");
            }

            Post post = optionalPost.get();
            post.setPostPrivacy(Privacy.valueOf(privacy));
            Post updatedPost = postService.savePost(post);

            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi cập nhật quyền riêng tư bài viết: " + e.getMessage());
        }
    }


    /**
     * Endpoint để lấy bài viết mới nhất cho trang chủ
     */
    @GetMapping("/latest")
    public ResponseEntity<List<Post>> getLatestPosts(@RequestParam(defaultValue = "20") int limit) {
        List<Post> latestPosts = postService.getLatestPosts(limit);
        latestPosts.removeIf(post -> post.isStory() == true);
        return ResponseEntity.ok(latestPosts);
    }

    /**
     * Endpoint để lấy stories mới nhất (trong 24 giờ qua)
     */
    @GetMapping("/latest-stories")
    public ResponseEntity<List<Post>> getLatestStories(@RequestParam(defaultValue = "20") int limit) {
        LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);

        List<Post> stories = postService.getLatestPosts(limit)
                .stream()
                .filter(post -> post.isStory() && post.getCreatedAt().isAfter(oneDayAgo))
                .toList();

        return ResponseEntity.ok(stories);
    }

    /**
     * Endpoint để tìm kiếm bài viết theo nội dung
     */
    @GetMapping("/search")
    public ResponseEntity<List<Post>> searchPosts(@RequestParam String query) {
        List<Post> searchResults = postService.searchPostsByContent(query);
        return ResponseEntity.ok(searchResults);
    }


    @GetMapping("/shared/detail/{sharedPostId}")
    public ResponseEntity<SharedPost> getSharedPostDetail(@PathVariable Long sharedPostId) {
        Optional<SharedPost> sharedPost = sharedPostService.findById(sharedPostId);
        if (sharedPost.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(sharedPost.get());
    }

    //delete sharedPost by id
    @Transactional
    @DeleteMapping("/shared/{sharedPostId}")
    public ResponseEntity<?> deleteSharedPost(@PathVariable Long sharedPostId) {
        try {
            // First delete all comments
            commentService.deleteAllCommentsBySharedPostId(sharedPostId);

            // Finally delete the post
            sharedPostService.findById(sharedPostId).ifPresent(sharedPost -> {
                Post post = sharedPost.getPost();
                post.getSharedPosts().remove(sharedPost);
                postService.savePost(post);
            });
            sharedPostService.findById(sharedPostId).ifPresent(sharedPost -> {
                sharedPostService.deleteSharedPost(sharedPost);
            });

            return ResponseEntity.ok("Bài viết đã được xóa thành công");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi xóa bài viết: " + e.getMessage());
        }
    }

    @PutMapping("/shared/{sharedPostId}/privacy")
    public ResponseEntity<?> updateSharedPostPrivacy(@PathVariable Long sharedPostId, @RequestBody Map<String, String> payload) {
        try {
            String privacy = payload.get("privacy");

            if (privacy == null || privacy.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Quyền riêng tư không được để trống.");
            }

            // Kiểm tra giá trị privacy hợp lệ
            if (!privacy.equals("PUBLIC") && !privacy.equals("FRIENDS") && !privacy.equals("PRIVATE")) {
                return ResponseEntity.badRequest().body("Giá trị quyền riêng tư không hợp lệ.");
            }

            Optional<SharedPost> optionalSharedPost = sharedPostService.findById(sharedPostId);
            if (optionalSharedPost.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy bài viết.");
            }

            SharedPost sharedPost = optionalSharedPost.get();
            sharedPost.setSharedPrivacy(Privacy.valueOf(privacy));
            SharedPost updatedSharedPost = sharedPostService.saveSharedPost(sharedPost);

            return ResponseEntity.ok(updatedSharedPost);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi cập nhật quyền riêng tư bài viết: " + e.getMessage());
        }
    }

    @PutMapping("/shared/{sharedPostId}/edit")
    public ResponseEntity<?> editSharedPost(@PathVariable Long sharedPostId, @RequestBody Map<String, String> payload) {
        try {
            String editedContent = payload.get("content");

            if (editedContent == null || editedContent.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Nội dung bài viết không được để trống.");
            }

            Optional<SharedPost> optionalSharedPost = sharedPostService.findById(sharedPostId);
            if (optionalSharedPost.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy bài viết.");
            }

            SharedPost sharedPost = optionalSharedPost.get();
            Post post = sharedPost.getPost();
            Content content = post.getContent();
            content.setText(editedContent);

            contentService.saveContent(content);
            post.setContent(content);
            Post updatedPost = postService.savePost(post);

            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi cập nhật bài viết: " + e.getMessage());
        }
    }
}
