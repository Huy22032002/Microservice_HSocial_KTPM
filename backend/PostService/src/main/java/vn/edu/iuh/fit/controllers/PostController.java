package vn.edu.iuh.fit.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import vn.edu.iuh.fit.dtos.NotificationDto;
import vn.edu.iuh.fit.enums.NotificationType;
import vn.edu.iuh.fit.models.*;
import vn.edu.iuh.fit.repositories.CommentRepository;
import vn.edu.iuh.fit.repositories.ContentRepository;
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
    public ResponseEntity<Post> createPost(@RequestBody Post post) {
        System.out.println("Post Controller 37");
        // Tạo file và gán vào Content
        File file = new File();

        file.setFileName(post.getContent().getFiles().get(0).getFileName());
        file.setFileType("image/jpeg");
        file.setFileUrl("https://example.com/image.jpg");

        Content content = new Content();
        content.setText("Bài viết mới");

        // Gán file vào content (quan hệ hai chiều)
        file.setContent(content);
//        content.setFiles(List.of(file));
        content.setFiles(post.getContent().getFiles());
        contentService.saveContent(content);
        System.out.println("Post Controller 54"+content);
        Content contentLast = contentService.getLastestContent();
        file.setContent(contentLast);
        System.out.println("Post Controller 56"+file);
        // Lưu file và content trước
        fileRepository.save(file);

        System.out.println("Post Controller 52"+file);


        // Tạo comment
        Comment comment = new Comment();
        comment.setPost(post); // Gán post cho comment

        List<Comment> comments = new ArrayList<>();
        comments.add(comment);

        // Lưu comment trước



        // Tạo bài viết và gán nội dung, comment
        post.setContent(content);
        post.setComments(comments);
        post.setCreatedAt(LocalDateTime.now());

        // Lưu bài viết
        Post savedPost = postService.savePost(post);
        System.out.println("Post Controller 81"+post);

        commentRepository.save(comment);
        System.out.println("Post Controller 83"+comment);
        Post postLast = postService.getLastestPost();
        // Gửi thông báo sau khi tạo bài viết
        NotificationDto notificationDto = new NotificationDto(
                savedPost.getUserId(),
                "Bạn có một bài viết mới!",
//                NotificationType.POST,
                postLast.getPostId(),
                LocalDateTime.now()

        );
        notificationProducer.sendNotification(notificationDto);


        return ResponseEntity.ok(savedPost);
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
