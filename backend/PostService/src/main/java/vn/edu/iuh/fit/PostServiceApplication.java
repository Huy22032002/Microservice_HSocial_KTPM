package vn.edu.iuh.fit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

@SpringBootApplication
public class PostServiceApplication {

    public static void main(String[] args) {
//        ConfigurableApplicationContext context = SpringApplication.run(PostServiceApplication.class, args);
//        Runtime.getRuntime().addShutdownHook(new Thread(context::close));
        SpringApplication.run(PostServiceApplication.class, args);
    }
}