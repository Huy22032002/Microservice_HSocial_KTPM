package vn.edu.iuh.fit.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import vn.edu.iuh.fit.enums.Privacy;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "sharedPostId"
)
public class SharedPost{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long sharedPostId;

    @ManyToOne
    @JoinColumn(name = "postId")
    private Post post;

    private String shareCaption;

    @Column(nullable = false)
    private int userId;

    private LocalDateTime sharedTime;

    @Enumerated(EnumType.STRING)
    private Privacy sharedPrivacy;

    @OneToMany(mappedBy = "sharedPost")
    private List<Comment> comments;
}