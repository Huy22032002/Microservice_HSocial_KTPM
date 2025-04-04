package vn.edu.iuh.fit.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.dto.UserDTO;
import vn.edu.iuh.fit.models.Role;
import vn.edu.iuh.fit.models.User;
import vn.edu.iuh.fit.repositories.UserRepository;

import java.util.List;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public User createUser(UserDTO userDTO) {
        if(userRepository.findByUsername(userDTO.getUsername()) != null || userRepository.findByEmail(userDTO.getEmail()) != null) {
            throw new RuntimeException("User already exists");
        }

        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setPhone(userDTO.getPhone());
        user.setRole(Role.ROLE_USER);
        user.setPasswordHash(passwordEncoder.encode(userDTO.getPassword()));

        return userRepository.save(user);
    }
    public User getUser(int id) {
        return userRepository.findById(id);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}
