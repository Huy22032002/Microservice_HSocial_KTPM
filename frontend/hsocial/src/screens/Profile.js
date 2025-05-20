import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import styles from "../styles/AnotherUserProfile.module.css";
import { fetchUserDetail, uploadAvatar } from "../api/userApi";
import { getListFriend } from "../api/friendApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import EditProfileModal from "../components/EditProfileModal";
import Header from "../components/header";
import Post from "../components/post";
import ProfileMenu from "../components/ProfileMenu";
import ProfileImage from "../components/ProfileImage";

import { faAdd, faFilter, faUser } from "@fortawesome/free-solid-svg-icons";
import { fetchPostsUser } from "../api/postApi";
import CreatePost from "../components/CreatePost";
import { useLocation, Outlet } from "react-router-dom";

const UserHome = () => {
  const userId = useSelector((state) => state.user.userId);
  const [userDetails, setUserDetails] = useState(null);
  const [friends, setFriends] = useState([]);
  const [posts, setPosts] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [btnFilter, setBtnFilter] = useState("Mới nhất");
  const [images, setImages] = useState([]);

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
  const fetchPosts = async () => {
    const data = await fetchPostsUser(userId);
    if (data) {
      setPosts(data);
      const listImage = data.filter((p) => p.content?.files?.length > 0);
      setImages(listImage);
    }
  };
  const sortedPosts = [...posts].sort((a, b) => {
    if (btnFilter === "Mới nhất") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
  });

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
  const closeUpdateModal = () => {
    setShowEditModal(false);
  };
  const handleBtnFilterPosts = () => {
    if (btnFilter === "Mới nhất") setBtnFilter("Cũ nhất");
    else setBtnFilter("Mới nhất");
  };

  const handleCreatePost = async () => {
    await fetchPosts();
  };

  const location = useLocation();
  const isRootRoute = location.pathname === `/profile/${userId}`;

  useEffect(() => {
    fetchDetails();
    fetchFriends();
    fetchPosts();
  }, [userId]);

  return (
    <div className={styles.container}>
      <Header />
      {showEditModal && (
        <EditProfileModal
          user={userDetails}
          onClose={closeUpdateModal}
          onSave={handleUpdateUserDetail}
        />
      )}
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
                  onClick={() => console.log("click btn add story")}
                >
                  <FontAwesomeIcon
                    icon={faAdd}
                    style={{ marginRight: 4, height: 16 }}
                  />
                  <p style={{ fontWeight: "bold", fontSize: 14 }}> Thêm tin</p>
                </button>
                <button
                  onClick={() => setShowEditModal(true)}
                  className={[styles.headerInfoBtn, styles.btnUpdate].join(" ")}
                >
                  <FontAwesomeIcon
                    icon={faUser}
                    style={{ marginRight: 4, height: 16 }}
                  />
                  <p style={{ fontWeight: "bold", fontSize: 14 }}> Cập nhật</p>
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
            <ProfileMenu />
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
                  <CreatePost
                    currentUser={userDetails}
                    onPostCreated={handleCreatePost}
                  />
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

export default UserHome;
