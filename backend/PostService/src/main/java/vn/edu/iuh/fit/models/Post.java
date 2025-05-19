package vn.edu.iuh.fit.models;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;
import vn.edu.iuh.fit.enums.Privacy;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Inheritance(strategy = InheritanceType.JOINED)
@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "postId"
)
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long postId;

    @Column(nullable = false)
    private int userId;

    @ElementCollection
    private List<Integer> likedUsers;

    @OneToOne(cascade = CascadeType.ALL)
    private Content content;

    @OneToMany(mappedBy = "post")
    private List<Comment> comments;

    @OneToMany(mappedBy = "post")
    @ToString.Exclude
    @JsonIgnore
    private List<SharedPost> sharedPosts;

    private LocalDateTime createdAt;

    private boolean isStory;

    @Enumerated(EnumType.STRING)
    private Privacy postPrivacy;

    public void setIsStory(boolean story) {
        this.isStory = story;
    }

}
