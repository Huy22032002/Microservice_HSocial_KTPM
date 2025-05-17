package vn.edu.iuh.fit.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Component;
import vn.edu.iuh.fit.auth.UserPrincipal;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
public class JwtTokenUtil {
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenUtil.class);
    @SuppressWarnings("ReassignedVariable")
    public String generateToken(Authentication auth, JwtEncoder jwtEncoder){
        String token = "";
        UserPrincipal userPrincipal = (UserPrincipal) auth.getPrincipal();
        try{
            JwtClaimsSet claims = JwtClaimsSet.builder()
                    .issuer("iuh.fit.se")
                    .issuedAt(Instant.now())
                    .expiresAt(generateExpirationDate())
                    .subject(userPrincipal.getUsername())
                    .claim("scope", userPrincipal.getAuthorities()
                        .stream().map(GrantedAuthority::getAuthority).collect(Collectors.toList()))
                    .build();
            System.out.println("JwtTokenUtil generateToken: " + claims.getClaims());
            token = jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
        }
        catch (Exception e) {
            logger.error(e.getMessage());
        }
        return token;
    }
    public String getUsernameFromToken(Jwt jwtToken){
        return jwtToken.getSubject();
    }
    private boolean isTokenExpired(Jwt jwtToken) {
        return Objects.requireNonNull(jwtToken.getExpiresAt()).isBefore(Instant.now());
    }
    public boolean isTokenValid(Jwt jwtToken, UserPrincipal userPrincipal){
        return !isTokenExpired(jwtToken) &&
                userPrincipal.isEnabled() &&
                userPrincipal.getUsername().equals(getUsernameFromToken(jwtToken));
    }

    public Instant generateExpirationDate(){
        return Instant.now().plus(10, ChronoUnit.DAYS);
    }

}
