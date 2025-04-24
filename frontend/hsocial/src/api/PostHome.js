// PostHome.js
import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import "./PostHome.css";
import { fetchUserDetail } from "../api/userApi";

const PostHome = () => {
  const [friends, setFriends] = useState([]);
  const [posts, setPosts] = useState([]);
  // const [suggestions, setSuggestions] = useState([]);
  // const [events, setEvents] = useState([]); // Commented out instead of removed
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [files, setFiles] = useState([]);
  const [user, setUser] = useState({});
  const [postPrivacy, setPostPrivacy] = useState("PUBLIC"); // Thêm biến trạng thái cho quyền riêng tư bài viết
  const [comment, setComment] = useState(""); // Thêm biến trạng thái cho bình luận

  // const navigate = useNavigate();
  const userId = useSelector((state) => state.user.userId);

  // Sử dụng biến môi trường cho API (ví dụ: REACT_APP_API_URL)
  const API_URL = process.env.REACT_APP_API_URL;

  // Lấy thông tin người dùng
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

  
  //lấy danh sách bạn bè
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

  fetchFriends(); // Gọi hàm lấy danh sách bạn bè trước khi lấy bài viết

  // Lấy danh sách bài viết
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/posts/listPost`, {
        userId: Number(userId),
        friendIds: friends.map(f => f.id) || [],
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setPosts(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bài viết:", error);
    } finally {
      setLoading(false);
    }
  };
  
  

      // Adding the fetchUserDetail function
      // async function fetchUserDetail(userId) {
      //   try {
      //     const response = await axios.get(`${API_URL}/users/${userId}`, {
      //       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      //     });
      //     const userDetail = {
      //       avatar: response.data.avatar || "https://via.placeholder.com/150",
      //       fullname: response.data.fullname || "Unknown User"
      //     };
      //     return userDetail;
      //   } catch (error) {
      //     console.error("Error fetching user details:", error);
      //     return {
      //       avatar: "https://via.placeholder.com/150",
      //       fullname: "Unknown User"
      //     };
      //   }
      // }

  
  const createPost = async () => {
    if (!newContent.trim()) {
      alert("Vui lòng nhập nội dung bài viết");
      return;
    }
    
    
    let mediaUrls=[]; // Mảng lưu trữ URL của các file đã upload
    if (files && files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });
        console.log("Đang upload file:", file.name);
        try {
          const response = await axios.post(`${API_URL}/posts/s3upload`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          console.log(response.data);
          // mediaUrls = (await Promise.all(uploadPromises)).filter((url) => url !== null);
          // mediaUrls = response.data; // Lưu URLs từ response.data (danh sách string)
          return response.data; // URL từ S3
        } catch (error) {
          console.error("Lỗi khi upload file lên S3:", error);
          return null;
        }
      });
      mediaUrls = (await Promise.all(uploadPromises)).filter((url) => url !== null);
      console.log("Media URLs received:", mediaUrls);

    }else{
      console.log("Không có file nào được chọn.");
    }
  
    const postData = {
      post: {
        userId,
        postPrivacy,
        createdAt: new Date().toISOString(),
        
      },
      content: newContent,
      mediaUrls // Lưu danh sách URL file
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
  
  
  const handleFileChange = (event) => {
    const files = event.target.files;
    const maxSize = 10 * 1024 * 1024;
    const validFiles = [];
  
    if (files.length > 3) {
      alert("Chỉ được chọn tối đa 3 file.");
      return;
    }
  
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > maxSize) {
        alert(`File "${file.name}" quá lớn! Vui lòng chọn file nhỏ hơn 10MB.`);
      } else {
        validFiles.push(file);
      }
    }
  
    if (validFiles.length > 0) {
      setFiles(validFiles);
    }
  };
  
  

  // const sendFriendRequest = async (targetUserId) => {
  //   try {
  //     await axios.post(`${API_URL}/users/connect`, { targetUserId });
  //     alert("Yêu cầu kết bạn đã được gửi!");
  //     // Xoá gợi ý sau khi gửi yêu cầu (tuỳ chọn)
  //     setSuggestions(suggestions.filter((usr) => usr.id !== targetUserId));
  //   } catch (error) {
  //     console.error("Lỗi khi gửi yêu cầu kết bạn:", error);
  //   }
  // };

  const likePost = async (postId, userId) => {
    try {
      const res = await axios.post(
        `${API_URL}/posts/${postId}/like/${userId}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
  
      const { status, 
        // likeCount 
      } = res.data;
  
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
      setComment(""); // Xoá nội dung input bình luận sau khi gửi
      fetchPosts(); // Cập nhật lại danh sách bài viết sau khi thêm bình luận
    } catch (error) {
      console.error("Lỗi khi thêm bình luận:", error);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchPosts();
    // Nếu muốn bật gợi ý kết bạn, sự kiện, bỏ comment:
    // fetchSuggestions();
    // fetchEvents();
  }, []);

  // Temporary events array until backend is connected
  const events = [];

  return (
    <div className="main-container">
      <div className="content-area">

        {/* Form đăng bài */}
        <div className="post-form">
          <textarea
            className="textarea"
            placeholder="Nội dung bài viết"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          
          {/* Input file với giới hạn kích thước và cho phép chọn nhiều file */}
          <input
            className="file-input"
            type="file"
            accept="image/*, video/*"
            multiple
            onChange={handleFileChange} // Thêm hàm kiểm tra file
          />
          {/* Dropdown chọn quyền riêng tư cho bài viết */}
          <select className="privacy-select" onChange={(e) => setPostPrivacy(e.target.value)}>
            <option value="PUBLIC">Công khai</option>
            <option value="FRIENDS">Bạn bè</option>
            <option value="PRIVATE">Riêng tư</option>
          </select>
          <button className="btn" onClick={() => { createPost(); fetchPosts(); }}>
            ➕ Đăng bài
          </button>
          
          
        </div>


        {/* Danh sách bài viết */}
{loading ? (
  <p className="loading">Đang tải...</p>
) : (
  posts.map((post) => {
    const user = fetchUserDetail(post.userId); // Gọi 1 lần thôi

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

        {post.content?.files && post.content.files.length > 0 && (
          <div className="post-media">
            {(() => {
              const mediaElements = [];
              for (let i = 0; i < post.content.files.length; i++) {
                const fileUrl = post.content.files[i];
                const isVideo = fileUrl?.match(/\.(mp4|mov)$/i);

                mediaElements.push(
                  <div key={i}>
                    {isVideo ? (
                      <video controls src={fileUrl} className="media-video" />
                    ) : (
                      <img src={fileUrl} alt="Post media" className="media-image" />
                    )}
                  </div>
                );
              }
              return mediaElements;
            })()}
          </div>
        )}

        <p className="post-content">
          {post.content?.text || "Nội dung không có sẵn"}
        </p>

        {/* 👍 Like */}
        <div className="reactions">
          <button onClick={() => likePost(post.id, userId)} className="like-btn">
            {post.likedUsers?.includes(userId) ? "❤️ Đã thích" : "🤍 Thích"} ({post.likedUsers?.length || 0} người đã thích)
          </button>
        </div>


        {/* 💬 Bình luận */}
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

      {/* Sidebar */}
      <div className="sidebar">
        {/* <div className="sidebar-section">
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
        </div> */}
        
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
