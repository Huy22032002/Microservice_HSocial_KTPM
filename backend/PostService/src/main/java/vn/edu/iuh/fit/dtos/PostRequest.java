package vn.edu.iuh.fit.dtos;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.iuh.fit.models.Post;

import java.util.List;


@AllArgsConstructor
@NoArgsConstructor
@Data
public class PostRequest {
    private Post post;
    private String content;
    private List<String> mediaUrls;
}
