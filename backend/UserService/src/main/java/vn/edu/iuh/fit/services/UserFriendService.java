package vn.edu.iuh.fit.services;

import org.apache.catalina.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.dtos.FriendRequest;
import vn.edu.iuh.fit.models.FriendStatus;
import vn.edu.iuh.fit.models.UserDetail;
import vn.edu.iuh.fit.models.UserFriend;
import vn.edu.iuh.fit.repositories.UserDetailRepositories;
import vn.edu.iuh.fit.repositories.UserFriendRepositories;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserFriendService {
    @Autowired
    private UserFriendRepositories userFriendRepositories;
    @Autowired
    private UserDetailRepositories userDetailRepositories;

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

    public List<Map<String, Object>> getAllFriendsWithFullNameOfUser(int userId) {
        UserFriend userFriend = userFriendRepositories.findByUserId(userId);
        if (userFriend == null) {
            return null;
        }
        List<UserFriend.Friend> friends = userFriend.getFriends().stream()
                .filter(f -> f.getFriendStatus() == FriendStatus.ACCEPTED)
                .collect(Collectors.toList());

        userFriend.setFriends(friends);

        //gán thêm full name
        List<Map<String, Object>> result = new ArrayList<>();
        for (UserFriend.Friend friend : userFriend.getFriends()) {
            Map<String, Object> item = new HashMap<>();
            item.put("friendId", friend.getFriendId());
            item.put("status", friend.getFriendStatus());
            UserDetail ud = userDetailRepositories.findById(friend.getFriendId()).orElse(null);
            if (ud != null) {
                item.put("name", ud.getFullname());
                item.put("avatar", ud.getAvatar());
            }
            result.add(item);
        }
        return result;
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
        // Kiểm tra nếu đã tồn tại lời mời (PENDING hoặc ACCEPTED) từ userId
        boolean alreadyRequested = userFriend.getFriends().stream()
                .anyMatch(f -> f.getFriendId() == friendRequest.getUserId() &&
                        (f.getFriendStatus() == FriendStatus.PENDING ||
                                f.getFriendStatus() == FriendStatus.ACCEPTED));

        if (alreadyRequested) {
            throw new IllegalStateException("Friend request already sent or already friends.");
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
        if (userFriend == null) {
            throw new RuntimeException("User không tồn tại.");
        }
        boolean found = false;
        for (UserFriend.Friend friend : userFriend.getFriends()) {
            if (friendRequest.getFriendId() == friend.getFriendId() && friend.getFriendStatus() == FriendStatus.PENDING) {
                friend.setFriendStatus(FriendStatus.ACCEPTED);
                found = true;

                // Tìm hoặc tạo userFriend của friend
                UserFriend friendUserFriend = userFriendRepositories.findByUserId(friendRequest.getFriendId());
                if (friendUserFriend == null) {
                    friendUserFriend = new UserFriend(friendRequest.getFriendId(), new ArrayList<>());
                }

                // Thêm kết bạn 2 chiều
                UserFriend.Friend friend2 = new UserFriend.Friend();
                friend2.setFriendId(friendRequest.getUserId());
                friend2.setFriendStatus(FriendStatus.ACCEPTED);
                friend2.setCreatedAt(LocalDateTime.now());

                friendUserFriend.getFriends().add(friend2);
                userFriendRepositories.save(friendUserFriend);

                break;
            }
        }
        if (!found) {
            throw new RuntimeException("Không tìm thấy lời mời kết bạn.");
        }
        return userFriendRepositories.save(userFriend);
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
            throw new RuntimeException("Khong tim thay user");
        }

        boolean removed = userFriend.getFriends().removeIf(friend -> friend.getFriendId() == friendRequest.getFriendId() && friend.getFriendStatus() == FriendStatus.PENDING);
        if(!removed) {
            throw new RuntimeException("Không tìm thấy lời mời từ friendId: " + friendRequest.getFriendId());
        }
        return userFriendRepositories.save(userFriend);
    }

    public List<Map<String, Object>> suggestFriends(int userId) {
        //lấy ds bạn bè của mình
        UserFriend myListFriend = userFriendRepositories.findByUserId(userId);
        if (myListFriend == null) return new ArrayList<>();
        List<Integer> myFriends = myListFriend.getFriends().stream()
                .filter(f -> f.getFriendStatus() == FriendStatus.ACCEPTED)
                .map(UserFriend.Friend::getFriendId)
                .toList();

        System.out.println("my friends: " + myFriends);

        // Tập hợp để loại bỏ chính mình và bạn đã có
        Set<Integer> myFriendsSet = new HashSet<>(myFriends);
        myFriendsSet.add(userId);
        // Gợi ý bạn bè từ bạn của bạn
        Map<Integer, Integer> mutualFriendCounts = new HashMap<>();

        // gọi UserDetailService lấy details từ danh sách gợi ý
        for (Integer friendId : myFriends) {
            UserFriend friendFriendList = userFriendRepositories.findByUserId(friendId);
            if (friendFriendList == null) continue;

            for (UserFriend.Friend f : friendFriendList.getFriends()) {
                if (f.getFriendStatus() != FriendStatus.ACCEPTED) continue; //bỏ qua những document ko phai accepted

                int suggestedId = f.getFriendId();
                if (!myFriendsSet.contains(suggestedId)) {
                    mutualFriendCounts.put(suggestedId, mutualFriendCounts.getOrDefault(suggestedId, 0) + 1);
                }
            }
        }

        // Kết hợp với UserDetail để trả về thông tin đầy đủ
        List<Map<String, Object>> suggestions = new ArrayList<>();

        for (Map.Entry<Integer, Integer> entry : mutualFriendCounts.entrySet()) {
            int suggestedId = entry.getKey();
            int mutual = entry.getValue();

            UserDetail detail = userDetailRepositories.findById(suggestedId).orElse(null);
            if (detail != null) {
                Map<String, Object> data = new HashMap<>();
                data.put("userId", suggestedId);
                data.put("name", detail.getFullname());
                data.put("avatar", detail.getAvatar());
                data.put("mutualFriends", mutual);
                suggestions.add(data);
            }
        }

        // Sắp xếp theo số lượng bạn chung giảm dần
        suggestions.sort((a, b) -> (int) b.get("mutualFriends") - (int) a.get("mutualFriends"));

        return suggestions;
    }
}
