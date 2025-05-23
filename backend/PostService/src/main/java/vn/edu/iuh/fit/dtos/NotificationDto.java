package vn.edu.iuh.fit.dtos;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.iuh.fit.enums.NotificationType;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
//@JsonSerialize
//@JsonDeserialize
public class NotificationDto {
    private int userId;
    private Long ContentId;
    private String type;

}