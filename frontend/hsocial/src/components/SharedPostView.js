import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { fetchUserDetail } from "../api/userApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSpinner, 
  faEllipsisV, 
  faEdit, 
  faTrash, 
  faLock, 
  faUsers, 
  faGlobe 
} from "@fortawesome/free-solid-svg-icons";
import Post from "./post.js"; // Import component Post
import styles from "../styles/SharedPostView.module.css"; // Import CSS Module

const API_URL = process.env.REACT_APP_API_URL;

const SharedPostView = ({ sharedPostId, refreshPosts }) => {
  const userId = useSelector((state) => state.user.userId);
  const [sharedPostData, setSharedPostData] = useState(null);
  const [sharingUser, setSharingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // New states for options menu
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState("");
  
  const menuRef = useRef(null);

  // Handle outside clicks to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowOptionsMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchSharedPostDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/posts/shared/detail/${sharedPostId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const sharedData = response.data;
        setSharedPostData(sharedData);
        
        const sharingUserData = await fetchUserDetail(sharedData.userId);
        setSharingUser(sharingUserData);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching shared post:", error);
        setLoading(false);
      }
    };
    
    fetchSharedPostDetails();
  }, [sharedPostId]);
  
  const handleOptionClick = (e) => {
    e.stopPropagation();
    setShowOptionsMenu(!showOptionsMenu);
  };

  const handleEditCaption = () => {
    setEditCaption(sharedPostData?.shareCaption || "");
    setIsEditing(true);
    setShowOptionsMenu(false);
  };

  const saveEditedCaption = async () => {
    try {
      await axios.put(
        `${API_URL}/api/posts/shared/${sharedPostId}/edit`,
        { content: editCaption },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // Update local state
      setSharedPostData({ ...sharedPostData, shareCaption: editCaption });
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật caption:", error);
      alert("Không thể cập nhật caption. Vui lòng thử lại sau.");
    }
  };

  const deleteSharedPost = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài chia sẻ này không?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/posts/shared/${sharedPostId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      alert("Xóa bài chia sẻ thành công!");
      if (refreshPosts) {
        refreshPosts();
      }
    } catch (error) {
      console.error("Lỗi khi xóa bài chia sẻ:", error);
      alert("Không thể xóa bài chia sẻ. Vui lòng thử lại sau.");
    }
  };

  const updatePrivacy = async (privacy) => {
    try {
      await axios.put(
        `${API_URL}/api/posts/shared/${sharedPostId}/privacy`,
        { privacy },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // Update local state
      setSharedPostData({ ...sharedPostData, privacy: privacy });
      setShowOptionsMenu(false);
      alert(`Đã cập nhật quyền riêng tư thành ${privacy}`);
    } catch (error) {
      console.error("Lỗi khi cập nhật quyền riêng tư:", error);
      alert("Không thể cập nhật quyền riêng tư. Vui lòng thử lại sau.");
    }
  };
  
  if (loading) {
    return (
      <div className={styles.sharedPostWrapper}>
        <div className={styles.loadingContainer}>
          <FontAwesomeIcon icon={faSpinner} spin className={styles.loadingIcon} />
          <span>Đang tải bài viết được chia sẻ...</span>
        </div>
      </div>
    );
  }
  
  if (!sharedPostData?.post?.postId || !sharingUser) {
    return (
      <div className={styles.sharedPostWrapper}>
        <p className={styles.errorMessage}>Không thể hiển thị bài viết được chia sẻ này.</p>
      </div>
    );
  }

  const canModifyPost = sharingUser.id === Number(userId);

  return (
    <div className={styles.sharedPostWrapper}>
      {/* Phần thông tin người chia sẻ */}
      <div className={styles.shareHeader}>
        <img 
          src={sharingUser.avatar || "/default-avatar.png"} 
          alt="avatar" 
          className={styles.shareAvatar} 
        />
        <div className={styles.shareUserInfo}>
          <h3 className={styles.shareUserName}>{sharingUser.fullname}</h3>
          <div className={styles.timeAndPrivacy}>
            <span className={styles.shareTime}>
              {new Date(sharedPostData.sharedTime).toLocaleString("vi-VN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className={styles.privacyIcon}>
              {sharedPostData.privacy === "PUBLIC" ? (
                <FontAwesomeIcon icon={faGlobe} title="Công khai" />
              ) : sharedPostData.privacy === "FRIENDS" ? (
                <FontAwesomeIcon icon={faUsers} title="Bạn bè" />
              ) : (
                <FontAwesomeIcon icon={faLock} title="Chỉ mình tôi" />
              )}
            </span>
          </div>
        </div>
        
        {/* Thêm menu tùy chọn */}
        {canModifyPost && (
          <div className={styles.optionsContainer} ref={menuRef}>
            <button
              className={styles.optionsButton}
              onClick={handleOptionClick}
            >
              <FontAwesomeIcon icon={faEllipsisV} />
            </button>

            {showOptionsMenu && (
              <div className={styles.optionsMenu}>
                <button onClick={handleEditCaption}>
                  <FontAwesomeIcon icon={faEdit} /> Chỉnh sửa
                </button>
                <button className={styles.deleteButton} onClick={deleteSharedPost}>
                  <FontAwesomeIcon icon={faTrash} /> Xóa bài chia sẻ
                </button>
                <div className={styles.privacyOptions}>
                  <div className={styles.privacyMenuLabel}>Quyền riêng tư:</div>
                  <button
                    onClick={() => updatePrivacy("PRIVATE")}
                    className={sharedPostData.privacy === "PRIVATE" ? styles.active : ""}
                  >
                    <FontAwesomeIcon icon={faLock} /> Chỉ mình tôi
                  </button>
                  <button
                    onClick={() => updatePrivacy("FRIENDS")}
                    className={sharedPostData.privacy === "FRIENDS" ? styles.active : ""}
                  >
                    <FontAwesomeIcon icon={faUsers} /> Bạn bè
                  </button>
                  <button
                    onClick={() => updatePrivacy("PUBLIC")}
                    className={sharedPostData.privacy === "PUBLIC" ? styles.active : ""}
                  >
                    <FontAwesomeIcon icon={faGlobe} /> Công khai
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Caption khi chia sẻ (nếu có) - với chế độ chỉnh sửa */}
      {isEditing ? (
        <div className={styles.editCaptionContainer}>
          <textarea
            value={editCaption}
            onChange={(e) => setEditCaption(e.target.value)}
            className={styles.editCaptionTextarea}
            placeholder="Nhập caption của bạn..."
          />
          <div className={styles.editCaptionActions}>
            <button onClick={() => setIsEditing(false)}>Hủy</button>
            <button onClick={saveEditedCaption}>Lưu</button>
          </div>
        </div>
      ) : (
        sharedPostData.shareCaption && (
          <p className={styles.shareCaption}>{sharedPostData.shareCaption}</p>
        )
      )}
      
      {/* Container chứa bài viết gốc - sử dụng Post component */}
      <div className={styles.originalPostContainer}>
        <Post 
          postId={sharedPostData.post.postId} 
          isEmbedded={true} 
          disableSharing={true} 
        />
      </div>
    </div>
  );
};

export default SharedPostView;