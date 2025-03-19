package vn.edu.iuh.fit.chatservice.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "conversations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Conversation {
    @Id
    private String id;
    private ConversationType type;
    private List<String> participants;
    private LastMessage lastMessage;
    private Instant updatedAt;
    private ConversationStatus status;

}
