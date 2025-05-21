package vn.edu.iuh.fit.chatservice.exceptions;
import io.github.resilience4j.ratelimiter.RequestNotPermitted;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalException {

    @ExceptionHandler(RequestNotPermitted.class)
    public ResponseEntity<String> handleRateLimiterException(RequestNotPermitted ex) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body("Bạn đã vượt quá giới hạn gọi API, vui lòng thử lại sau.");
    }
}
