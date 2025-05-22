import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/Header.module.css";
import { fetchUserDetail, setUserStatus } from "../api/userApi";
import {
  deleteNotification,
  fetchNotifications,
  setAllNotiStatus,
} from "../api/notiApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import SearchUser from "./SearchUser";
import { accpeptFriend, removeFriendRequest } from "../api/friendApi";

export default function Header() {
  const userId = useSelector((state) => state.user.userId);
  const [avatar, setAvatar] = useState("");
  const [fullname, setFullname] = useState("Unknown");
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const handleLogout = async () => {
    try {
      if (userId) {
        await setUserStatus(userId, "OFFLINE");
      }
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Có lỗi xảy ra khi đăng xuất!");
    }
  };

  const goToChatBot = () => {
    navigate("/chatbot");
  };

  const extractSenderId = (message) => {
    const match = message.match(/\b\d+\b/);
    return match ? parseInt(match[0], 10) : null;
  };

  const handleAcceptFriendRequest = async (notification) => {
    try {
      const senderId = extractSenderId(notification.message);
      await accpeptFriend(userId, senderId);

      const data = await deleteNotification(notification.id);
      console.log("xoa noti: ", data);
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      alert("Kết bạn thành công");
    } catch (err) {
      console.error("Chấp nhận lời mời thất bại:", err);
    }
  };

  const handleRejectFriendRequest = async (notification) => {
    try {
      const senderId = extractSenderId(notification.message);
      await removeFriendRequest(userId, senderId);

      const data = await deleteNotification(notification.id);
      console.log("xoa noti: ", data);
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      alert("Đã huỷ lời mời kết bạn thành công");
    } catch (err) {
      console.error("Từ chối lời mời thất bại:", err);
    }
  };

  useEffect(() => {
    getAvatarAndNameFromUserDetail();
  }, [userId]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef]);

  const getAvatarAndNameFromUserDetail = async () => {
    if (userId) {
      const userDetail = await fetchUserDetail(userId);
      if (userDetail) {
        setAvatar(userDetail.avatar || require("../assets/default_avatar.png"));
        setFullname(userDetail.fullname);
      }
    }
  };

  const handleNotificationClick = async () => {
    if (showNotifications) {
      setShowNotifications(false);
      return;
    }

    try {
      const notis = await fetchNotifications(userId);
      setNotifications(notis || []);
      setShowNotifications(true);
      setShowPopup(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    }
  };

  const markAllAsRead = async () => {
    try {
      await setAllNotiStatus(userId);
      setNotifications((prev) =>
        prev.map((noti) => ({ ...noti, isRead: true }))
      );
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const handleNotificationItemClick = (notification) => {
    if (notification.link) {
      navigate(notification.link);
    }
    setShowNotifications(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.navContainer}>
        <h3>
          <Link to="/home">
            <img
              src={require("../assets/logo.png")}
              alt="Logo"
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "40px",
                boxSizing: "border-box",
              }}
            />
          </Link>
        </h3>

        <div className={styles.filterListChatt}>
          <SearchUser />
        </div>

        <div
          className="ai-chatbot-button-container"
          style={{ textAlign: "center", margin: "15px 0" }}
        >
          <button
            className="ai-chatbot-button"
            onClick={goToChatBot}
            style={{
              padding: "12px 20px",
              backgroundColor: "#9c27b0",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              transition: "all 0.3s ease",
            }}
          >
            <span style={{ marginRight: "8px" }}>🤖</span>
            Trò chuyện với AI HBot
          </button>
        </div>

        {userId ? (
          <div style={{ display: "flex", flexDirection: "row" }}>
            <h3 style={{ marginRight: "30px" }}>
              <Link to="/chat">Chat</Link>
            </h3>
            <h3 style={{ marginRight: "30px" }}>
              <Link to={`/profile/${userId}`}>Profile</Link>
            </h3>
          </div>
        ) : (
          <p>Please Login</p>
        )}

        <nav className={styles.nav}>
          {userId ? (
            <>
              {/* Notification */}
              <div
                className={styles.notificationContainer}
                ref={notificationRef}
              >
                <div
                  className={styles.iconWrapper}
                  onClick={handleNotificationClick}
                >
                  <FontAwesomeIcon icon={faBell} className={styles.bellIcon} />
                  {notifications.filter((n) => !n.isRead).length > 0 && (
                    <span className={styles.notiBadge}>
                      {notifications.filter((n) => !n.isRead).length}
                    </span>
                  )}
                </div>

                {showNotifications && (
                  <div className={styles.notificationsDropdown}>
                    <div className={styles.notificationsHeader}>
                      <h4>Thông báo</h4>
                      {notifications.some((n) => !n.isRead) && (
                        <button
                          className={styles.markReadBtn}
                          onClick={markAllAsRead}
                        >
                          Đánh dấu đã đọc
                        </button>
                      )}
                    </div>

                    <div className={styles.notificationsList}>
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`${styles.notificationItem} ${
                              !notification.isRead ? styles.unread : ""
                            }`}
                            onClick={() =>
                              handleNotificationItemClick(notification)
                            }
                          >
                            <div className={styles.notificationContent}>
                              <p>{notification.message}</p>
                              <small>
                                {new Date(
                                  notification.createdAt
                                ).toLocaleString()}
                              </small>

                              {notification.type === "FRIEND_REQUEST" && (
                                <div className={styles.friendRequestActions}>
                                  <button
                                    className={styles.acceptBtn}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAcceptFriendRequest(notification);
                                    }}
                                  >
                                    Chấp nhận
                                  </button>
                                  <button
                                    className={styles.rejectBtn}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRejectFriendRequest(notification);
                                    }}
                                  >
                                    Xoá
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className={styles.emptyNotification}>
                          Không có thông báo nào
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div
                className={styles.userInfo}
                onClick={() => {
                  setShowPopup(!showPopup);
                  setShowNotifications(false);
                }}
              >
                <img
                  src={avatar || "https://via.placeholder.com/40"}
                  alt="avatar"
                  className={styles.avatar}
                />
                <span className={styles.fullname}>{fullname}</span>
              </div>

              {showPopup && (
                <div className={styles.popup}>
                  <button onClick={handleLogout} className={styles.popupLink}>
                    Đăng xuất
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <Link to="/signup" className={styles.link}>
                Sign Up
              </Link>
              <Link to="/login" className={styles.link}>
                Sign In
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
