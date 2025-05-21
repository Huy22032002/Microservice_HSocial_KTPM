package vn.edu.iuh.fit.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import vn.edu.iuh.fit.dtos.NotificationDto;
import vn.edu.iuh.fit.models.Notification;
import vn.edu.iuh.fit.models.NotificationType;
import vn.edu.iuh.fit.repositories.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class NotificationConsumer {
    private static final Logger logger = LoggerFactory.getLogger(NotificationConsumer.class);
    @Autowired
    private final NotificationRepository notificationRepository;
    @Autowired
    private final PushNotificationService pushNotificationService;
    private final ObjectMapper objectMapper;

    public NotificationConsumer(NotificationRepository notificationRepository,
                                PushNotificationService pushNotificationService,
                                ObjectMapper objectMapper) {
        this.notificationRepository = notificationRepository;
        this.pushNotificationService = pushNotificationService;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "noti-topic", groupId = "noti-group")
    public void consumeMessage(NotificationDto notificationDto) {
        logger.info("Received notification: {}", notificationDto);

        // Chuyển thành entity và lưu vào DB
        Notification notification = notificationDto.toEntity();
        logger.info("Converted to entity: {}", notification);
        notification.setType(NotificationType.POST);
        notificationRepository.save(notification);
        logger.info("Notification saved: {}", notification);

        // Gửi push notification
        pushNotificationService.sendPushNotification(String.valueOf(notificationDto.getUserId()), notificationDto.getMessage());
    }

}
