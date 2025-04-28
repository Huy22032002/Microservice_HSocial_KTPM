package vn.edu.iuh.fit.services;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.configs.RabbitMQConfig;
import vn.edu.iuh.fit.dtos.FriendRequest;

@Service
public class MessageProducer {
    //Inject RabbitTemplate for sending messages to RabbitMQ
    private final RabbitTemplate rabbitTemplate;

    public MessageProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    //send Message to friend_queue
    public void sendToNotificationService(FriendRequest friendRequest) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.QUEUE_NAME2, friendRequest);
        System.out.println("Sending notification to RabbitMQ: " + friendRequest);
    }
}
