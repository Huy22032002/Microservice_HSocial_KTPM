package vn.edu.iuh.fit.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.models.Token;
import vn.edu.iuh.fit.repositories.TokenRepository;

import java.util.concurrent.TimeUnit;

@Service
public class TokenService {
    @Autowired
    private TokenRepository tokenRepository;

    public void save (Token token) {
        tokenRepository.save(token);
    }
    public Token findByToken(String token) {
        return tokenRepository.findByToken(token);
    }
    public void revokedToken(String tokenName) {
        Token token = tokenRepository.findByToken(tokenName);
        tokenRepository.save(token);
    }
    public void deleteToken(Token token){
        tokenRepository.delete(token);
    }

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    // Lưu token
    public void saveToken(String userId, String token, long expirationTimeInSeconds) {
        String key = "TOKEN:" + userId;
        redisTemplate.opsForValue().set(key, token, expirationTimeInSeconds, TimeUnit.SECONDS);
    }

    // Kiểm tra token
    public String getToken(String userId) {
        String key = "TOKEN:" + userId;
        return (String) redisTemplate.opsForValue().get(key);
    }

    // Xóa token khi logout
    public void invalidateToken(String userId) {
        String key = "TOKEN:" + userId;
        redisTemplate.delete(key);
    }

    // Thêm token vào blacklist khi logout
    public void addToBlacklist(String token, long expirationTimeInSeconds) {
        String key = "BLACKLIST:" + token;
        redisTemplate.opsForValue().set(key, "revoked", expirationTimeInSeconds, TimeUnit.SECONDS);
    }

    // Kiểm tra token có trong blacklist không
    public boolean isBlacklisted(String token) {
        String key = "BLACKLIST:" + token;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
}
