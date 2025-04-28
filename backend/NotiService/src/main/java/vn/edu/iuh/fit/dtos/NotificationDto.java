package vn.edu.iuh.fit.dtos;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.iuh.fit.models.Notification;
import vn.edu.iuh.fit.models.NotificationType;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
//@JsonSerialize
//@JsonDeserialize
public class NotificationDto implements Serializable {
    private Long userId;
    private String message;

    private Long ContentId;
    private LocalDateTime createdAt;
//    @Enumerated(EnumType.STRING)
    private String type;

    public Notification toEntity() {
        Notification notification = new Notification(userId, message, ContentId,type, false,createdAt);
        return notification;

    }
}