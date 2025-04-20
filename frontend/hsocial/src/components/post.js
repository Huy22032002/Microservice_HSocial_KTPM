import React, { useState, useEffect } from "react";
import { fetchUserDetail } from "../api/userApi";
import { useSelector } from "react-redux";
import axios from "axios";
import { fetchPostById } from "../api/postApi";
import "./post.css";

const API_URL = process.env.REACT_APP_API_URL;

const Post = ({ postId }) => {
  const userId = useSelector((state) => state.user.userId);
  const [post, setPost] = useState(null);
  const [userCommentDetail, setUserCommentDetail] = useState({}); // Đổi tên state ở đây
  const [loading, setLoading] = useState(true);
  // const [comments, setComments] = useState({});
  const [comment, setComment] = useState("");
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const fetchData = async () => {
    try {
      const fetchedPost = await fetchPostById(postId);
      console.log("Fetched post:", fetchedPost);
      if (!fetchedPost) {
        console.error("Không tìm thấy bài viết với ID:", postId);
        return;
      }
      setPost(fetchedPost);
      setLikes(fetchedPost.likedUsers?.length || 0);
      setLiked(fetchedPost.likedUsers?.includes(userId));
      // setComments(fetchedPost.comments || []); // Lưu trữ bình luận vào state

      // Lấy thông tin người dùng cho các bình luận
      if (fetchedPost.comments && fetchedPost.comments.length > 0) {
        const userDetailPromises = fetchedPost.comments.map(async (comment) => {
          const userDetail = await fetchUserDetail(comment.userId); // fetch từ API
          return { userId: comment.userId, userDetail }; // userDetail chứa name, avatar, ...
        });
      
        const userDetails = await Promise.all(userDetailPromises);
      
        const userMap = userDetails.reduce((acc, { userId, userDetail }) => {
          acc[userId] = userDetail; // gán theo userId
          return acc;
        }, {});
      
        console.log("User details:", userMap);
        setUserCommentDetail(userMap); // lưu vào state
      }
      
    } catch (error) {
      console.error("Lỗi khi lấy bài viết hoặc user:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    
    fetchData();
  }, [postId, userId]);

  const handleAddComment = async () => {
    if (!comment?.trim()) {
      alert("Vui lòng nhập bình luận");
      return;
    }
    if(userId==null){
      alert("Vui lòng đăng nhập để bình luận");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/posts/${postId}/comment`,
        { userId, comment },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchData()
      // Optionally reload comments
    } catch (error) {
      console.error("Lỗi khi thêm bình luận:", error);
    }
  };

  const likePost = async () => {
    try {
      const res = await axios.post(`${API_URL}/posts/${postId}/like/${userId}`, null, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

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

  if (loading || !post) return <div>Loading...</div>;

  const content = post.content;
  const files = content?.files || [];

  return (
    <div className="post-container">
      <div className="post-header">
        <img src={userCommentDetail[post.userId]?.avatar} alt="avatar" className="avatar" />
        <h3>{userCommentDetail[post.userId]?.name}</h3>
      </div>

      <div className="post-content">
        <p>{content?.text}</p>
        {Array.isArray(files) &&
          files.map((file, index) => {
            const isVideo = /\.(mp4|webm|ogg)$/i.test(file);
            return isVideo ? (
              <video key={index} controls className="post-media">
                <source src={file} type="video/mp4" />
              </video>
            ) : (
              <img key={index} src={file} alt={`file-${index}`} className="post-image" />
            );
          })}
      </div>

      <div className="post-actions">
        <button onClick={likePost}>{liked ? "Unlike" : "Like"} ({likes} User(s) Liked)</button>
        <button>Chia sẻ</button>
      </div>

      <div className="post-comments">
        {Array.isArray(post.comments) &&
          post.comments.map((comment) => {
            const user = userCommentDetail[comment.userId];
            return (
              <div key={comment.commentId} className="comment">
                <strong>{user ? user.fullname : 'Loading...'}</strong>: {comment.content}
              </div>
            );
          })}
        <input
          type="text"
          placeholder="Thêm bình luận..."
          value={comment || ""}
          onChange={(e) => setComment(e.target.value)}
        />
        <button onClick={handleAddComment}>Gửi</button>
      </div>



    </div>
  );
};

export default Post;
