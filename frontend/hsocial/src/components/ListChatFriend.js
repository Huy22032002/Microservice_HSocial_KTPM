import styles from "../styles/ListChatFriend.module.css";

const ListChatFriend = ({ friends }) => {
  const handleChatFriend = () => {
    console.log("btn lst fr");
  };

  return (
    <div className={styles.container}>
      <h3>Người liên hệ</h3>
      <div onClick={handleChatFriend}>
        {friends.map((friend) => (
          <div key={friend.friendId} className={styles.friendItem}>
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
