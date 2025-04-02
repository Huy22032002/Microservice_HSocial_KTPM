package vn.edu.iuh.fit.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
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
@Inheritance(strategy = InheritanceType.JOINED)
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long postId;

    @Column(nullable = false)
    private long userId;

    @OneToMany(mappedBy = "post")
    private List<PostReaction> postReactions;

    @OneToOne(cascade = CascadeType.ALL)
    private Content content;

    @OneToMany(mappedBy = "post")
    private List<Comment> comments;

    @OneToMany(mappedBy = "post")
    private List<SharedPost> sharedPosts;

    private LocalDateTime createdAt;

    private boolean isStory;

    @Enumerated(EnumType.STRING)
    private Privacy postPrivacy;


}
