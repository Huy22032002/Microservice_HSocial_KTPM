package vn.edu.iuh.fit.chatservice.configs;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MessageQueueConfig {
    @Bean
    public Queue chatQueue() {
        return new Queue("chat_queue", true);
    }
    @Bean
    public DirectExchange chatExchange() {
        return new DirectExchange("chat_exchange");
    }
    @Bean
    public Binding chatBinding(Queue chatQueue, DirectExchange chatExchange) {
        return BindingBuilder.bind(chatQueue).to(chatExchange).with("chat");
    }

}
