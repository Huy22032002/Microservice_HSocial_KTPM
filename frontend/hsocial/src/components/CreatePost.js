import { useEffect, useState } from "react";
import {
  faImage,
  faSpinner,
  faEarth,
  faUserFriends,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useSelector } from "react-redux";
import { containsBannedWords } from "../components/BannedWords.js"; // Import banned words utility
import { fetchPostsUser } from "../api/postApi";

const CreatePost = ({ currentUser, onPostCreated }) => {
  const userId = useSelector((state) => state.user.userId);
  console.log("userId redux: ", userId);

  const API_URL = process.env.REACT_APP_API_URL;
  const [newContent, setNewContent] = useState("");
  const [files, setFiles] = useState([]);
  const [postPrivacy, setPostPrivacy] = useState("PUBLIC");
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPost = async () => {
    if (!newContent.trim()) {
      alert("Vui lòng nhập nội dung bài viết");
      return;
    }

    const { hasBannedWords, bannedWordsFound } =
      containsBannedWords(newContent);
    if (hasBannedWords) {
      alert(
        `Nội dung có chứa từ không phù hợp: ${bannedWordsFound.join(", ")}`
      );
      return;
    }

    setIsSubmitting(true);
    let mediaUrls = [];
    if (files.length > 0) {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      try {
        const response = await axios.post(
          `${API_URL}/api/posts/s3upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
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
        // createdAt: new Date(),
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
      onPostCreated();
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
  useEffect(() => {}, [currentUser]);

  return (
    <div className="post-form">
      <div className="post-form-header">
        <img
          src={currentUser?.avatar || require("../assets/default_avatar.png")}
          alt="User avatar"
          className="user-avatar"
        />
        <div className="post-form-input">
          <textarea
            className="textarea"
            placeholder={`${
              currentUser?.fullname || "Bạn"
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
              <video key={index} src={url} className="media-preview" controls />
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
            onClick={() => document.getElementById("privacy-select").click()}
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
          {isSubmitting ? <FontAwesomeIcon icon={faSpinner} spin /> : "Đăng"}
        </button>
      </div>
    </div>
  );
};

export default CreatePost;
