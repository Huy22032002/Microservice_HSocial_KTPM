package vn.edu.iuh.fit.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user_status")
public class UserStatus {
    private int userId;
    private Status status;
    private LocalDateTime lastOnline;

    public enum Status {
        ONLINE, OFFLINE
    }
}
