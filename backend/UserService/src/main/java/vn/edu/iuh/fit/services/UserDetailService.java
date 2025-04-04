package vn.edu.iuh.fit.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.models.UserDetail;
import vn.edu.iuh.fit.repositories.UserDetailRepositories;

import java.util.Optional;

@Service
public class UserDetailService {
    @Autowired
    private UserDetailRepositories userDetailRepositories;

    public UserDetail create(UserDetail userDetail) {
        return userDetailRepositories.save(userDetail);
    }

    public UserDetail findById(int id) {
        return userDetailRepositories.findById(id).orElse(null);
    }
}
