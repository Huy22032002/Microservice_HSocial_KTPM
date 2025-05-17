import React, { useState, useEffect } from "react";
import { fetchUserDetail } from "../api/userApi";
import { useSelector } from "react-redux";
import axios from "axios";
import { fetchPostById } from "../api/postApi";
import "../styles/post.css";
import FullScreen from "./FullScreen";

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
        `${API_URL}/posts/${postId}/comment`,
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
        `${API_URL}/posts/${postId}/like/${userId}`,
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

  if (loading || !post) return <div>Loading...</div>;

  const content = post.content;
  const files = content?.files || [];

  return (
    <div className="post-container">
      <div className="post-header">
        <img src={postUser.avatar} alt="avatar" className="avatar" />
        <h3>{postUser.fullname}</h3>
      </div>

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
      {popUpFull && (
        <FullScreen post={post} onClose={() => setPopUpFull(false)} />
      )}

      <div className="post-actions">
        <button onClick={likePost}>
          {liked ? "👍 Unlike" : "👍 Like"} ({likes} người)
        </button>
        <button>➡️ Chia sẻ</button>
      </div>

      <div className="post-comments">
        {Array.isArray(post.comments) &&
          post.comments.map((comment) => {
            const user = userCommentDetail[comment.userId];
            return (
              <div key={comment.commentId} className="comment">
                <strong>{user ? user.fullname : "Loading..."}</strong>:{" "}
                {comment.content}
              </div>
            );
          })}
        <input
          type="text"
          placeholder="Thêm bình luận..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button onClick={handleAddComment}>Gửi</button>
      </div>
    </div>
  );
};

export default Post;
