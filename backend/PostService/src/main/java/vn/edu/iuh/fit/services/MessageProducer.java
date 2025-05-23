package vn.edu.iuh.fit.services;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.configs.RabbitMQConfig;
import vn.edu.iuh.fit.dtos.NotificationDto;

@Service
public class MessageProducer {

    private final RabbitTemplate rabbitTemplate;

    public MessageProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    //send Message to friend_queue
    public void sendToNotificationService(NotificationDto notificationDto) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.QUEUE_NAME, notificationDto);
        System.out.println("Sending notification to RabbitMQ: " + notificationDto);
    }
}
