import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import styles from "../styles/UserHome.module.css";
import { fetchUserDetail } from "../api/userApi";

const UserHome = () => {
  const userId = useSelector((state) => state.user.userId);
  const [userDetails, setUserDetails] = useState(null);
  const [friends, setFriends] = useState([]);
  const [posts, setPosts] = useState([]);

  // Lấy thông tin người dùng
  useEffect(() => {
    const fetchDetails = async () => {
      const userData = await fetchUserDetail(userId);
      setUserDetails(userData);

      // Giả lập fetch danh sách bạn bè và bài viết
      setFriends(userData.friends || []);
      setPosts(userData.posts || []);
    };

    fetchDetails();
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
            {friends.map((friend) => (
              <li key={friend._id} className={styles.friendItem}>
                <img
                  src={friend.avatar}
                  alt={friend.fullname}
                  className={styles.friendAvatar}
                />
                <span>{friend.fullname}</span>
              </li>
            ))}
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
