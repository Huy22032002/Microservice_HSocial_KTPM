import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import styles from "../styles/UserHome.module.css";
import { fetchUserDetail } from "../api/userApi";
import { getListFriend } from "../api/friendApi";
const UserHome = () => {
  const userId = useSelector((state) => state.user.userId);
  const [userDetails, setUserDetails] = useState(null);
  const [friends, setFriends] = useState([]);
  const [posts, setPosts] = useState([]);

  const fetchDetails = async () => {
    const userData = await fetchUserDetail(userId);
    setUserDetails(userData);
  };
  const fetchFriends = async () => {
    const lstFriend = await getListFriend(userId);
    //loc theo Status = Accepted
    const acceptedFriends = lstFriend
      .filter((f) => f.friendStatus === "ACCEPTED")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFriends(acceptedFriends);
  };
  useEffect(() => {
    fetchDetails();
    fetchFriends();
  }, [userId]);

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        {/* Hiển thị ảnh đại diện và thông tin người dùng */}
        {userDetails && (
          <>
            <img
              src={userDetails.avatar}
              alt="Avatar"
              className={styles.avatar}
            />
            <h2>{userDetails.fullname}</h2>
            <p>
              {userDetails.address} | {userDetails.age} tuổi
            </p>
          </>
        )}
      </div>

      <div className={styles.profileBody}>
        {/* Danh sách bạn bè */}
        <div className={styles.friendsSection}>
          <h3>Danh sách bạn bè</h3>
          <ul className={styles.friendList}>
            {Array.isArray(friends) && friends.length > 0 ? (
              friends.map((friend) => (
                <li key={friend.friendId} className={styles.friendItem}>
                  <p>Id: {friend.friendId} - </p>
                  <span>{friend.createdAt}</span>
                </li>
              ))
            ) : (
              <p>Chưa có bạn bè nào.</p>
            )}
          </ul>
        </div>

        {/* Danh sách bài viết */}
        <div className={styles.postsSection}>
          <h3>Bài viết của bạn</h3>
          {posts.length === 0 ? (
            <p>Chưa có bài viết nào!</p>
          ) : (
            <div className={styles.postsList}>
              {posts.map((post) => (
                <div key={post._id} className={styles.postItem}>
                  <h4>{post.title}</h4>
                  <p>{post.content}</p>
                  <p>
                    <small>{post.date}</small>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHome;
