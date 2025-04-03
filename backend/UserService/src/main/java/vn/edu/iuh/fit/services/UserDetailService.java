package vn.edu.iuh.fit.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.models.UserDetail;
import vn.edu.iuh.fit.repositories.UserDetailRepositories;

@Service
public class UserDetailService {
    @Autowired
    private UserDetailRepositories userDetailRepositories;

    public UserDetail create(UserDetail userDetail) {
        return userDetailRepositories.save(userDetail);
    }
}
