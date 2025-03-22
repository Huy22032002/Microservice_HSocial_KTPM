package vn.edu.iuh.fit.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class PushNotificationService {
    private static final Logger logger = LoggerFactory.getLogger(PushNotificationService.class);

    public void sendPushNotification(String recipient, String message) {
        // Ở đây bạn có thể tích hợp Firebase Cloud Messaging (FCM) hoặc OneSignal
        logger.info("Push notification sent to {}: {}", recipient, message);
    }
}
