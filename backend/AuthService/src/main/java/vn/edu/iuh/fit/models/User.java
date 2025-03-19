package vn.edu.iuh.fit.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.util.Date;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(unique = true, nullable = false, length = 50)
    private String username;
    @Column(nullable = false, length = 100)
    private String passwordHash;
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    private String phone;
    @Column(columnDefinition = "TEXT")
    private String avatar;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    private Date created;
    @Enumerated(EnumType.STRING)
    private Role role;

    private boolean enabled;

}
