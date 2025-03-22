package vn.edu.iuh.fit.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtDecoder jwtDecoder;

    @Autowired
    public JwtAuthenticationFilter(JwtDecoder jwtDecoder ) {
        this.jwtDecoder = jwtDecoder;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        } else {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            Jwt jwt = jwtDecoder.decode(token);

            // Lấy username từ JWT
            String username = jwt.getSubject();
            System.out.println("Username from JwtAuthenFilter: " + username);

            ArrayList<String> roles = jwt.getClaim("scope");
            System.out.println("Roles from JwtAuthenFilter: " + roles);

            // Chuyển đổi danh sách String roles thành List<GrantedAuthority>
            List<GrantedAuthority> authorities = roles.stream()
                    .map(role -> (GrantedAuthority) new SimpleGrantedAuthority(role))
                    .collect(Collectors.toList());

            // Tạo UserDetails
            UserDetails userDetails = new User(username, "", authorities);

            // Tạo authentication token và lưu vào SecurityContext
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (JwtException e) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT token");
            return;
        }

        filterChain.doFilter(request, response);
    }

}
