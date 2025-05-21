import { useSelector } from "react-redux";
import styles from "../styles/AboutComponent.module.css";
import { useEffect, useState } from "react";
import { fetchUserDetail, fetchUser } from "../api/userApi";
import { useParams } from "react-router-dom";

const AboutComponent = () => {
  const userIdRedux = useSelector((state) => state.user.userId);
  const { userId } = useParams();
  const [userDetail, setUserDetail] = useState(null);
  const [user, setUser] = useState(null);

  const checkUser = () => {
    if (userId != userIdRedux) return userId;
    else return userIdRedux;
  };

  const getUser = async () => {
    const data = await fetchUser(checkUser());
    setUser(data.user);
  };

  const getUserDetail = async () => {
    const data = await fetchUserDetail(checkUser());
    console.log(data);
    setUserDetail(data);
  };

  useEffect(() => {
    getUserDetail();
    getUser();
  }, [userIdRedux, userId]);

  return (
    <div className={styles.container}>
      {userDetail && user ? (
        <>
          <div className={styles.infoTitle}>Thông tin cá nhân</div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Họ tên:</span> {userDetail.fullname}
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Tuổi:</span> {userDetail.age}
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Giới tính:</span>{" "}
            {userDetail.gender ? "Nam" : "Nữ"}
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Địa chỉ:</span> {userDetail.address}
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Liên hệ:</span> {user.phone}
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Email:</span> {user.email}
          </div>
        </>
      ) : (
        <p>Đang tải thông tin...</p>
      )}
    </div>
  );
};

export default AboutComponent;
