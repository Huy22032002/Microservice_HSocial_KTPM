package vn.edu.iuh.fit.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    private boolean story;

    public boolean getIsStory() {
        return story;
    }

}
