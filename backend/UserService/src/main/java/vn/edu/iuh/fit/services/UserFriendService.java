package vn.edu.iuh.fit.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.dtos.FriendRequest;
import vn.edu.iuh.fit.models.FriendStatus;
import vn.edu.iuh.fit.models.UserFriend;
import vn.edu.iuh.fit.repositories.UserFriendRepositories;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserFriendService {
    @Autowired
    private UserFriendRepositories userFriendRepositories;

    public UserFriend getAllFriendsOfUser(int userId) {
        UserFriend userFriend = userFriendRepositories.findByUserId(userId);
        if(userFriend == null) {
            return null;
        }
        List<UserFriend.Friend> friends = userFriend.getFriends().stream()
                .filter(f->f.getFriendStatus() == FriendStatus.ACCEPTED)
                .collect(Collectors.toList());

        userFriend.setFriends(friends);
        return userFriend;
    }
    public UserFriend addFriend(FriendRequest friendRequest) {
        int userId = friendRequest.getUserId();
        UserFriend userFriend = userFriendRepositories.findByUserId(userId);

        if(userFriend == null) {
            userFriend = new UserFriend(userId, new ArrayList<>());
        }

        boolean alreadyExists = userFriend.getFriends().stream()
                .anyMatch(f->f.getFriendId() == friendRequest.getFriendId());

        if(!alreadyExists) {
            UserFriend.Friend newFriend = new UserFriend.Friend();
            newFriend.setFriendId(friendRequest.getFriendId());
            newFriend.setFriendStatus(FriendStatus.PENDING);
            newFriend.setCreatedAt(LocalDateTime.now());

            userFriend.getFriends().add(newFriend);
            return userFriendRepositories.save(userFriend);
        }
        return userFriend;
    }
    public UserFriend acceptFriend(FriendRequest friendRequest) {
        UserFriend userFriend = userFriendRepositories.findByUserId(friendRequest.getUserId());

        if(userFriend == null) {
            throw new RuntimeException("Khong tim thay user");
        }
        //loc danh sach de tim loi moi ket ban
        for(UserFriend.Friend friend : userFriend.getFriends()) {
            if(friendRequest.getFriendId() == friend.getFriendId() && friend.getFriendStatus() == FriendStatus.PENDING) {
                friend.setFriendStatus(FriendStatus.ACCEPTED);

                //tim userFriend cua friend
                UserFriend friendUserFriend = userFriendRepositories.findByUserId(friendRequest.getFriendId());
                if(friendUserFriend == null) {
                   friendUserFriend = new UserFriend(friendRequest.getFriendId(), new ArrayList<>());
                }
                // Kiểm tra xem user đã là bạn chưa (tránh thêm trùng)
                boolean alreadyFriends = friendUserFriend.getFriends().stream()
                        .anyMatch(f -> f.getFriendId() == friendRequest.getUserId());
                //them 2 chieu`
                if(!alreadyFriends) {
                    friendUserFriend.setUserId(friendRequest.getFriendId());

                    UserFriend.Friend lstFriendUserFriend = new UserFriend.Friend();
                    lstFriendUserFriend.setFriendId(friendRequest.getUserId());
                    lstFriendUserFriend.setFriendStatus(FriendStatus.ACCEPTED);
                    lstFriendUserFriend.setCreatedAt(LocalDateTime.now());

                    friendUserFriend.getFriends().add(lstFriendUserFriend);
                    userFriendRepositories.save(friendUserFriend);
                }
                return userFriendRepositories.save(userFriend);
            }
        }
        throw new RuntimeException("Không tìm thấy lời mời kết bạn.");
    }
    public boolean removeFriend(FriendRequest friendRequest) {
        UserFriend userFriend = userFriendRepositories.findByUserId(friendRequest.getUserId());
        UserFriend friendUser = userFriendRepositories.findByUserId(friendRequest.getFriendId());
        if(userFriend == null || friendUser == null) {
            throw new RuntimeException("Khong tim thay user");
        }

        //xoa friend khoi ds friend cua user
        boolean removeFromUser = userFriend.getFriends().removeIf(friend -> friend.getFriendId() == friendRequest.getFriendId());
        //xoa user khoi ds friend cua friend
        boolean removeFromFr   = friendUser.getFriends().removeIf(friend -> friend.getFriendId() == friendRequest.getUserId());
        if(removeFromUser && removeFromFr) {
            userFriendRepositories.save(userFriend);
            userFriendRepositories.save(friendUser);
            return true;
        }
        return false;
    }
    public UserFriend declineFriendRequest(FriendRequest friendRequest) {
        UserFriend userFriend = userFriendRepositories.findByUserId(friendRequest.getUserId());

        if(userFriend == null) {
            userFriend = new UserFriend(friendRequest.getUserId(), new ArrayList<>());
        }

        for(int i=0; i <userFriend.getFriends().size(); i++) {
            if(userFriend.getFriends().get(i).getFriendId() == friendRequest.getFriendId()
            && userFriend.getFriends().get(i).getFriendStatus() == FriendStatus.PENDING)
            {
                userFriend.getFriends().remove(i);
                return userFriendRepositories.save(userFriend);
            }
        }
        throw new RuntimeException("Khong tim thay user");
    }
}
