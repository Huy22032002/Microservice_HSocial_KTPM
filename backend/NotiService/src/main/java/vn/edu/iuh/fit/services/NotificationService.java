package vn.edu.iuh.fit.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.dtos.NotificationDto;
import vn.edu.iuh.fit.models.Notification;
import vn.edu.iuh.fit.repositories.NotificationRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    public void deleteAllNotificationsByUserId(Long userId) {
        notificationRepository.deleteAllByUserId(userId);
    }

    public void updateNotificationStatus(Long id, boolean status) {
        notificationRepository.updateNotificationIsRead(id, status);
    }

    public void updateAllNotificationStatusByUserId(Long userId, boolean status) {
        notificationRepository.updateAllNotificationIsReadByUserId(userId, status);
    }

    public Notification saveNotification(NotificationDto dto) {
        Notification notification = new Notification();
        notification.setUserId(dto.getUserId());
        notification.setMessage(dto.getMessage());
        notification.setType(dto.getType());
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);
        return notification;
    }

    public List<Notification> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserId(userId);

    }


}
