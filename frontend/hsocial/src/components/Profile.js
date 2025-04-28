import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import styles from "../styles/UserHome.module.css";
import {
  fetchUserDetail,
  updateUserDetail,
  uploadAvatar,
} from "../api/userApi";
import { getListFriend } from "../api/friendApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import EditProfileModal from "./EditProfileModal";
import Header from "./header";
import { useNavigate } from "react-router-dom";

const UserHome = () => {
  const navigate = useNavigate();

  const userId = useSelector((state) => state.user.userId);
  const [userDetails, setUserDetails] = useState(null);
  const [friends, setFriends] = useState([]);
  const [posts, setPosts] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchDetails = async () => {
    const userData = await fetchUserDetail(userId);
    setUserDetails(userData);
    console.log("User detail:", userData);
  };

  const fetchFriends = async () => {
    const lstFriend = await getListFriend(userId);
    if (lstFriend) {
      const acceptedFriends = lstFriend
        .filter((f) => f.friendStatus === "ACCEPTED")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setFriends(acceptedFriends);
    }
  };
  const handleUpdateUserDetail = async (formData) => {
    try {
      const updatedUserDetail = await uploadAvatar(userId, formData);
      setUserDetails(updatedUserDetail);
      setShowEditModal(false);
      alert("Cập nhật thành công!");
    } catch (err) {
      console.log(err);
      alert("Lỗi cập nhật User Detail không thành công!");
    }
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
              <button
                onClick={() => setShowEditModal(true)}
                className={styles.btnEdit}
              >
                <FontAwesomeIcon icon={faPenToSquare} />
              </button>
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
                      <button
                        onClick={() => {
                          navigate(`/AnotherUserProfile/${friend.friendId}`);
                        }}
                        className={styles.profileBtn}
                      >
                        👤 Xem hồ sơ
                      </button>
                      <button
                        onClick={() => {
                          navigate("/chat");
                        }}
                        className={styles.chatBtn}
                      >
                        💬 Nhắn tin
                      </button>
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
      {showEditModal && (
        <EditProfileModal
          user={userDetails}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateUserDetail}
        />
      )}
    </>
  );
};

export default UserHome;
