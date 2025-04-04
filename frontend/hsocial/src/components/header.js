import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import styles from "../styles/Header.module.css";
import { fetchUserDetail } from "../api/userApi";

export default function Header() {
  const userId = useSelector((state) => state.user.userId);
  const [avatar, setAvatar] = useState("");
  const [fullname, setFullname] = useState("Unknown");

  const handleLogout = () => {};

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
                Nhắn tin
              </Link>
              <Link to="/post" className={styles.link}>
                Đăng bài
              </Link>
              <span>{fullname}</span>
              <Link to="/userDetail">
                <img src={avatar} alt="avatar" />
              </Link>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/signup" className={styles.link}>
                Đăng ký
              </Link>
              <Link to="/login" className={styles.link}>
                Đăng nhập
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
