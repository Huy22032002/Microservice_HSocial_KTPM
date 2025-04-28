import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/Header.module.css";
import { fetchUserDetail, setUserStatus } from "../api/userApi";
import { fetchNotifications, setAllNotiStatus } from "../api/notificationApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

import { faL, faSearch } from "@fortawesome/free-solid-svg-icons";
import SearchUser from "./SearchUser";
import "./header.css";

export default function Header() {
  const userId = useSelector((state) => state.user.userId);
  const [avatar, setAvatar] = useState("");
  const [fullname, setFullname] = useState("Unknown");
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

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
    getNotifications();
  }, [userId]);

  const getNotifications = async () => {
    console.log("id: ", userId);
    if (userId) {
      try {
        const res = await fetchNotifications(userId);
        setNotifications(res);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    }
  };

  const getAvatarAndNameFromUserDetail = async () => {
    if (userId) {
      const userDetail = await fetchUserDetail(userId);
      if (userDetail) {
        setAvatar(userDetail.avatar);
        setFullname(userDetail.fullname);
      }
    }
  };
  return (
    <header className={styles.header}>
      <div className={styles.navContainer}>
        <h3 className={styles.logo}>
          <Link to="/home"> HSocial </Link>
        </h3>
        <div className={styles.filterListChat}>
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
            {/*notification icon*/}
            <div className={styles.notificationContainer}></div>
            <div
              className={styles.notificationIcon}
              onClick={() => {
                getNotifications();
                setShowNotifications(!showNotifications);
              }}
            >
              <FontAwesomeIcon icon={faBell} />
              {notifications.filter((n) => !n.isRead).length > 0 && (
                <span className={styles.notificationBadge}>
                  {notifications.filter((n) => !n.isRead).length}
                </span>
              )}
            </div>
            {showNotifications && (
              <div className={styles.notificationDropdown}>
                <div className={styles.notificationHeader}>
                  <h4>Notifications</h4>
                  {notifications.filter((n) => !n.isRead).length > 0 && (
                    <button
                      onClick={async () => {
                        await setAllNotiStatus(userId);
                        getNotifications();
                      }}
                      className={styles.markAllRead}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className={styles.notificationList}>
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`${styles.notificationItem} ${
                          !notification.isRead ? styles.unread : ""
                        }`}
                        onClick={() => navigate(notification.link || "/")}
                      >
                        <div className={styles.notificationContent}>
                          <p>{notification.message}</p>
                          <small>
                            {new Date(notification.createdAt).toLocaleString()}
                          </small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={styles.emptyNotification}>No notifications</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p>Please Login</p>
        )}

        <nav className={styles.nav}>
          {userId ? (
            <>
              <div
                className={styles.userInfo}
                onClick={() => setShowPopup(!showPopup)}
              >
                <img src={avatar} alt="avatar" className={styles.avatar} />
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
