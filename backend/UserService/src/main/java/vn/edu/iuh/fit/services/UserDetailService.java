package vn.edu.iuh.fit.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.models.UserDetail;
import vn.edu.iuh.fit.repositories.UserDetailRepositories;

import java.util.List;
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

    public UserDetail update(int userId, UserDetail userDetail) {
        UserDetail checkExistUserDetail = userDetailRepositories.findById(userId).orElse(null);
        if (checkExistUserDetail == null) {
            return null;
        }
        checkExistUserDetail.setFullname(userDetail.getFullname());
        checkExistUserDetail.setAddress(userDetail.getAddress());
        checkExistUserDetail.setId(userId);
        checkExistUserDetail.setAge(userDetail.getAge());
        checkExistUserDetail.setAvatar(userDetail.getAvatar());
        checkExistUserDetail.setGender(userDetail.isGender());

        return userDetailRepositories.save(checkExistUserDetail);
    }

    //tim danh sach user trong tim kiem
    public List<UserDetail> findAllByValue(String value) {
        return userDetailRepositories.findByFullnameContainingIgnoreCase(value);
    }
}
