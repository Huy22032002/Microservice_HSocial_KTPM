package vn.edu.iuh.fit.dtos;

import lombok.*;
import vn.edu.iuh.fit.models.File;
import vn.edu.iuh.fit.models.Post;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Data
public class PostRequest {
    private Post post;
    private File file;
    private String imageUrl;
    private String fileType;
}
