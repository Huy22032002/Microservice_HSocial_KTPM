import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/Header.module.css";
import { fetchUserDetail, setUserStatus } from "../api/userApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import SearchUser from "./SearchUser";

export default function Header() {
  const userId = useSelector((state) => state.user.userId);
  const [avatar, setAvatar] = useState("");
  const [fullname, setFullname] = useState("Unknown");
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

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
          <Link to="/"> HSocial </Link>
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
