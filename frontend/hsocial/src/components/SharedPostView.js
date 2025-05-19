import React, { useState, useEffect } from "react";
import axios from "axios";
import { fetchUserDetail } from "../api/userApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import Post from "./post.js"; // Import component Post
import styles from "../styles/SharedPostView.module.css"; // Import CSS Module

const API_URL = process.env.REACT_APP_API_URL;

const SharedPostView = ({ sharedPostId }) => {
  const [sharedPostData, setSharedPostData] = useState(null);
  const [sharingUser, setSharingUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSharedPostDetails = async () => {
      try {
        // Fetch the shared post data
        const response = await axios.get(`${API_URL}/api/posts/shared/detail/${sharedPostId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const sharedData = response.data;
        setSharedPostData(sharedData);
        
        // Fetch the user who shared
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
          <span className={styles.shareTime}>
            {new Date(sharedPostData.sharedTime).toLocaleString("vi-VN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
      
      {/* Caption khi chia sẻ (nếu có) */}
      {sharedPostData.shareCaption && (
        <p className={styles.shareCaption}>{sharedPostData.shareCaption}</p>
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