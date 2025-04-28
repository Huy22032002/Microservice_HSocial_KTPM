package vn.edu.iuh.fit.configs;

import com.rabbitmq.client.ConnectionFactory;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import vn.edu.iuh.fit.models.UserDetail;
import vn.edu.iuh.fit.services.UserDetailService;

@Configuration
public class RabbitMQConfig {
    private static final String QUEUE_NAME = "user_queue";
    public static final String QUEUE_NAME2 = "friend_queue";

    @Autowired
    private UserDetailService userDetailService;

    @Bean
    public Queue queue() {
        return new Queue(QUEUE_NAME, false); // (name, durable, exclusive, auto-delete)
    }
    @RabbitListener(queues = QUEUE_NAME)
    public void listen(int userId) {
        System.out.println("RabbitMQ Received message from AuthService: " + userId);

        UserDetail userDetail = new UserDetail();
        userDetail.setId(userId);

        userDetailService.create(userDetail);
    }
    @Bean
    public Queue queue2() {
        return new Queue(QUEUE_NAME2, false);
    }
//
//    @RabbitListener(queues = QUEUE_NAME2)
//    public void listen2(int userId, String message) {
//        System.out.println("RabbitMQ Received message from NotiService: " + userId);
//    }
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

}
