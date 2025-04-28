import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/Header.module.css";
import { fetchUserDetail, setUserStatus } from "../api/userApi";
import { fetchNotifications, setAllNotiStatus } from "../api/notificationApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faUserPlus, faBell, faBookmark } from "@fortawesome/free-solid-svg-icons";
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
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);

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

  const getNotifications = async () => {
    try {
      const res = await fetchNotifications(userId);
      setNotifications(res);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }

  // Mock function for friend requests - replace with actual API call
  const getFriendRequests = async () => {
    try {
      // Replace with actual API call to get friend requests
      // const res = await fetchFriendRequests(userId);
      // setFriendRequests(res);
      
      // Temporary mock data
      setFriendRequests([
        { id: 1, from: { fullname: "Jane Doe", avatar: "https://via.placeholder.com/40" }, createdAt: new Date() },
        { id: 2, from: { fullname: "John Smith", avatar: "https://via.placeholder.com/40" }, createdAt: new Date(Date.now() - 86400000) }
      ]);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  }

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
        <div className={styles.leftSection}>
          <h3 className={styles.logo}>
            <Link to="/">HSocial</Link>
          </h3>
          <nav className={styles.mainNav}>
            <Link to="/" className={styles.navLink}>Home</Link>
            <Link to="/network" className={styles.navLink}>Network</Link>
            <Link to="/events" className={styles.navLink}>Events</Link>
          </nav>
        </div>
        
        <div className={styles.centerSection}>
          <div className={styles.searchContainer}>
            <SearchUser />
          </div>
        </div>
        
        <div className={styles.rightSection}>
          {userId ? (
            <>
              <div className={styles.iconGroup}>
                <div className={styles.iconContainer}>
                  <FontAwesomeIcon icon={faBookmark} className={styles.icon} onClick={() => navigate('/saved')} />
                </div>
                
                {/* Friend Request Icon */}
                <div className={styles.iconContainer}>
                  <FontAwesomeIcon 
                    icon={faUserPlus} 
                    className={styles.icon} 
                    onClick={() => {
                      getFriendRequests();
                      setShowFriendRequests(!showFriendRequests);
                      setShowNotifications(false);
                    }} 
                  />
                  {friendRequests.length > 0 && (
                    <span className={styles.badge}>{friendRequests.length}</span>
                  )}
                  
                  {/* Friend Requests Dropdown */}
                  {showFriendRequests && (
                    <div className={styles.dropdown}>
                      <div className={styles.dropdownHeader}>
                        <h4>Friend Requests</h4>
                      </div>
                      <div className={styles.dropdownList}>
                        {friendRequests.length > 0 ? (
                          friendRequests.map(request => (
                            <div key={request.id} className={styles.dropdownItem}>
                              <img src={request.from.avatar} alt="User" className={styles.requestAvatar} />
                              <div className={styles.requestContent}>
                                <p>{request.from.fullname}</p>
                                <small>{new Date(request.createdAt).toLocaleDateString()}</small>
                              </div>
                              <div className={styles.requestActions}>
                                <button className={styles.acceptBtn}>Accept</button>
                                <button className={styles.declineBtn}>Decline</button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className={styles.emptyMessage}>No friend requests</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Notification Icon */}
                <div className={styles.iconContainer}>
                  <FontAwesomeIcon 
                    icon={faBell} 
                    className={styles.icon} 
                    onClick={() => {
                      getNotifications();
                      setShowNotifications(!showNotifications);
                      setShowFriendRequests(false);
                    }}
                  />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className={styles.badge}>
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                  
                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className={styles.dropdown}>
                      <div className={styles.dropdownHeader}>
                        <h4>Notifications</h4>
                        {notifications.filter(n => !n.isRead).length > 0 && (
                          <button 
                            onClick={async () => {
                              await setAllNotiStatus(userId);
                              getNotifications();
                            }} 
                            className={styles.clearBtn}
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className={styles.dropdownList}>
                        {notifications.length > 0 ? (
                          notifications.map(notification => (
                            <div 
                              key={notification.id} 
                              className={`${styles.dropdownItem} ${!notification.isRead ? styles.unread : ''}`}
                              onClick={() => navigate(notification.link || '/')}
                            >
                              <div className={styles.notificationContent}>
                                <p>{notification.message}</p>
                                <small>{new Date(notification.createdAt).toLocaleString()}</small>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className={styles.emptyMessage}>No notifications</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* User Profile */}
              <div
                className={styles.userProfile}
                onClick={() => setShowPopup(!showPopup)}
              >
                <img src={avatar || "https://via.placeholder.com/40"} alt="avatar" className={styles.avatar} />
                
                {/* User dropdown */}
                {showPopup && (
                  <div className={styles.userDropdown}>
                    <Link to="/profile" className={styles.dropdownLink}>Profile</Link>
                    <Link to="/settings" className={styles.dropdownLink}>Settings</Link>
                    <button onClick={handleLogout} className={styles.dropdownButton}>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className={styles.authLinks}>
              <Link to="/signup" className={styles.signupBtn}>Sign Up</Link>
              <Link to="/login" className={styles.loginBtn}>Sign In</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}