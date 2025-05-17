import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/Header.module.css";
import { fetchUserDetail, setUserStatus } from "../api/userApi";
import { fetchNotifications, setAllNotiStatus } from "../api/notiApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import SearchUser from "./SearchUser";

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

  useEffect(() => {
    getAvatarAndNameFromUserDetail();
  }, [userId]);

  // Effect for detecting clicks outside notification dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    }

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef]);

  const getAvatarAndNameFromUserDetail = async () => {
    if (userId) {
      const userDetail = await fetchUserDetail(userId);
      if (userDetail) {
        setAvatar(userDetail.avatar);
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
      setShowPopup(false); // Close user popup if open
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    }
  };

  const markAllAsRead = async () => {
    try {
      await setAllNotiStatus(userId);
      // Update the local notifications array to mark all as read
      setNotifications((prevNotifications) =>
        prevNotifications.map((noti) => ({
          ...noti,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const handleNotificationItemClick = (notification) => {
    // Navigate to the notification target URL if available
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
            {" "}
            <img
              src={require("../assets/logo.png")}
              alt="Logo"
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "40px",
                boxSizing: "border-box",
              }}
            />{" "}
          </Link>

        </h3>
        <div className={styles.filterListChatt}>
          {/* search */}
          <SearchUser />
        </div>
        {userId ? (
          <div style={{ display: "flex", flexDirection: "row" }}>
            <h3 style={{ marginRight: "30px" }}>
              <Link to="/chat">Chat</Link>
            </h3>
            <h3>
              <Link to="/profile">Profile</Link>
            </h3>
          </div>
        ) : (
          <p>Please Login</p>
        )}

        <nav className={styles.nav}>
          {userId ? (
            <>
              {/* Notification Icon */}
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

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className={styles.notificationsDropdown}>
                    <div className={styles.notificationsHeader}>
                      <h4>Thông báo</h4>
                      {notifications.filter((n) => !n.isRead).length > 0 && (
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

              <div
                className={styles.userInfo}
                onClick={() => {
                  setShowPopup(!showPopup);
                  setShowNotifications(false); // Close notifications if open
                }}
              >
                <img
                  src={avatar || "https://via.placeholder.com/40"}
                  alt="avatar"
                  className={styles.avatar}
                />
                <span className={styles.fullname}>{fullname}</span>
              </div>

              {/* Popup đăng xuất */}
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
