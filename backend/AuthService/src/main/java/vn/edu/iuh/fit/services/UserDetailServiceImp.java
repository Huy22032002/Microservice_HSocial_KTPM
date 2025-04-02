package vn.edu.iuh.fit.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.auth.UserPrincipal;
import vn.edu.iuh.fit.models.User;
import vn.edu.iuh.fit.repositories.UserRepository;

import java.util.ArrayList;
import java.util.Collection;

@Service
public class UserDetailServiceImp implements UserDetailsService {

    private UserRepository userRepository;

    @Autowired
    public UserDetailServiceImp(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username);

        if(user == null) {
            throw new UsernameNotFoundException("User not found: " + username);
        }

        if (user.getPasswordHash() == null || user.getPasswordHash().trim().isEmpty()) {
            throw new IllegalStateException("Password in database is empty or null!");
        }

        Collection<GrantedAuthority> authorities = new ArrayList<>();
        if (user.getRole() != null) {
            authorities.add(new SimpleGrantedAuthority( user.getRole().name()));
            System.out.println("UserDetailServiceImp get role: "  + user.getRole().name());
            System.out.println("UserDetailServiceImp get authorities: " + authorities);
        }

        return new UserPrincipal(user.getId(), user.getUsername(), user.getPasswordHash(), user.getEmail(), authorities, user.isEnabled());
    }


}
