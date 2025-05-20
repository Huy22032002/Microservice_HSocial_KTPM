import React, { useState, useEffect, useRef } from "react";
import { fetchUserDetail } from "../api/userApi";
import { useSelector } from "react-redux";
import axios from "axios";
import { fetchPostById } from "../api/postApi";
import "../styles/Post.css";
import {
  faThumbsUp,
  faShare,
  faCommentAlt,
  faEllipsisV,
  faEdit,
  faTrash,
  faLock,
  faUsers,
  faGlobe,
  faThumbsUp as farThumbsUp,
  faSpinner,
  faTimes,
  faSmile,
} from "@fortawesome/free-solid-svg-icons";
import EmojiPicker from "emoji-picker-react";
import { containsBannedWords } from "./BannedWords"; 

import FullScreen from "./FullScreen";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { set } from "lodash";

const API_URL = process.env.REACT_APP_API_URL;

const Post = ({ postId,refreshPosts }) => {
  const userId = useSelector((state) => state.user.userId);
  const [post, setPost] = useState(null);
  const [userCommentDetail, setUserCommentDetail] = useState({});
  const [postUser, setPostUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [showCommentEmojiPicker, setShowCommentEmojiPicker] = useState(false);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCaption, setShareCaption] = useState("");
  const [sharePrivacy, setSharePrivacy] = useState("PUBLIC");
  const [isSharing, setIsSharing] = useState(false);

  const menuRef = useRef(null);

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

  const handleOptionClick = (e) => {
    e.stopPropagation();
    setShowOptionsMenu(!showOptionsMenu);
  };

  const handleEditPost = () => {
    setEditText(content?.text || "");
    setIsEditing(true);
    setShowOptionsMenu(false);
  };

  const saveEditedPost = async () => {
    try {
      await axios.put(
        `${API_URL}/api/posts/${postId}/edit`,
        { content: editText },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // Update local post state
      setPost({ ...post, content: { ...post.content, text: editText } });
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật bài viết:", error);
      alert("Không thể cập nhật bài viết. Vui lòng thử lại sau.");
    }
  };

  const sharePost = async () => {
    try {
      setIsSharing(true);
      const response = await axios.post(
        `${API_URL}/api/posts/${postId}/share/${userId}/${sharePrivacy}`,
        { caption: shareCaption },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setIsSharing(false);
      setShowShareModal(false);
      setShareCaption("");
      setSharePrivacy("PUBLIC");
      setShowOptionsMenu(false);

      // Show success message
      alert("Bài viết đã được chia sẻ thành công!");

      // Optional: Refresh the page or update the UI
      // window.location.reload();
      if (refreshPosts) {
        refreshPosts();
      }
    } catch (error) {
      console.error("Lỗi khi chia sẻ bài viết:", error);
      alert("Không thể chia sẻ bài viết. Vui lòng thử lại sau.");
      setIsSharing(false);
    }
  };

  const deletePost = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
      return;
    }

    try {
      const response = await axios.delete(`${API_URL}/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("Xóa thành công:", response.data);
      if (refreshPosts) {
        refreshPosts();
      }
    } catch (error) {
      console.error("Lỗi khi xóa bài viết:", error);

      // Show more detailed error information
      if (error.response) {
        console.error("Chi tiết lỗi:", error.response.data);
        alert(
          `Không thể xóa bài viết: ${
            error.response.data.message || error.response.data || "Lỗi server"
          }`
        );
      } else {
        alert("Không thể xóa bài viết. Vui lòng thử lại sau.");
      }
    }
  };

  const updatePrivacy = async (privacy) => {
    try {
      await axios.put(
        `${API_URL}/api/posts/${postId}/privacy`,
        { privacy },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // Update local post state
      setPost({ ...post, postPrivacy: privacy });
      setShowOptionsMenu(false);
      alert(`Đã cập nhật quyền riêng tư thành ${privacy}`);
    } catch (error) {
      console.error("Lỗi khi cập nhật quyền riêng tư:", error);
      alert("Không thể cập nhật quyền riêng tư. Vui lòng thử lại sau.");
    }
  };

  // if (loading || !post) return <div>Loading...</div>;

  const fetchData = async () => {
    try {
      const fetchedPost = await fetchPostById(postId);
      if (!fetchedPost) {
        console.error("Không tìm thấy bài viết với ID:", postId);
        return;
      }

      setPost(fetchedPost);
      setLikes(fetchedPost.likedUsers?.length || 0);
      setLiked(fetchedPost.likedUsers?.includes(userId));

      // Lấy thông tin người đăng bài viết
      const user = await fetchUserDetail(fetchedPost.userId);
      setPostUser(
        user || {
          avatar:
            "https://icons.veryicon.com/png/o/miscellaneous/rookie-official-icon-gallery/225-default-avatar.png",
          fullname: "Người dùng không xác định",
        }
      );

      // Lấy thông tin người dùng cho các bình luận (có cache)
      if (fetchedPost.comments?.length > 0) {
        const uniqueUserIds = [
          ...new Set(fetchedPost.comments.map((c) => c.userId)),
        ];
        const usersToFetch = uniqueUserIds.filter(
          (id) => !userCommentDetail[id]
        );

        const userDetailPromises = usersToFetch.map(async (userId) => {
          const userDetail = await fetchUserDetail(userId);
          return { userId, userDetail };
        });

        const fetchedUserDetails = await Promise.all(userDetailPromises);
        const newUserMap = fetchedUserDetails.reduce(
          (acc, { userId, userDetail }) => {
            acc[userId] = userDetail;
            return acc;
          },
          {}
        );

        setUserCommentDetail((prev) => ({ ...prev, ...newUserMap }));
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu bài viết hoặc user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [postId, userId]);

  console.log("postUser", postUser);
  console.log("userId", userId);
  const canModifyPost = postUser.id === Number(userId);
  console.log("canModifyPost", canModifyPost);

  const handleAddComment = async () => {
    if (!comment?.trim()) {
      alert("Vui lòng nhập bình luận");
      return;
    }
    if (userId == null) {
      alert("Vui lòng đăng nhập để bình luận");
      return;
    }

    const { hasBannedWords, bannedWordsFound } = containsBannedWords(comment);
    if (hasBannedWords) {
      alert(`Bình luận có chứa từ không phù hợp: ${bannedWordsFound.join(', ')}`);
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/posts/post/${postId}/comment`,
        { userId, comment },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setComment("");
      await fetchData(); // Làm mới bài viết và bình luận
    } catch (error) {
      console.error("Lỗi khi thêm bình luận:", error);
    }
  };

  const onCommentEmojiClick = (emojiObject) => {
    setComment(prevComment => prevComment + emojiObject.emoji);
    setShowCommentEmojiPicker(false);
  };

  const [popUpFull, setPopUpFull] = useState(false);

  const likePost = async () => {
    try {
      if (userId == null) {
        alert("Vui lòng đăng nhập để thích bài viết");
        return;
      }

      const res = await axios.post(
        `${API_URL}/api/posts/${postId}/like/${userId}`,
        null,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const { status } = res.data;
      if (status === "liked") {
        setLiked(true);
        setLikes((prev) => prev + 1);
      } else if (status === "unliked") {
        setLiked(false);
        setLikes((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Lỗi khi gửi like:", error);
    }
  };

  if (loading || !post)
    return (
      <div className="post-container loading">
        <div className="loading-animation">
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>Đang tải bài viết...</span>
        </div>
      </div>
    );
  const content = post.content;
  const files = content?.files || [];

  return (
    <div className="post-container">
      <div className="p-post-header">
        <img src={postUser.avatar} alt="avatar" className="p-avatar" />
        <div className="p-post-user-info">
          <h3>{postUser.fullname}</h3>
          <span className="p-post-time">
            {new Date(post.createdAt).toLocaleString("vi-VN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span className="p-privacy-icon" title={
              post.postPrivacy === "PUBLIC" 
                ? "Công khai" 
                : post.postPrivacy === "FRIENDS" 
                  ? "Bạn bè" 
                  : "Chỉ mình tôi"
            }>
              {post.postPrivacy === "PUBLIC" ? (
                <FontAwesomeIcon icon={faGlobe} />
              ) : post.postPrivacy === "FRIENDS" ? (
                <FontAwesomeIcon icon={faUsers} />
              ) : (
                <FontAwesomeIcon icon={faLock} />
              )}
            </span>
        </div>

        {canModifyPost && (
          <div className="p-post-options-container" ref={menuRef}>
            <button
              className="p-post-options-button"
              onClick={handleOptionClick}
            >
              <FontAwesomeIcon icon={faEllipsisV} />
            </button>

            {showOptionsMenu && (
              <div className="p-post-options-menu">
                <button onClick={handleEditPost}>
                  <FontAwesomeIcon icon={faEdit} /> Chỉnh sửa
                </button>
                <button className="delete" onClick={deletePost}>
                  <FontAwesomeIcon icon={faTrash} /> Xóa
                </button>
                <div className="p-privacy-options">
                  <div className="p-privacy-menu-label">Quyền riêng tư:</div>
                  <button
                    onClick={() => updatePrivacy("PRIVATE")}
                    className={post.postPrivacy === "PRIVATE" ? "active" : ""}
                  >
                    <FontAwesomeIcon icon={faLock} /> Chỉ mình tôi
                  </button>
                  <button
                    onClick={() => updatePrivacy("FRIENDS")}
                    className={post.postPrivacy === "FRIENDS" ? "active" : ""}
                  >
                    <FontAwesomeIcon icon={faUsers} /> Bạn bè
                  </button>
                  <button
                    onClick={() => updatePrivacy("PUBLIC")}
                    className={post.postPrivacy === "PUBLIC" ? "active" : ""}
                  >
                    <FontAwesomeIcon icon={faGlobe} /> Công khai
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="p-post-edit-container">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="p-post-edit-textarea"
          />
          <div className="p-post-edit-actions">
            <button onClick={() => setIsEditing(false)}>Hủy</button>
            <button onClick={saveEditedPost}>Lưu</button>
          </div>
        </div>
      ) : (
        <div onClick={() => setPopUpFull(true)} className="p-post-content">
          <p>{content?.text}</p>
          {Array.isArray(files) &&
            files.map((file, index) => {
              const isVideo = /\.(mp4|webm|ogg)$/i.test(file);
              return isVideo ? (
                <video key={index} controls className="p-post-media">
                  <source src={file} type="video/mp4" />
                </video>
              ) : (
                <img
                  key={index}
                  src={file}
                  alt={`file-${index}`}
                  className="p-post-image"
                  onClick={() => setPopUpFull(true)}
                />
              );
            })}
        </div>
      )}
      {/* <div onClick={() => setPopUpFull(true)} className="post-content">
        <p>{content?.text}</p>
        {Array.isArray(files) &&
          files.map((file, index) => {
            const isVideo = /\.(mp4|webm|ogg)$/i.test(file);
            return isVideo ? (
              <video key={index} controls className="post-media">
                <source src={file} type="video/mp4" />
              </video>
            ) : (
              <img
                key={index}
                src={file}
                alt={`file-${index}`}
                className="post-image"
                onClick={() => setPopUpFull(true)}
              />
            );
          })}
      </div> */}
      {popUpFull && (
        <FullScreen post={post} onClose={() => setPopUpFull(false)} />
      )}

      <div className="p-post-actions">
        <button
          onClick={likePost}
          className={liked ? "liked p-like-animation" : ""}
        >
          <FontAwesomeIcon icon={liked ? faThumbsUp : farThumbsUp} />
          {liked ? "Đã thích" : "Thích"} ({likes})
        </button>
        <button>
          <FontAwesomeIcon icon={faCommentAlt} /> Bình luận (
          {post.comments?.length || 0})
        </button>
        <button onClick={() => setShowShareModal(true)}>
          <FontAwesomeIcon icon={faShare} /> Chia sẻ
        </button>
      </div>

      <div className="p-post-comments">
        <div className="p-comments-list">
          {Array.isArray(post.comments) &&
            post.comments.map((comment) => {
              const user = userCommentDetail[comment.userId];
              return (
                <div key={comment.commentId} className="p-comment">
                  <img
                    src={user?.avatar || "https://via.placeholder.com/28"}
                    alt="avatar"
                    className="p-comment-avatar"
                  />
                  <div className="p-comment-content">
                    <span className="p-comment-user">
                      {user ? user.fullname : "Loading..."}
                    </span>
                    <span> </span>
                    <span className="p-comment-time">
                      {new Date(comment.createdAt).toLocaleString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                    <span> </span>
                    <span className="p-comment-text">{comment.content}</span>
                  </div>
                </div>
              );
            })}
        </div>
        <div className="p-comment-form">
          <input
            type="text"
            placeholder="Thêm bình luận..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
          />
          <button 
              className="p-emoji-button"
              onClick={() => setShowCommentEmojiPicker(!showCommentEmojiPicker)}
            >
            <FontAwesomeIcon icon={faSmile} />
          </button>
          {showCommentEmojiPicker && (
            <div className="p-emoji-picker-popup">
              <EmojiPicker onEmojiClick={onCommentEmojiClick} />
            </div>
          )}
          <button onClick={handleAddComment}>Gửi</button>
        </div>
      </div>
      {showShareModal && (
        <div className="p-share-modal-overlay">
          <div className="p-share-modal">
            <div className="p-share-modal-header">
              <h3>Chia sẻ bài viết</h3>
              <button
                className="p-close-button"
                onClick={() => setShowShareModal(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="p-share-modal-body">
              <div className="p-share-post-preview">
                <div className="p-preview-user">
                  <img
                    src={postUser.avatar}
                    alt="avatar"
                    className="p-preview-avatar"
                  />
                  <span>{postUser.fullname}</span>
                </div>
                <p className="p-preview-text">
                  {content?.text?.substring(0, 100)}
                  {content?.text?.length > 100 ? "..." : ""}
                </p>
                {files && files.length > 0 && (
                  <div className="p-preview-media">
                    {files[0].includes(".mp4") ? (
                      <video src={files[0]} className="p-preview-thumbnail" />
                    ) : (
                      <img
                        src={files[0]}
                        alt="Preview"
                        className="p-preview-thumbnail"
                      />
                    )}
                    {files.length > 1 && <span>+{files.length - 1}</span>}
                  </div>
                )}
              </div>
              <textarea
                className="p-share-caption"
                placeholder="Viết bình luận của bạn..."
                value={shareCaption}
                onChange={(e) => setShareCaption(e.target.value)}
              ></textarea>

              <div className="p-share-options">
                <div className="p-privacy-selector">
                  <div className="p-privacy-display">
                    <FontAwesomeIcon
                      icon={
                        sharePrivacy === "PUBLIC"
                          ? faGlobe
                          : sharePrivacy === "FRIENDS"
                          ? faUsers
                          : faLock
                      }
                    />
                    <span>
                      {sharePrivacy === "PUBLIC"
                        ? "Công khai"
                        : sharePrivacy === "FRIENDS"
                        ? "Bạn bè"
                        : "Riêng tư"}
                    </span>
                  </div>
                  <select
                    className="p-privacy-select"
                    value={sharePrivacy}
                    onChange={(e) => setSharePrivacy(e.target.value)}
                  >
                    <option value="PUBLIC">Công khai</option>
                    <option value="FRIENDS">Bạn bè</option>
                    <option value="PRIVATE">Riêng tư</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-share-modal-footer">
              <button
                className={`p-share-button ${isSharing ? "p-submitting" : ""}`}
                onClick={sharePost}
                disabled={isSharing}
              >
                {isSharing ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  "Chia sẻ ngay"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
