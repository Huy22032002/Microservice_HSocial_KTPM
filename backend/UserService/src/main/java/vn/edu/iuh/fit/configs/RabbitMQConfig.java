package vn.edu.iuh.fit.configs;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import vn.edu.iuh.fit.models.UserDetail;
import vn.edu.iuh.fit.services.UserDetailService;
import vn.edu.iuh.fit.services.UserStatusService;

import java.util.Map;

@Configuration
public class RabbitMQConfig {
    private static final String QUEUE_NAME = "user_queue";

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
}
