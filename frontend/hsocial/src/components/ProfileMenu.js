import styles from "../styles/menuProfile.module.css";
import { NavLink } from "react-router-dom";

const ProfileMenu = () => {
  return (
    <nav className={styles.menuContainer}>
      <NavLink className={styles.menuItem} to="">
        Tất cả
      </NavLink>
      <NavLink className={styles.menuItem} to="images">
        Hình ảnh
      </NavLink>
      <NavLink className={styles.menuItem} to="friends">
        Bạn bè
      </NavLink>
      <NavLink className={styles.menuItem} to="about">
        Thông tin
      </NavLink>
    </nav>
  );
};

export default ProfileMenu;
