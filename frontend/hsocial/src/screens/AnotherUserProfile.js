import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fetchUserDetail } from "../api/userApi";
import {
  accpeptFriend,
  getListFriend,
  getListPending,
  sendFriendRequest,
  removeFriend,
  removeFriendRequest,
} from "../api/friendApi";
import { fetchPostsUser } from "../api/postApi";
import Post from "../components/post";
import Header from "../components/header";
import styles from "../styles/AnotherUserProfile.module.css";
import { useSelector } from "react-redux";
import { faFilter, faUser } from "@fortawesome/free-solid-svg-icons";
import ProfileMenu from "../components/ProfileMenu";
import ProfileImage from "../components/ProfileImage";
import { checkOrCreate } from "../api/chatApi";
const AnotherUserProfile = () => {
  const { userId } = useParams();
  const [userDetails, setUserDetails] = useState(null);

  const [friends, setFriends] = useState([]);
  const [posts, setPosts] = useState([]);
  const [images, setImages] = useState([]);
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
      if (data) {
        setPosts(data);
        //lay tat ca bai viet co hinh anh
        data.forEach((post) => {
          if (post.content?.files?.length > 0) {
            setImages((prev) => [...prev, post]);
          }
        });
      }
    } catch (err) {
      console.log(err);
    }
  };
  const sortedPosts = [...posts].sort((a, b) => {
    if (btnFilter === "Mới nhất") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
  });
  const handleBtnFilterPosts = () => {
    if (btnFilter === "Mới nhất") setBtnFilter("Cũ nhất");
    else setBtnFilter("Mới nhất");
  };

  const checkFriendStatus = async () => {
    console.log("friends cua another user: ", friends);
    //lay danh sach ban be cua minh
    const myListFriend = await getListFriend(userIdRedux);
    console.log("my list friend: ", myListFriend);

    if (myListFriend.length === 0) setFriendStatus("Kết bạn");

    const isFriend = myListFriend.find((friend) => friend?.friendId == userId);
    if (isFriend) {
      setFriendStatus("Bạn bè");
      return;
    }
    //Nếu họ gửi lời mời kết bạn, lấy danh sach pending của mình
    const myListPending = await getListPending(userIdRedux);
    console.log("my liss pending", myListPending);
    if (myListPending != null) {
      const rs = myListPending.find((friend) => friend.friendId == userId);
      if (rs) {
        setFriendStatus("Chấp nhận");
        return;
      }
    }
    const hisListPending = await getListPending(userId);
    if (hisListPending != null && hisListPending.length > 0) {
      const rs = hisListPending.find(
        (friend) => friend.friendId == userIdRedux
      );
      if (rs) {
        setFriendStatus("Đã gửi lời mời");
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
      await removeFriendRequest(userId, userIdRedux);
      alert("Huỷ lời mời kết bạn thành công");
      setFriendStatus("Kết bạn");
    } else if (friendStatus === "Bạn bè") {
      console.log("Mở popup hủy kết bạn");
      handleRemoveFriend();
      alert("Huỷ kết bạn thành công!");
    }
  };
  const handleBtnChat = async () => {
    await checkOrCreate(userIdRedux, userId);
    navigate(`/chat`);
  };

  const location = useLocation();
  const isRootRoute = location.pathname === `/anotherUserProfile/${userId}`;

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
                <button className={styles.headerInfoBtn} onClick={handleButton}>
                  <FontAwesomeIcon
                    icon={faUser}
                    style={{ marginRight: 4, height: 16 }}
                  />
                  <p style={{ fontWeight: "bold", fontSize: 14 }}>
                    {friendStatus}
                  </p>
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
            <ProfileMenu />
            {/* menu */}
          </div>
          <div className={styles.profileContent}>
            {isRootRoute ? (
              <>
                <div className={styles.leftContent}>
                  <div className={styles.userInfo}>
                    <h2>Giới thiệu</h2>
                    <p>
                      {userDetails?.age} tuổi -{" "}
                      {userDetails?.gender ? "Nam" : "Nữ"}
                    </p>
                    <p>{userDetails?.address}</p>
                  </div>
                  <div className={styles.userImage}>
                    <h2>Ảnh</h2>
                    {images.length > 0 ? (
                      <ProfileImage images={images} />
                    ) : (
                      <p>Hiện chưa có ảnh</p>
                    )}
                  </div>
                </div>
                <div className={styles.rightContent}>
                  <div className={styles.filterContainer}>
                    <h2>Bài viết</h2>
                    <div className={styles.btnContainer}>
                      <FontAwesomeIcon icon={faFilter} />
                      <button
                        onClick={handleBtnFilterPosts}
                        className={styles.btnFilter}
                      >
                        {btnFilter}
                      </button>
                    </div>
                  </div>
                  <div className={styles.lstPosts}>
                    {!posts || posts.length === 0 ? (
                      <p>{userDetails?.fullname} chưa đăng bài viết nào!</p>
                    ) : (
                      sortedPosts.map((post, index) => (
                        <Post key={index} postId={post.postId} />
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <Outlet />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AnotherUserProfile;
