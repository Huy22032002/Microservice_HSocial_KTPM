import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import "./PostHome.css";
import { fetchUserDetail } from "../api/userApi";
import Post from "./post.js";

const PostHome = () => {
  const [friends, setFriends] = useState([]);
  const [posts, setPosts] = useState([]);
  const [postIds, setPostIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [files, setFiles] = useState([]);
  const [postPrivacy, setPostPrivacy] = useState("PUBLIC");

  const userId = useSelector((state) => state.user.userId);
  // alert(userId);
  const API_URL = process.env.REACT_APP_API_URL;

  const fetchFriends = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/friends/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("Danh sách bạn bè:", response.data.friends);
      if (response.data.friend!=null && response.data.friends.length > 0) {
        const friendDetails = await Promise.all(
          response.data.friends.map((friend) => fetchUserDetail(friend.id))
        );
        setFriends(friendDetails);
      }
      // setFriends(response.data.friends);
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
        //neu friends !=null thi lay danh sach friendIds
        // friendIds: friends.length > 0 ? friends.map((f) => f.id) : [],
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

  const fetchPostIds = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/posts/listPostId`, {
        userId: Number(userId),
        friendIds: friends.map((f) => f.id),
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("Danh sách bài viết:", response.data);
      setPostIds(response.data);
        
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
          headers: { 
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
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
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      setNewContent("");
      setFiles([]);
      // fetchPosts();
      fetchPostIds(); // Gọi lại để lấy danh sách bài viết mới nhất
    } catch (error) {
      alert("Lỗi khi tạo bài viết!");
      console.error("Lỗi khi tạo bài viết:", error);
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
    fetchFriends(); // Đầu tiên
  }, []);

  useEffect(() => {
    if (friends.length > 0 || friends.length === 0) {
      // fetchPosts(); // Chỉ gọi khi friends đã cập nhật
      fetchPostIds(); // Chỉ gọi khi friends đã cập nhật
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
        <div className="posthome-loading">Đang tải bài viết...</div>
        ) : postIds.length === 0 ? (
          <div className="posthome-empty">Không có bài viết nào</div>
        ) : (
          postIds.map((postId) => <Post key={postId} postId={postId} />)
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
