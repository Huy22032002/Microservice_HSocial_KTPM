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

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonSerialize
@JsonDeserialize
public class NotificationDto {
    private Long userId;
    private String message;
    @Enumerated(EnumType.STRING)
    private NotificationType type;

    public Notification toEntity() {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setMessage(message);
        notification.setType(type);
        return notification;
    }
}