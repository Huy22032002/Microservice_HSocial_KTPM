package vn.edu.iuh.fit.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.iuh.fit.dtos.NotificationDto;
import vn.edu.iuh.fit.models.Notification;
import vn.edu.iuh.fit.models.NotificationType;
import vn.edu.iuh.fit.services.NotificationService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // Gửi thông báo mới
    @PostMapping
    public ResponseEntity<Notification> sendNotification(@RequestBody NotificationDto notificationDto) {
        Notification notification = new Notification();
        notification.setUserId(notificationDto.getUserId());
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setMessage("Bạn có một thông báo mới từ bài viết với ID: " + notificationDto.getContentId());
        notification.setType(NotificationType.POST);
        notificationService.saveOneNotification(notification);

        return ResponseEntity.status(HttpStatus.CREATED).body(notification);
    }

    // Lấy danh sách thông báo của người dùng
    @GetMapping("/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        List<Notification> notifications = notificationService.getNotificationsByUserId(userId);
        return ResponseEntity.ok(notifications);
    }

    // Đánh dấu thông báo là đã đọc
    @PutMapping("/read/{id}")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.updateNotificationStatus(id, true);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("read_all/{user_id}")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long user_id) {
        notificationService.updateAllNotificationStatusByUserId(user_id,true);
        return ResponseEntity.noContent().build();
    }

    // Xóa thông báo
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }


}
