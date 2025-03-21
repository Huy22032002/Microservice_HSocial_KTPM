package vn.edu.iuh.fit.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import vn.edu.iuh.fit.enums.Reaction;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PostReaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long postReactionId;
    @Enumerated(EnumType.ORDINAL)
    private Reaction reaction;

    @ManyToOne
    @JoinColumn(name = "postId")
    private Post post;

    @Column(nullable = false)
    private int userId;

    public PostReaction(Reaction reaction) {
        this.reaction = reaction;
    }

}
