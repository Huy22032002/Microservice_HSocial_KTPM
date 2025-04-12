import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import "./PostHome.css";
import { fetchUserDetail } from "../api/userApi";

const PostHome = () => {
  const [friends, setFriends] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [files, setFiles] = useState([]);
  const [user, setUser] = useState({});
  const [postPrivacy, setPostPrivacy] = useState("PUBLIC");
  const [comment, setComment] = useState("");
  const [userDetails, setUserDetails] = useState({}); // lưu thông tin người dùng khác trong post
  const userId = useSelector((state) => state.user.userId);
  const API_URL = process.env.REACT_APP_API_URL;

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/friends/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setFriends(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bạn bè:", error);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/posts/listPost`, {
        userId: Number(userId),
        friendIds: friends.map((f) => f.id),
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setPosts(response.data);

      // Fetch chi tiết từng user trong bài viết
      const uniqueUserIds = [...new Set(response.data.map(p => p.userId))];
      const userDetailMap = {};
      await Promise.all(uniqueUserIds.map(async (uid) => {
        const detail = await fetchUserDetail(uid);
        userDetailMap[uid] = detail;
      }));
      setUserDetails(userDetailMap);

    } catch (error) {
      console.error("Lỗi khi lấy danh sách bài viết:", error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!newContent.trim()) {
      alert("Vui lòng nhập nội dung bài viết");
      return;
    }

    let mediaUrls = [];
    if (files.length > 0) {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      try {
        const response = await axios.post(`${API_URL}/posts/s3upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        mediaUrls = response.data;
      } catch (error) {
        console.error("Lỗi khi upload file lên S3:", error);
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
      await axios.post(`${API_URL}/posts/create`, postData, {
        headers: { "Content-Type": "application/json" },
      });

      setNewContent("");
      setFiles([]);
      fetchPosts();
    } catch (error) {
      console.error("Lỗi khi tạo bài viết:", error);
    }
  };

  const likePost = async (postId) => {
    try {
      const res = await axios.post(`${API_URL}/posts/${postId}/like/${userId}`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const { status } = res.data;

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id !== postId) return post;

          const liked = status === "liked";
          const updatedLikedUsers = liked
            ? [...(post.likedUsers || []), userId]
            : post.likedUsers.filter((id) => id !== userId);

          return {
            ...post,
            likedUsers: updatedLikedUsers,
          };
        })
      );
    } catch (error) {
      console.error("Lỗi khi gửi like:", error);
    }
  };

  const addComment = async (postId, comment) => {
    if (!comment.trim()) {
      alert("Vui lòng nhập bình luận");
      return;
    }
    try {
      await axios.post(`${API_URL}/posts/${postId}/comment`, {
        userId,
        comment,
      });
      setComment("");
      fetchPosts();
    } catch (error) {
      console.error("Lỗi khi thêm bình luận:", error);
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
  };

  // useEffect lifecycle
  useEffect(() => {
    fetchUser();
    fetchFriends(); // Đầu tiên
  }, []);

  useEffect(() => {
    if (friends.length > 0 || friends.length === 0) {
      fetchPosts(); // Chỉ gọi khi friends đã cập nhật
    }
  }, [friends]);

  return (
    <div className="main-container">
      <div className="content-area">
        <div className="post-form">
          <textarea
            className="textarea"
            placeholder="Nội dung bài viết"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <input
            className="file-input"
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
          />
          <select
            className="privacy-select"
            value={postPrivacy}
            onChange={(e) => setPostPrivacy(e.target.value)}
          >
            <option value="PUBLIC">Công khai</option>
            <option value="FRIENDS">Bạn bè</option>
            <option value="PRIVATE">Riêng tư</option>
          </select>
          <button className="btn" onClick={createPost}>
            ➕ Đăng bài
          </button>
        </div>

        {loading ? (
          <p className="loading">Đang tải...</p>
        ) : (
          posts.map((post) => {
            const user = userDetails[post.userId] || {
              avatar: "https://via.placeholder.com/150",
              fullname: "Người dùng",
            };

            return (
              <div className="post-card" key={post.id}>
                <div className="post-header">
                  <img className="avatar" src={user.avatar} alt="Avatar" />
                  <div className="post-user-info">
                    <span className="post-user-name">{user.fullname}</span>
                    <span className="post-time">
                      {new Date(post.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {post.content?.files?.length > 0 && (
                  <div className="post-media">
                    {post.content.files.map((fileUrl, i) => {
                      const isVideo = fileUrl?.match(/\.(mp4|mov)$/i);
                      return (
                        <div key={i}>
                          {isVideo ? (
                            <video controls src={fileUrl} className="media-video" />
                          ) : (
                            <img src={fileUrl} alt="Post media" className="media-image" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <p className="post-content">
                  {post.content?.text || "Nội dung không có sẵn"}
                </p>

                <div className="reactions">
                  <button onClick={() => likePost(post.id)} className="like-btn">
                    {post.likedUsers?.includes(userId) ? "❤️ Đã thích" : "🤍 Thích"} ({post.likedUsers?.length || 0})
                  </button>
                </div>

                <div className="comment-section">
                  <strong>💬 Bình luận:</strong>
                  {post.comments?.length > 0 ? (
                    post.comments.map((c, index) => (
                      <p key={index} className="comment">
                        {c.text || c}
                      </p>
                    ))
                  ) : (
                    <p>Chưa có bình luận</p>
                  )}
                  <input
                    className="comment-input"
                    type="text"
                    placeholder="Thêm bình luận..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button className="btn" onClick={() => addComment(post.id, comment)}>
                    Gửi
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="sidebar">
        <div className="sidebar-section">
          <h3>Sự kiện sắp tới</h3>
          {/* {[].map((event) => (
            <div key={event.id} className="event-card">
              <h4>{event.title}</h4>
              <p>{new Date(event.date).toLocaleDateString()}</p>
            </div>
          ))} */}
        </div>
      </div>
    </div>
  );
};

export default PostHome;
