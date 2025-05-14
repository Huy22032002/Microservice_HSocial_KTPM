import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchUserDetail } from "../api/userApi";
import {
  accpeptFriend,
  getListFriend,
  getListPending,
  sendFriendRequest,
  removeFriend,
} from "../api/friendApi";
import { fetchPostsUser } from "../api/postApi";
import Post from "./post";
import Header from "./header";
import styles from "../styles/AnotherUserProfile.module.css";
import { useSelector } from "react-redux";
import { faFilter, faUser } from "@fortawesome/free-solid-svg-icons";

const AnotherUserProfile = () => {
  const { userId } = useParams();
  const [userDetails, setUserDetails] = useState(null);

  const [friends, setFriends] = useState([]);
  const [posts, setPosts] = useState([]);
  const [btnFilter, setBtnFilter] = useState("Mới nhất");
  const navigate = useNavigate();

  const userIdRedux = useSelector((state) => state.user.userId);
  //state hủy lời mời kết bạn
  const [showCancelPopup, setShowCancelPopup] = useState(false);

  //status pending, accepted, none
  const [friendStatus, setFriendStatus] = useState("");

  //fetch thong tin chi tiet cua another user tu id trong param
  const fetchDetails = async () => {
    console.log("user id: ", userId);
    const userData = await fetchUserDetail(userId);
    setUserDetails(userData);
    console.log("User detail:", userData);
  };
  //danh sach ban be cua another user tu id trong param
  const fetchFriends = async () => {
    const lstFriend = await getListFriend(userId);
    if (lstFriend) {
      const acceptedFriends = lstFriend
        .filter((f) => f.friendStatus === "ACCEPTED")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setFriends(acceptedFriends);
    }
  };

  const fetchPosts = async () => {
    try {
      const data = await fetchPostsUser(userId);
      if (data) setPosts(data);
    } catch (err) {
      console.log(err);
    }
  };
  const checkFriendStatus = async () => {
    console.log("friends cua another user: ", friends);
    //lay danh sach ban be cua minh
    const myListFriend = await getListFriend(userIdRedux);
    console.log("my list friend: ", myListFriend);

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
  const handleBtnChat = () => {
    navigate(`/chat/${userId}`);
  };
  useEffect(() => {
    if (userIdRedux && userId) {
      setFriends([]);
      fetchDetails();
      fetchFriends();
      fetchPosts();
      checkFriendStatus();
    }
  }, [userId]);

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.centerWrapper}>
        <div className={styles.profileContainer}>
          {/* header */}
          <div className={styles.profileHeader}>
            <div className={styles.headerWallpaper}>
              <img
                alt="wallpaper"
                src={require("../assets/default_wallpaper.jpg")}
                style={{
                  objectFit: "cover",
                  width: "100%",
                  height: "100%",
                  borderRadius: "0 0 12px 12px",
                }}
              />
            </div>
            <div className={styles.headerInfo}>
              <div className={styles.headerInfoLeft}>
                <img
                  src={
                    userDetails?.avatar ||
                    require("../assets/default_avatar.png")
                  }
                  className={styles.headerInfoAvatar}
                  alt="avatar"
                />
                <div className={styles.headerInfoUser}>
                  <p style={{ fontSize: 28, fontWeight: "bold" }}>
                    {userDetails?.fullname || "Người dùng"}
                  </p>
                  <p
                    style={{ fontSize: 16, color: "gray", fontWeight: "bold" }}
                  >
                    {friends.length} người bạn
                  </p>
                </div>
              </div>
              <div className={styles.headerInfoRight}>
                <button
                  className={styles.headerInfoBtn}
                  onClick={() => console.log("click btn  bạn bè")}
                >
                  <FontAwesomeIcon
                    icon={faUser}
                    style={{ marginRight: 4, height: 16 }}
                  />
                  <p style={{ fontWeight: "bold", fontSize: 14 }}> Bạn bè</p>
                </button>
                <button
                  onClick={handleBtnChat}
                  className={[styles.headerInfoBtn, styles.btnChat].join(" ")}
                >
                  <FontAwesomeIcon
                    icon={faUser}
                    style={{ marginRight: 4, height: 16 }}
                  />
                  <p style={{ fontWeight: "bold", fontSize: 14 }}> Nhắn tin</p>
                </button>
              </div>
            </div>
            <hr
              style={{
                background: "rgba(0,0,0,0.1)",
                margin: "10px 40px",
                border: "none",
                height: "1px",
              }}
            />
            {/* menu */}
            <div className={styles.headerMenu}></div>
          </div>
          <div className={styles.profileContent}>
            <div className={styles.leftContent}>
              <div className={styles.userInfo}>
                <h2>Giới thiệu</h2>
                <p>
                  {userDetails?.age} tuổi - {userDetails?.gender ? "Nam" : "Nữ"}
                </p>
                <p>{userDetails?.address}</p>
              </div>
              <div className={styles.userImage}>
                <h2>Ảnh</h2>
              </div>
            </div>
            <div className={styles.rightContent}>
              <div className={styles.filterContainer}>
                <h2>Bài viết</h2>
                <div className={styles.btnContainer}>
                  <FontAwesomeIcon icon={faFilter} />
                  <button className={styles.btnFilter}>{btnFilter}</button>
                </div>
              </div>
              <div className={styles.lstPosts}>
                {!posts || posts.length === 0 ? (
                  <p>{userDetails?.fullname} chưa đăng bài viết nào!</p>
                ) : (
                  posts.map((post, index) => (
                    <Post key={index} postId={post.postId} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnotherUserProfile;

// <div className={styles.profileContainer}>
//   <div className={styles.profileHeader}>
//     {userDetails && (
//       <div className={styles.profileCard}>
//         <img
//           src={userDetails.avatar}
//           alt="Avatar"
//           className={styles.avatar}
//         />
//       </div>
//     )}
//     <div className={styles.buttonContainer}>
//       <button onClick={handleButton}>{friendStatus}</button>
//       {showCancelPopup && (
//         <div className={styles.popupUnderButton}>
//           <div className={styles.popupContent}>
//             {friendStatus === "Bạn bè" ? (
//               <p>Bạn có muốn hủy kết bạn?</p>
//             ) : (
//               <p>Bạn có muốn hủy lời mời kết bạn?</p>
//             )}
//             <div className={styles.popupButtons}>
//               <button
//                 className={styles.confirmBtn}
//                 onClick={() => {
//                   handleRemoveFriend();
//                   console.log("Đã xác nhận hủy.");
//                   setShowCancelPopup(false);
//                   setFriendStatus("Kết bạn");
//                 }}
//               >
//                 Xác nhận
//               </button>
//               <button
//                 className={styles.cancelBtn}
//                 onClick={() => setShowCancelPopup(false)}
//               >
//                 Hủy
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       <button>Nhắn tin</button>
//     </div>
//   </div>

//   <div className={styles.profileBody}>
//     {/* Danh sách bạn bè */}
//     <div className={styles.friendsSection}>
//       <h3>👥 Danh sách bạn bè</h3>
//       <ul className={styles.friendList}>
//         {Array.isArray(friends) && friends.length > 0 ? (
//           friends.map((friend) => (
//             <li key={friend.friendId} className={styles.friendItem}>
//               <div className={styles.friendInfo}>
//                 <p>
//                   <strong>ID:</strong> {friend.friendId}
//                 </p>
//                 <span>
//                   Ngày kết bạn:{" "}
//                   {new Date(friend.createdAt).toLocaleDateString("vi-VN")}
//                 </span>
//               </div>

//               <div className={styles.friendActions}>
//                 <button className={styles.profileBtn}>
//                   👤 Xem hồ sơ
//                 </button>
//                 <button className={styles.chatBtn}>💬 Nhắn tin</button>
//               </div>
//             </li>
//           ))
//         ) : (
//           <p>Chưa có bạn bè nào.</p>
//         )}
//       </ul>
//     </div>

//     {/* Danh sách bài viết */}
//     <div className={styles.postsSection}>
//       <h3>📝 Bài viết của bạn</h3>
//       {posts.length === 0 ? (
//         <p>Chưa có bài viết nào!</p>
//       ) : (
//         <div className={styles.postsList}>
//           {posts.map((post) => (
//             <div key={post._id} className={styles.postItem}>
//               <h4>{post.title}</h4>
//               <p>{post.content}</p>
//               <p>
//                 <small>{post.date}</small>
//               </p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   </div>
// </div>

// return (
//   <>
//     <Header />
//     <div className={styles.profileContainer}>
//       <div className={styles.profileHeader}>
//         <div className={styles.headerWallpaper}></div>
//         <div className={styles.headerInfo}></div>
//         <div className={styles.headerMenu}></div>
//       </div>
//       <div className={styles.profileContent}>
//         <div className={styles.leftContent}>
//           <div className={styles.userInfo}></div>
//           <div className={styles.userImage}></div>
//         </div>
//         <div className={styles.rightContent}>
//           <div className={styles.createPost}></div>
//           <div className={styles.lstPosts}></div>
//         </div>
//       </div>
//     </div>
//   </>
// );
