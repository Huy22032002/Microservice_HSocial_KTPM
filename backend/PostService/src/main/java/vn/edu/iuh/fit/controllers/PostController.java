package vn.edu.iuh.fit.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import vn.edu.iuh.fit.dtos.NotificationDto;
import vn.edu.iuh.fit.dtos.PostRequest;
import vn.edu.iuh.fit.models.*;
import vn.edu.iuh.fit.repositories.CommentRepository;
import vn.edu.iuh.fit.repositories.FileRepository;
import vn.edu.iuh.fit.services.ContentService;
import vn.edu.iuh.fit.services.NotificationProducer;
import vn.edu.iuh.fit.services.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/posts")
public class PostController {
    private final PostService postService;
    private final NotificationProducer notificationProducer;
    @Autowired
    private ContentService contentService;
    @Autowired
    private FileRepository fileRepository;
    @Autowired
    private CommentRepository commentRepository;

    public PostController(PostService postService, NotificationProducer notificationProducer) {
        this.postService = postService;
        this.notificationProducer = notificationProducer;
    }

    @PostMapping("/create")
    public ResponseEntity<Post> createPost(@RequestBody PostRequest postRequest) {
        Post post = postRequest.getPost();
        File file = postRequest.getFile();
        String imageUrl = postRequest.getImageUrl();
        String fileType = postRequest.getFileType();

        // Tạo file và gán vào Content
        file.setFileName(post.getContent().getFiles().get(0).getFileName());
        file.setFileType(fileType);
        file.setFileUrl(imageUrl);

        Content content = new Content();
        content.setText("Bài viết mới");

        // Gán file vào content (quan hệ hai chiều)
        file.setContent(content);
        fileRepository.save(file);
        content.setFiles(post.getContent().getFiles());
        contentService.saveContent(content);


        // Tạo comment
        Comment comment = new Comment();
        comment.setPost(post); // Gán post cho comment

        List<Comment> comments = new ArrayList<>();
        comments.add(comment);

        // Tạo bài viết và gán nội dung, comment
        post.setContent(content);
        post.setComments(comments);
        post.setCreatedAt(LocalDateTime.now());

        // Lưu bài viết
        Post savedPost = postService.savePost(post);

        Post postLast = postService.getLastestPost();
        commentRepository.save(comment);

        // Gửi thông báo sau khi tạo bài viết
        NotificationDto notificationDto = new NotificationDto(
                savedPost.getUserId(),
                "Bạn có một bài viết mới!",
                postLast.getPostId(),
                LocalDateTime.now()
        );
        notificationProducer.sendNotification(notificationDto);

        return ResponseEntity.ok(savedPost);
    }


    //list all public posts
    @GetMapping("/list")
    public List<Post> listAllPublicPosts(){
        return postService.getAllPublicPosts();
    }
    //list
    @GetMapping("/listPost/{userId}")
    public List<Post> listPost(Long userId){
        return postService.getAllPostsByUserId(userId);
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

}
