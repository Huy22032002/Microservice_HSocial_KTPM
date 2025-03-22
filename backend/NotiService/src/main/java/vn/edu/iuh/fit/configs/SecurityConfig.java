package vn.edu.iuh.fit.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.firewall.HttpFirewall;
import org.springframework.security.web.firewall.StrictHttpFirewall;
import vn.edu.iuh.fit.filter.JwtAuthenticationFilter;

import java.util.Set;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final JwtDecoder jwtDecoder;

    public SecurityConfig(JwtDecoder jwtDecoder) {
        this.jwtDecoder = jwtDecoder;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/notifications/**").authenticated()
                        .anyRequest().permitAll()
                )
                .addFilterBefore(new JwtAuthenticationFilter(jwtDecoder),
                        UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public HttpFirewall customHttpFirewall() {
        StrictHttpFirewall firewall = new StrictHttpFirewall();
        firewall.setAllowedHttpMethods(Set.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        firewall.setAllowUrlEncodedPercent(true); // Cho phép ký tự `%`
        return firewall;
    }
}
