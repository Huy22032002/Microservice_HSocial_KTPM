import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/Header.module.css";
import { fetchUserDetail } from "../api/userApi";

export default function Header() {
  const userId = useSelector((state) => state.user.userId);
  const [avatar, setAvatar] = useState("");
  const [fullname, setFullname] = useState("Unknown");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const getAvatarAndNameFromUserDetail = async () => {
      if (userId) {
        const userDetail = await fetchUserDetail(userId);
        if (userDetail) {
          setAvatar(userDetail.avatar);
          setFullname(userDetail.fullname);
        }
      }
    };

    getAvatarAndNameFromUserDetail();
  }, [userId]);
  return (
    <header className={styles.header}>
      <div className={styles.navContainer}>
        <h3 className={styles.logo}>HSocial</h3>
        <nav className={styles.nav}>
          {userId ? (
            <>
              <Link to="/chat" className={styles.link}>
                Chat Screen
              </Link>
              <Link to="/post" className={styles.link}>
                Post
              </Link>
              <span>{fullname}</span>
              <Link to="/userDetail">
                <img src={avatar} alt="avatar" />
              </Link>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Sign Out
              </button>
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
