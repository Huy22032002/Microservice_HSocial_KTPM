package vn.edu.iuh.fit.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import vn.edu.iuh.fit.dtos.NotificationDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationProducer {
//    private static final Logger logger = LoggerFactory.getLogger(NotificationProducer.class);
//    private final KafkaTemplate<String, String> kafkaTemplate;
//    private final ObjectMapper objectMapper;
//
//    public NotificationProducer(KafkaTemplate<String, String> kafkaTemplate, ObjectMapper objectMapper) {
//        this.kafkaTemplate = kafkaTemplate;
//        this.objectMapper = objectMapper;
//    }
//
//    public void sendNotification(NotificationDto notificationDto) {
//        try {
//            String message = objectMapper.writeValueAsString(notificationDto);
//            kafkaTemplate.send("noti-topic", message);
//            logger.info("Sent notification to Kafka: {}", message);
//        } catch (JsonProcessingException e) {
//            logger.error("Failed to serialize NotificationDto: {}", notificationDto, e);
//        }
//    }
    private static final Logger logger = LoggerFactory.getLogger(NotificationProducer.class);
    private final KafkaTemplate<String, NotificationDto> kafkaTemplate;

    public NotificationProducer(KafkaTemplate<String, NotificationDto> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendNotification(NotificationDto notificationDto) {
        kafkaTemplate.send("noti-topic", notificationDto);
        logger.info("Sent notification to Kafka: {}", notificationDto);
    }
}
