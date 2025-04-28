import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { fetchUserDetail } from "../api/userApi";
import {
  accpeptFriend,
  getListFriend,
  getListPending,
  sendFriendRequest,
  removeFriend,
} from "../api/friendApi";

import Header from "./header";
import styles from "../styles/UserHome.module.css";
import { useSelector } from "react-redux";
const AnotherUserProfile = () => {
  const { userId } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [friends, setFriends] = useState([]);
  const [posts, setPosts] = useState([]);

  const userIdRedux = useSelector((state) => state.user.userId);
  //state hủy lời mời kết bạn
  const [showCancelPopup, setShowCancelPopup] = useState(false);

  //status pending, accepted, none
  const [friendStatus, setFriendStatus] = useState("");

  const fetchDetails = async () => {
    console.log("user id: ", userId);

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
  const checkFriendStatus = async () => {
    console.log("friends cua another user: ", friends);
    //lay danh sach ban be cua minh
    const myListFriend = await getListFriend(userIdRedux);
    console.log("my list friend: ", myListFriend, " ", typeof myListFriend);

    const isFriend = myListFriend.find((friend) => friend.friendId == userId);
    if (isFriend) {
      setFriendStatus("Bạn bè");
      return;
    }
    //trường hợp ai đó gửi lời mời kết bạn, lấy danh sach pending của mình
    const myListPending = await getListPending(userIdRedux);
    console.log("my liss pending", myListPending);
    if (myListPending != null) {
      const rs = myListPending.find((friend) => friend.friendId == userId);
      if (rs) {
        setFriendStatus("Chấp nhận");
        return;
      }
    }
    //ko phai pending, accpect thi là kết bạn
    setFriendStatus("Kết bạn");
  };

  const handleRemoveFriend = async () => {
    if (friendStatus === "Bạn bè") {
      const rs = await removeFriend(userIdRedux, userId);
      if (rs) {
        setFriendStatus("Kết bạn");
      }
    }
  };
  const handleButton = async () => {
    if (friendStatus === "Kết bạn") {
      await sendFriendRequest(userIdRedux, userId);
      alert("Gửi lời mời kết bạn thành công!");
      setFriendStatus("Đã gửi lời mời");
    } else if (friendStatus === "Chấp nhận") {
      await accpeptFriend(userIdRedux, userId);
      setFriendStatus("Bạn bè");
    } else if (friendStatus === "Đã gửi lời mời") {
      //show popup có nút hủy lời mời
      console.log("Mở popup có nút hủy lời mời kết bạn");
      setShowCancelPopup(true);
      //xóa status pending bên friendID để hủy
      setFriendStatus("Kết bạn");
    } else if (friendStatus === "Bạn bè") {
      console.log("Mở popup hủy kết bạn");
      setShowCancelPopup(true);
    }
  };
  useEffect(() => {
    if (userIdRedux && userId) {
      setFriends([]);
      fetchDetails();
      fetchFriends();
      checkFriendStatus();
    }
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
          <div className={styles.buttonContainer}>
            <button onClick={handleButton}>{friendStatus}</button>
            {showCancelPopup && (
              <div className={styles.popupUnderButton}>
                <div className={styles.popupContent}>
                  {friendStatus === "Bạn bè" ? (
                    <p>Bạn có muốn hủy kết bạn?</p>
                  ) : (
                    <p>Bạn có muốn hủy lời mời kết bạn?</p>
                  )}
                  <div className={styles.popupButtons}>
                    <button
                      className={styles.confirmBtn}
                      onClick={() => {
                        handleRemoveFriend();
                        console.log("Đã xác nhận hủy.");
                        setShowCancelPopup(false);
                        setFriendStatus("Kết bạn");
                      }}
                    >
                      Xác nhận
                    </button>
                    <button
                      className={styles.cancelBtn}
                      onClick={() => setShowCancelPopup(false)}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            )}
            <button>Nhắn tin</button>
          </div>
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
