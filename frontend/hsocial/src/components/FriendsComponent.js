import { getListFriendWithfullName } from "../api/friendApi";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styles from "../styles/FriendComponent.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams } from "react-router-dom";

const FriendComponent = () => {
  const [friends, setFriends] = useState([]);
  const userIdRedux = useSelector((state) => state.user.userId);
  const { userId } = useParams();

  const getListFriendDetail = async () => {
    try {
      const data = await getListFriendWithfullName(checkUser());
      setFriends(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách bạn bè:", error);
    }
  };

  const checkUser = () => {
    if (userId != userIdRedux) return userId;
    else return userIdRedux;
  };

  useEffect(() => {
    getListFriendDetail();
  }, [userId, userIdRedux]);

  const navigate = useNavigate();
  const handleBtnChat = () => {
    navigate(`/chat`);
  };

  const handleBtnProfile = (friendId) => {
    navigate(`/anotherUserProfile/${friendId}`);
  };

  return (
    <div className={styles.container}>
      <h2>Danh sách bạn bè</h2>
      <div className={styles.friendContainer}>
        {friends.length > 0 ? (
          friends.map((f, i) => (
            <div key={f.friendId} className={styles.friendItem}>
              <img
                onClick={() => handleBtnProfile(f.friendId)}
                src={f.avatar}
                alt="ha"
                style={{
                  background: "none",
                  borderRadius: "30px",
                  width: "100px",
                  height: "100px",
                }}
              />
              <p
                onClick={() => handleBtnProfile(f.friendId)}
                style={{ fontSize: "20px", fontWeight: "bold" }}
              >
                {f.name}
              </p>
              <button
                onClick={handleBtnChat}
                className={[styles.headerInfoBtn, styles.btnChat].join(" ")}
              >
                <FontAwesomeIcon
                  icon={faMessage}
                  style={{ marginRight: 4, height: 16 }}
                />
                <p style={{ fontWeight: "bold", fontSize: 14 }}> Nhắn tin</p>
              </button>
            </div>
          ))
        ) : (
          <p>Đang load danh sách bạn bè</p>
        )}
      </div>
    </div>
  );
};
export default FriendComponent;
