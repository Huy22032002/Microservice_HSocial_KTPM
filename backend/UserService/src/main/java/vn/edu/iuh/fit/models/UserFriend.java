package vn.edu.iuh.fit.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "friends")
public class UserFriend {

    @Id
    private int userId;
    private List<Friend> friends;

    @Setter
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Friend {
        private int friendId;
        private FriendStatus friendStatus;
        private LocalDateTime createdAt;
    }
}
