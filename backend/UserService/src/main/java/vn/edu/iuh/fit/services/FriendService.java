package vn.edu.iuh.fit.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.models.Friend;
import vn.edu.iuh.fit.repositories.FriendRepositories;

import java.util.List;

@Service
public class FriendService {
    @Autowired
    private FriendRepositories friendRepositories;

    public List<Friend> getAllFriends(int userId) {
        return friendRepositories.findAllByUserId(userId);
    }
}
