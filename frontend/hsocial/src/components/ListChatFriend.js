import { useNavigate } from "react-router-dom";
import styles from "../styles/ListChatFriend.module.css";

const ListChatFriend = ({ friends }) => {
  const navigate = useNavigate();

  const handleChatFriend = (id) => {
    console.log("btn lst fr");
    navigate(`/AnotherUserProfile/${id}`);
  };

  return (
    <div className={styles.container}>
      <h3>Người liên hệ</h3>
      <div>
        {friends.map((friend) => (
          <div
            key={friend.id}
            className={styles.friendItem}
            onClick={() => {
              handleChatFriend(friend.id);
            }}
          >
            <img
              src={friend.avatar || require("../assets/default_avatar.png")}
              alt="avatar"
              style={{ width: "40px", height: "40px", borderRadius: "40px" }}
            />
            <p>{friend.fullname}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ListChatFriend;
