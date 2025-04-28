package vn.edu.iuh.fit.configs;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import vn.edu.iuh.fit.dtos.FriendRequest;
import vn.edu.iuh.fit.dtos.NotificationDto;
import vn.edu.iuh.fit.models.Notification;
import vn.edu.iuh.fit.models.NotificationType;
import vn.edu.iuh.fit.services.NotificationService;

import java.time.LocalDateTime;

@Configuration
public class RabbitMQConfig {
    public static final String QUEUE_NAME2 = "friend_queue";

    @Autowired
    private NotificationService notificationService;

    @Bean
    public MessageConverter messageConverter() {
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
        return converter;
    }

    @Bean
    public Queue queue() {
        return new Queue(QUEUE_NAME2, false);
    }

    @RabbitListener(queues = QUEUE_NAME2)
    public void listen(FriendRequest request) {
        System.out.println("Received message from User service: " + request.toString());

        Notification notification = new Notification();
        notification.setType(NotificationType.FRIEND_REQUEST);
        notification.setMessage("Friend Request from " + request.getUserId());
        notification.setUserId((long) request.getFriendId());
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setContentId(null);

        notificationService.saveOneNotification(notification);
    }
}