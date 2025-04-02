package vn.edu.iuh.fit.chatservice.handles;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class RabbitProducer {
    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void sendMessagae(String message) {
        rabbitTemplate.convertAndSend("chat_exchange", "chat", message);
    }

    @RabbitListener(queues = "chat_queue")
    public void receiveMessage(String message) {
        System.out.println("Received message: " + message);
    }

}
