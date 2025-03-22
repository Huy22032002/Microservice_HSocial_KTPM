package vn.edu.iuh.fit.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.edu.iuh.fit.models.Notification;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long>, JpaSpecificationExecutor<Notification> {
    void deleteAllByUserId(Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = :status WHERE n.id = :id")
    void updateNotificationIsRead(@Param("id") Long id, @Param("status") boolean status);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = :status WHERE n.userId = :userId")
    void updateAllNotificationIsReadByUserId(@Param("userId") Long userId, @Param("status") boolean status);

    @Modifying
    @Query("INSERT INTO Notification (userId, message) VALUES (:userId, :message)")
    void saveNotification(@Param("userId") Long userId, @Param("message") String message);

//    void saveNotification()

    List<Notification> findByUserId(Long userId);
}