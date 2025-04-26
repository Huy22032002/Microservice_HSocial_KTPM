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
    public UserFriend getListPendingOfUser(int userId) {
        UserFriend userFriend = userFriendRepositories.findByUserId(userId);
        if(userFriend == null) {
            return null;
        }
        List<UserFriend.Friend> lstPending = userFriend.getFriends().stream()
                .filter(f  -> f.getFriendStatus() == FriendStatus.PENDING)
                .collect(Collectors.toList());
        userFriend.setFriends(lstPending);
        return userFriend;
    }

    public UserFriend addFriend(FriendRequest friendRequest) {
        int friendId = friendRequest.getFriendId();
        //tim userId
        UserFriend userFriend = userFriendRepositories.findByUserId(friendId);
        //neu chua co document thi tao moi trong mongodb voi ds ban be []
        if(userFriend == null) {
            userFriend = new UserFriend(friendId, new ArrayList<>());
        }
        UserFriend.Friend newFriend = new UserFriend.Friend();
        newFriend.setFriendId(friendRequest.getUserId());
        newFriend.setFriendStatus(FriendStatus.PENDING);
        newFriend.setCreatedAt(LocalDateTime.now());

        userFriend.getFriends().add(newFriend);
        return userFriendRepositories.save(userFriend);

    }
    public UserFriend acceptFriend(FriendRequest friendRequest) {
        UserFriend userFriend = userFriendRepositories.findByUserId(friendRequest.getUserId());
        //loc danh sach de tim loi moi ket ban
        for(UserFriend.Friend friend : userFriend.getFriends()) {
            if(friendRequest.getFriendId() == friend.getFriendId() && friend.getFriendStatus() == FriendStatus.PENDING) {
                friend.setFriendStatus(FriendStatus.ACCEPTED);

                //tim userFriend cua friend
                UserFriend friendUserFriend = userFriendRepositories.findByUserId(friendRequest.getFriendId());
                if(friendUserFriend == null) {
                    friendUserFriend = new UserFriend(friendRequest.getFriendId(), new ArrayList<>());
                }
                //them 2 chieu` luu danh sach ban be cua friendId)
                UserFriend.Friend friend2 = new UserFriend.Friend();
                friend2.setFriendId(friendRequest.getUserId());
                friend2.setFriendStatus(FriendStatus.ACCEPTED);
                friend2.setCreatedAt(LocalDateTime.now());

                friendUserFriend.getFriends().add(friend2);
                userFriendRepositories.save(friendUserFriend);
            }
            return userFriendRepositories.save(userFriend);

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
        for(UserFriend.Friend friend : userFriend.getFriends()) {
            if(friend.getFriendId() == friendRequest.getFriendId() && friend.getFriendStatus() == FriendStatus.PENDING) {
                userFriend.getFriends().remove(friend);
            }
        }
        return userFriendRepositories.save(userFriend);
    }
}
