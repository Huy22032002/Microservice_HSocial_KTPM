import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { fetchUserDetail } from "../api/userApi";
import { getListFriend } from "../api/friendApi";

import Header from "./header";
import styles from "../styles/UserHome.module.css";

const AnotherUserProfile = () => {
  const { userId } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [friends, setFriends] = useState([]);
  const [posts, setPosts] = useState([]);

  const fetchDetails = async () => {
    const userData = await fetchUserDetail(userId);
    setUserDetails(userData);
    console.log("User detail:", userData);
  };
  const fetchFriends = async () => {
    const lstFriend = await getListFriend(userId);
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
    <>
      <Header />
      <div className={styles.profileContainer}>
        <div className={styles.profileHeader}>
          {userDetails && (
            <div className={styles.profileCard}>
              <img
                src={userDetails.avatar}
                alt="Avatar"
                className={styles.avatar}
              />
              <div>
                <h2>{userDetails.fullname}</h2>
                <p>{userDetails.address}</p>
                <p>
                  {userDetails.gender === true ? "Nam" : "Nữ"} |{" "}
                  {userDetails.age} tuổi
                </p>
              </div>
            </div>
          )}
        </div>

        <div className={styles.profileBody}>
          {/* Danh sách bạn bè */}
          <div className={styles.friendsSection}>
            <h3>👥 Danh sách bạn bè</h3>
            <ul className={styles.friendList}>
              {Array.isArray(friends) && friends.length > 0 ? (
                friends.map((friend) => (
                  <li key={friend.friendId} className={styles.friendItem}>
                    <div className={styles.friendInfo}>
                      <p>
                        <strong>ID:</strong> {friend.friendId}
                      </p>
                      <span>
                        Ngày kết bạn:{" "}
                        {new Date(friend.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>

                    <div className={styles.friendActions}>
                      <button className={styles.profileBtn}>
                        👤 Xem hồ sơ
                      </button>
                      <button className={styles.chatBtn}>💬 Nhắn tin</button>
                    </div>
                  </li>
                ))
              ) : (
                <p>Chưa có bạn bè nào.</p>
              )}
            </ul>
          </div>

          {/* Danh sách bài viết */}
          <div className={styles.postsSection}>
            <h3>📝 Bài viết của bạn</h3>
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
    </>
  );
};

export default AnotherUserProfile;
