import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import "../styles/PostHome.css";
import { fetchUserDetail } from "../api/userApi";
import Post from "./post.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImage,
  faLock,
  faEarth,
  faUserFriends,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import BannerHome from "../components/BannerHome.js";
import ListChatFriend from "./ListChatFriend.js";

const PostHome = () => {
  const [friends, setFriends] = useState([]);
  const [postIds, setPostIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [files, setFiles] = useState([]);
  const [postPrivacy, setPostPrivacy] = useState("PUBLIC");
  const [previewUrls, setPreviewUrls] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId = useSelector((state) => state.user.userId);
  const API_URL = process.env.REACT_APP_API_URL;

  const fetchFriends = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/friends/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.data.friends !== null && response.data.friends?.length > 0) {
        const friendDetails = await Promise.all(
          response.data.friends.map((friend) =>
            fetchUserDetail(friend.friendId)
          )
        );
        console.log(friendDetails);

        setFriends(friendDetails);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bạn bè:", error);
    }
  };

  const fetchPostIds = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/posts/listPostId`,
        {
          userId: Number(userId),
          friendIds: friends.map((f) => f.id),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setPostIds(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bài viết:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    if (userId) {
      try {
        const userDetail = await fetchUserDetail(userId);
        setCurrentUser(userDetail);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng hiện tại:", error);
      }
    }
  };

  const createPost = async () => {
    if (!newContent.trim()) {
      alert("Vui lòng nhập nội dung bài viết");
      return;
    }

    setIsSubmitting(true);
    let mediaUrls = [];
    if (files.length > 0) {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      try {

        const response = await axios.post(`${API_URL}/api/posts/s3upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        mediaUrls = response.data;
      } catch (error) {
        console.error("Lỗi khi upload file lên S3:", error);
        setIsSubmitting(false);
        return;
      }
    }

    const postData = {
      post: {
        userId,
        postPrivacy,
        createdAt: new Date().toISOString(),
      },
      content: newContent,
      mediaUrls,
    };

    try {
      await axios.post(`${API_URL}/api/posts/create`, postData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setNewContent("");
      setFiles([]);
      setPreviewUrls([]);
      fetchPostIds();
    } catch (error) {
      alert("Lỗi khi tạo bài viết!");
      console.error("Lỗi khi tạo bài viết:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const maxSize = 10 * 1024 * 1024;
    if (selectedFiles.length > 3) {
      alert("Chỉ được chọn tối đa 3 file.");
      return;
    }
    const validFiles = selectedFiles.filter((file) => file.size <= maxSize);
    if (validFiles.length < selectedFiles.length) {
      alert("Một số file quá lớn, chỉ chọn file dưới 10MB.");
    }
    setFiles(validFiles);

    // Create preview URLs
    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // useEffect lifecycle
  useEffect(() => {
    fetchFriends();
    fetchCurrentUser();
  }, [userId]);

  useEffect(() => {
    fetchPostIds();
  }, [friends]);

  const getPrivacyIcon = () => {
    switch (postPrivacy) {
      case "PUBLIC":
        return <FontAwesomeIcon icon={faEarth} />;
      case "FRIENDS":
        return <FontAwesomeIcon icon={faUserFriends} />;
      case "PRIVATE":
        return <FontAwesomeIcon icon={faLock} />;
      default:
        return <FontAwesomeIcon icon={faEarth} />;
    }
  };

  return (
    <div className="main-container">
      <div className="content-area">
        <div className="post-form">
          <div className="post-form-header">
            <img
              src={currentUser.avatar || "https://via.placeholder.com/40"}
              alt="User avatar"
              className="user-avatar"
            />
            <div className="post-form-input">
              <textarea
                className="textarea"
                placeholder={`${
                  currentUser.fullname || "Bạn"
                } ơi, bạn đang nghĩ gì?`}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
              />
            </div>
          </div>

          {previewUrls.length > 0 && (
            <div className="preview-container">
              {previewUrls.map((url, index) => {
                const file = files[index];
                const isVideo = file.type.startsWith("video/");

                return isVideo ? (
                  <video
                    key={index}
                    src={url}
                    className="media-preview"
                    controls
                  />
                ) : (
                  <img
                    key={index}
                    src={url}
                    alt={`Preview ${index}`}
                    className="media-preview"
                  />
                );
              })}
            </div>
          )}

          <div className="post-form-actions">
            <label className="file-input-label">
              <FontAwesomeIcon icon={faImage} className="icon" />
              <span>Ảnh/Video</span>
              <input
                className="file-input"
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
              />
            </label>

            <div className="privacy-selector">
              <div
                className="privacy-display"
                onClick={() =>
                  document.getElementById("privacy-select").click()
                }
              >
                {getPrivacyIcon()}
                <span>
                  {postPrivacy === "PUBLIC"
                    ? "Công khai"
                    : postPrivacy === "FRIENDS"
                    ? "Bạn bè"
                    : "Riêng tư"}
                </span>
              </div>
              <select
                id="privacy-select"
                className="privacy-select"
                value={postPrivacy}
                onChange={(e) => setPostPrivacy(e.target.value)}
              >
                <option value="PUBLIC">Công khai</option>
                <option value="FRIENDS">Bạn bè</option>
                <option value="PRIVATE">Riêng tư</option>
              </select>
            </div>

            <button
              className={`post-button ${isSubmitting ? "submitting" : ""}`}
              onClick={createPost}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                "Đăng"
              )}
            </button>
          </div>
        </div>

        <div className="posts-container">
          {loading ? (
            <div className="loading-container">
              <FontAwesomeIcon icon={faSpinner} spin className="spinner" />
              <span>Đang tải bài viết...</span>
            </div>
          ) : postIds.length === 0 ? (
            <div className="empty-state">
              <img
                src="https://cdn-icons-png.flaticon.com/512/7486/7486754.png"
                alt="Không có bài viết"
                className="empty-icon"
              />
              <p>Chưa có bài viết nào</p>
              <p className="empty-subtitle">
                Hãy đăng bài hoặc kết bạn để thấy các bài viết
              </p>
            </div>
          ) : (
            postIds.map((postId) => <Post key={postId} postId={postId} />)
          )}
        </div>
      </div>

      <div className="sidebar">
        <div className="sidebar-section">
          <h3>Gợi ý kết bạn</h3>
          <div className="suggestion-list">
            {/* Placeholder for friend suggestions */}
            <div className="suggestion-item">
              <img
                src={
                  "https://w7.pngwing.com/pngs/205/731/png-transparent-default-avatar-thumbnail.png" ||
                  require("../../public/default_avatar.png")
                }
                alt="Suggested user"
              />
              <div className="suggestion-info">
                <span className="suggestion-name">Jane Doe</span>
                <span className="suggestion-meta">12 bạn chung</span>
              </div>
              <button className="suggestion-action">Kết bạn</button>
            </div>
            <div className="suggestion-item">
              <img
                src={
                  "https://w7.pngwing.com/pngs/205/731/png-transparent-default-avatar-thumbnail.png" ||
                  require("../../public/default_avatar.png")
                }
                alt="Suggested user"
              />
              <div className="suggestion-info">
                <span className="suggestion-name">John Smith</span>
                <span className="suggestion-meta">5 bạn chung</span>
              </div>
              <button className="suggestion-action">Kết bạn</button>
            </div>
          </div>
        </div>

        <div className="sidebar-section">
          <h3>Sự kiện sắp tới</h3>
          <div className="events-list">
            <div className="event-item">
              <div className="event-date">
                <span className="event-month">May</span>
                <span className="event-day">15</span>
              </div>
              <div className="event-info">
                <span className="event-title">Giao lưu game online</span>
                <span className="event-meta">20 người tham gia</span>
              </div>
            </div>
            <div className="event-item">
              <div className="event-date">
                <span className="event-month">Jun</span>
                <span className="event-day">03</span>
              </div>
              <div className="event-info">
                <span className="event-title">Workshop AI</span>
                <span className="event-meta">45 người tham gia</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="rightContainerHome">
        <BannerHome />
        <hr style={{ color: "rgba(0,0,0,0.1)" }} />
        <ListChatFriend friends={friends} />
      </div>
    </div>
  );
};

export default PostHome;
