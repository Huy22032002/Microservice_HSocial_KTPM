package vn.edu.iuh.fit.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class FriendRequest implements Serializable {
    private int userId;
    private int friendId;

    @Override
    public String toString() {
        return "FriendRequest{" +
                "userId=" + userId +
                ", friendId=" + friendId +
                '}';
    }
}
