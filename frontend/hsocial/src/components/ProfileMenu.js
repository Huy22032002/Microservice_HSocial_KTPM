import { useState } from "react";
import styles from "../styles/menuProfile.module.css";

const ProfileMenu = () => {
  const [menu, setMenu] = useState("Tất cả");

  const listMenu = [
    { id: 1, name: "Tất cả" },
    { id: 2, name: "Ảnh" },
    { id: 3, name: "Bạn bè" },
    { id: 4, name: "Thông tin" },
  ];

  return (
    <div className={styles.menuContainer}>
      {listMenu.map((menu, index) => (
        <button className={styles.menuItem}>{menu.name}</button>
      ))}
    </div>
  );
};

export default ProfileMenu;
