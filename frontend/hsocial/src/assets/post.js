import React, { useState, useEffect, useRef } from "react";
import { fetchUserDetail } from "../api/userApi";
import { useSelector } from "react-redux";
import axios from "axios";
import { fetchPostById } from "../api/postApi";
import "../styles/post.css";
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
} from "@fortawesome/free-solid-svg-icons";

import FullScreen from "./FullScreen";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const API_URL = process.env.REACT_APP_API_URL;

const Post = ({ postId }) => {
  const userId = useSelector((state) => state.user.userId);
  const [post, setPost] = useState(null);
  const [userCommentDetail, setUserCommentDetail] = useState({});
  const [postUser, setPostUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
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

  const deletePost = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      // Refresh the page or update posts list
      window.location.reload();
    } catch (error) {
      console.error("Lỗi khi xóa bài viết:", error);
      alert("Không thể xóa bài viết. Vui lòng thử lại sau.");
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

    try {
      await axios.post(
        `${API_URL}/api/posts/${postId}/comment`,
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
      <div className="post-header">
        <img src={postUser.avatar} alt="avatar" className="avatar" />
        <div className="post-user-info">
          <h3>{postUser.fullname}</h3>
          <span className="post-time">
            {new Date(post.createdAt).toLocaleString("vi-VN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {canModifyPost && (
          <div className="post-options-container" ref={menuRef}>
            <button className="post-options-button" onClick={handleOptionClick}>
              <FontAwesomeIcon icon={faEllipsisV} />
            </button>

            {showOptionsMenu && (
              <div className="post-options-menu">
                <button onClick={handleEditPost}>
                  <FontAwesomeIcon icon={faEdit} /> Chỉnh sửa
                </button>
                <button className="delete" onClick={deletePost}>
                  <FontAwesomeIcon icon={faTrash} /> Xóa
                </button>
                <div className="privacy-options">
                  <div className="privacy-menu-label">Quyền riêng tư:</div>
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
        <div className="post-edit-container">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="post-edit-textarea"
          />
          <div className="post-edit-actions">
            <button onClick={() => setIsEditing(false)}>Hủy</button>
            <button onClick={saveEditedPost}>Lưu</button>
          </div>
        </div>
      ) : (
        <div onClick={() => setPopUpFull(true)} className="post-content">
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
      <div className="post-actions">
        <button
          onClick={likePost}
          className={liked ? "liked like-animation" : ""}
        >
          <FontAwesomeIcon icon={liked ? faThumbsUp : farThumbsUp} />
          {liked ? "Đã thích" : "Thích"} ({likes})
        </button>
        <button>
          <FontAwesomeIcon icon={faCommentAlt} /> Bình luận (
          {post.comments?.length || 0})
        </button>
        <button>
          <FontAwesomeIcon icon={faShare} /> Chia sẻ
        </button>
      </div>
      <div className="post-comments">
        <div className="comments-list">
          {Array.isArray(post.comments) &&
            post.comments.map((comment) => {
              const user = userCommentDetail[comment.userId];
              return (
                <div key={comment.commentId} className="comment">
                  <img
                    src={user?.avatar || "https://via.placeholder.com/28"}
                    alt="avatar"
                    className="comment-avatar"
                  />
                  <div className="comment-content">
                    <span className="comment-user">
                      {user ? user.fullname : "Loading..."}
                    </span>
                    <span className="comment-text">{comment.content}</span>
                    <span className="comment-time">
                      {new Date(comment.createdAt).toLocaleString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
        <div className="comment-form">
          <input
            type="text"
            placeholder="Thêm bình luận..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
          />
          <button onClick={handleAddComment}>Gửi</button>
        </div>
      </div>
    </div>
  );
};

export default Post;
