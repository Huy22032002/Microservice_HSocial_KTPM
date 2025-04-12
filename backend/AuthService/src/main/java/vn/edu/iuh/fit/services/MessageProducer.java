package vn.edu.iuh.fit.services;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.configs.RabbitMQConfig;

import java.util.HashMap;
import java.util.Map;

@Service
public class MessageProducer {
    //Inject RabbitTemplate for sending messages to RabbitMQ
    private final RabbitTemplate rabbitTemplate;

    public MessageProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }
    //send Message to user_queue
    public void sendUserId(int userId) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.QUEUE_NAME, userId);
    }
}
