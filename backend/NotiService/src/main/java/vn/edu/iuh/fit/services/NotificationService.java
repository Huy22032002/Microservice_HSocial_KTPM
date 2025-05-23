package vn.edu.iuh.fit.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.dtos.NotificationDto;
import vn.edu.iuh.fit.models.Notification;
import vn.edu.iuh.fit.models.NotificationType;
import vn.edu.iuh.fit.repositories.NotificationRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String NOTIFICATION_KEY_PREFIX = "NOTI:";
    private static final String UNREAD_NOTI_COUNT_PREFIX = "UNREAD_COUNT:";


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

    public void saveNotification(NotificationDto dto) {
        Long userId = dto.getUserId();

        Notification notification = new Notification();
        notification.setUserId(dto.getUserId());
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setMessage("Bạn có một thông báo mới từ bài viết với ID: " + dto.getContentId());

        String key = NOTIFICATION_KEY_PREFIX + userId;
        redisTemplate.opsForList().leftPush(key, notification);
        // Giới hạn số lượng thông báo được lưu
        redisTemplate.opsForList().trim(key, 0, 99);
        // Tăng số lượng thông báo chưa đọc
        incrementUnreadCount(String.valueOf(userId));
        notificationRepository.save(notification);
    }

    public List<Object> getNotifications(String userId, int start, int end) {
        String key = NOTIFICATION_KEY_PREFIX + userId;
        return redisTemplate.opsForList().range(key, start, end);
    }

    // Tăng số lượng thông báo chưa đọc
    private void incrementUnreadCount(String userId) {
        String key = UNREAD_NOTI_COUNT_PREFIX + userId;
        redisTemplate.opsForValue().increment(key);
        // Đặt thời gian tồn tại cho counter (nếu chưa được đặt)
        redisTemplate.expire(key, 30, TimeUnit.DAYS);
    }

    // Lấy số lượng thông báo chưa đọc
    public long getUnreadCount(String userId) {
        String key = UNREAD_NOTI_COUNT_PREFIX + userId;
        Long count = (Long) redisTemplate.opsForValue().get(key);
        return count != null ? count : 0;
    }

    // Đánh dấu đã đọc tất cả thông báo
    public void markAllAsRead(String userId) {
        String key = UNREAD_NOTI_COUNT_PREFIX + userId;
        redisTemplate.opsForValue().set(key, 0);
    }

    public List<Notification> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserId(userId);

    }
    public void saveOneNotification(Notification notification) {
        notificationRepository.save(notification);
    }
}
