package vn.edu.iuh.fit.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.models.UserStatus;
import vn.edu.iuh.fit.repositories.UserStatusRepositories;

import java.time.LocalDateTime;

@Service
public class UserStatusService {
    @Autowired
    private UserStatusRepositories userStatusRepositories;

    public UserStatus setStatus(int userId, String status) {
        UserStatus userStatus = userStatusRepositories.findByUserId(userId);

        if (userStatus == null) {
            userStatus = new UserStatus();
            userStatus.setUserId(userId);
        }

        userStatus.setStatus(UserStatus.Status.valueOf(status.toUpperCase()));
        userStatus.setLastOnline(LocalDateTime.now());

        return userStatusRepositories.save(userStatus);
    }

    public UserStatus getStatus(int userId) {
        return userStatusRepositories.findByUserId(userId);
    }
}
