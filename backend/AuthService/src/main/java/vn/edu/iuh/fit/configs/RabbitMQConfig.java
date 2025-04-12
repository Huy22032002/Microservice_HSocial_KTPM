package vn.edu.iuh.fit.configs;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    public static final String QUEUE_NAME = "user_queue";

    @Bean
    public Queue queue() {
        //tạo 1 queue mới tên user_queue
        return new Queue(QUEUE_NAME, false);
    }
}
