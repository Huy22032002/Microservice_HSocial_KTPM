// PostHome.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import "./PostHome.css";

const PostHome = () => {
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [file, setFile] = useState(null);
  const [user, setUser] = useState({});

  const navigate = useNavigate();
  const userId = useSelector((state) => state.user.userId);

  // Sử dụng biến môi trường cho API (ví dụ: REACT_APP_API_URL)
  const API_URL = process.env.REACT_APP_API_URL;

  // Lấy thông tin người dùng
  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
    }
  };

  // ---------------------------------------------------------
  // CHÈN THÊM HÀM CỦA BẠN Ở VỊ TRÍ HỢP LÝ
  // Lấy avatar người dùng
  const userAvatar = user.avatar || "https://via.placeholder.com/150";
  // Lấy danh sách bài viết của người dùng
  const userPosts = posts.filter((post) => post.userId === userId);
  // Lấy username người dùng
  const userName = user.name || "Người dùng";
  // ---------------------------------------------------------

  // Lấy danh sách bài viết
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/posts/listPost/${userId}`);
      if (!response.ok) throw new Error("Lỗi khi lấy dữ liệu");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  // Tạo bài viết mới (upload kèm media nếu có)
//   const createPost = async () => {
//     if (!newContent) return alert("Vui lòng nhập nội dung bài viết");

//     const formData = new FormData();
//     formData.append("content", newContent);
//     formData.append("userId", userId);
//     formData.append("postTime", new Date().toISOString());
//     formData.append("isStory", false);
//     formData.append("postPrivacy", "PUBLIC");
//     if (file) {
//       formData.append("media", file);
//     }

//     try {
//       await axios.post(`${API_URL}/posts/create`, formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       setNewContent("");
//       setFile(null);
//       fetchPosts();
//     } catch (error) {
//       console.error("Lỗi khi tạo bài viết:", error);
//     }
//   };

  const createPost = async () => {
    if (!newContent) return alert("Vui lòng nhập nội dung bài viết");
  
    let mediaUrl = null;
    
    // Nếu có file, upload lên S3 trước
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      
      try {
        const uploadResponse = await axios.post(`${API_URL}/s3/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        mediaUrl = uploadResponse.data; // Lấy URL từ S3
      } catch (error) {
        console.error("Lỗi khi upload file lên S3:", error);
        return;
      }
    }
  
    // Gửi bài viết lên API
    const postData = {
      content: newContent,
      userId,
      postTime: new Date().toISOString(),
      isStory: false,
      postPrivacy: "PUBLIC",
      mediaUrl, // Lưu URL file từ S3
    };
  
    try {
      await axios.post(`${API_URL}/posts/create`, postData);
      setNewContent("");
      setFile(null);
      fetchPosts();
    } catch (error) {
      console.error("Lỗi khi tạo bài viết:", error);
    }
  };
  
  // Thả cảm xúc cho bài viết
  const reactToPost = async (postId, reaction) => {
    try {
      await axios.post(`${API_URL}/posts/${postId}/react`, { reaction });
      fetchPosts();
    } catch (error) {
      console.error("Lỗi khi thả cảm xúc:", error);
    }
  };

  // Gửi yêu cầu kết bạn
  const sendFriendRequest = async (targetUserId) => {
    try {
      await axios.post(`${API_URL}/users/connect`, { targetUserId });
      alert("Yêu cầu kết bạn đã được gửi!");
      // Xoá gợi ý sau khi gửi yêu cầu (tuỳ chọn)
      setSuggestions(suggestions.filter((usr) => usr.id !== targetUserId));
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu kết bạn:", error);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchPosts();
    // Nếu muốn bật gợi ý kết bạn, sự kiện, bỏ comment:
    // fetchSuggestions();
    // fetchEvents();
  }, []);

  return (
    <div className="main-container">
      <div className="content-area">
        {/* Header */}
        <div className="header">
          <h2 className="title">
            📝 Danh sách bài viết
            {/* Hoặc hiển thị tên user:  `📝 Danh sách bài viết - ${userName}` */}
          </h2>
          <img
            className="avatar"
            src={userAvatar}
            alt="Avatar"
            onClick={() => navigate("/userProfile")}
          />
          <img
            className="messenger-icon"
            src="https://via.placeholder.com/30"
            alt="Messenger"
            onClick={() => navigate("/chat")}
          />
        </div>

        {/* Form đăng bài */}
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
            accept="image/*, video/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button className="btn" onClick={createPost}>
            ➕ Đăng bài
          </button>
        </div>

        <button className="btn refresh-btn" onClick={fetchPosts}>
          🔄 Làm mới
        </button>

        {/* Danh sách bài viết */}
        {loading ? (
          <p className="loading">Đang tải...</p>
        ) : (
          posts.map((post) => (
            <div className="post-card" key={post.id}>
              <div className="post-header">
                <img className="avatar" src={post.userAvatar} alt="Avatar" />
                <div className="post-user-info">
                  <span className="post-user-name">{post.userName}</span>
                  <span className="post-time">
                    {new Date(post.postTime).toLocaleString()}
                  </span>
                </div>
              </div>

              {post.mediaUrl && (
                <div className="post-media">
                  {post.mediaType === "video" ? (
                    <video controls src={post.mediaUrl} className="media-video" />
                  ) : (
                    <img src={post.mediaUrl} alt="Post media" className="media-image" />
                  )}
                </div>
              )}

              <h3 className="post-title">{post.title || "Bài viết"}</h3>
              <p className="post-content">{post.content}</p>

              <div className="reactions">
                {["❤️", "😂", "😮", "😢", "😡"].map((emoji) => (
                  <span
                    key={emoji}
                    className="reaction-emoji"
                    onClick={() => reactToPost(post.id, emoji)}
                  >
                    {emoji}
                  </span>
                ))}
              </div>

              <div className="comment-section">
                <strong>Bình luận:</strong>
                {post.comments?.map((c, index) => (
                  <p key={index} className="comment">
                    {c}
                  </p>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-section">
          <h3>Gợi ý kết bạn</h3>
          {suggestions.map((sug) => (
            <div key={sug.id} className="suggestion-card">
              <img className="avatar" src={sug.avatar} alt="Avatar" />
              <div className="suggestion-info">
                <span>{sug.name}</span>
                <button
                  className="btn small-btn"
                  onClick={() => sendFriendRequest(sug.id)}
                >
                  Kết bạn
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar-section">
          <h3>Sự kiện sắp tới</h3>
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <h4>{event.title}</h4>
              <p>{new Date(event.date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostHome;
