package vn.edu.iuh.fit.chatservice.models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Message {
    @Id
    private String id; // ObjectId của MongoDB

    private String conversationId; 
    private String sender;
    private List<String> receivers;
    private MessageType type;
    private String content;
    private ConversationStatus status;
    private Instant createdAt;

}
