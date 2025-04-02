package vn.edu.iuh.fit.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String message;

    private Long contentId;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private boolean isRead;

    private LocalDateTime createdAt;

    public Notification(Long userId, String message, Long contentId, NotificationType type, boolean isRead, LocalDateTime createdAt) {
        this.userId = userId;
        this.message = message;
        this.contentId = contentId;
        this.type = type;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }
}
