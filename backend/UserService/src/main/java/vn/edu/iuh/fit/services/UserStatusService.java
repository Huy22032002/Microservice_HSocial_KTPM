package vn.edu.iuh.fit.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.models.UserStatus;
import vn.edu.iuh.fit.repositories.UserStatusRepositories;

@Service
public class UserStatusService {
    @Autowired
    private UserStatusRepositories userStatusRepositories;

    public UserStatus updateUserStatus(UserStatus userStatus) {
        return userStatusRepositories.save(userStatus);
    }
}
