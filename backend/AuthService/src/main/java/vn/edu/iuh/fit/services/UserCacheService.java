package vn.edu.iuh.fit.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import vn.edu.iuh.fit.models.User;

import java.util.concurrent.TimeUnit;

@Service
public class UserCacheService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    private static final String USER_CACHE_KEY_PREFIX = "USER:";
    private static final long USER_CACHE_TTL = 30; // 30 phút
    
    // Lưu thông tin user vào cache
    public void cacheUser(String userId, User user) {
        String key = USER_CACHE_KEY_PREFIX + userId;
        redisTemplate.opsForValue().set(key, user, USER_CACHE_TTL, TimeUnit.MINUTES);
    }
    
    // Lấy thông tin user từ cache
    public User getCachedUser(String userId) {
        String key = USER_CACHE_KEY_PREFIX + userId;
        return (User) redisTemplate.opsForValue().get(key);
    }
    
    // Xóa cache khi thông tin user thay đổi
    public void evictUserCache(String userId) {
        String key = USER_CACHE_KEY_PREFIX + userId;
        redisTemplate.delete(key);
    }
    
    // Lưu trạng thái online của user
    public void setUserOnlineStatus(String userId, boolean isOnline) {
        String key = USER_CACHE_KEY_PREFIX + userId + ":status";
        if (isOnline) {
            redisTemplate.opsForValue().set(key, "online", 5, TimeUnit.MINUTES);
        } else {
            redisTemplate.delete(key);
        }
    }
    
    // Kiểm tra user có đang online không
    public boolean isUserOnline(String userId) {
        String key = USER_CACHE_KEY_PREFIX + userId + ":status";
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
}