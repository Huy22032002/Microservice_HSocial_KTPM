import { useEffect, useState, useRef } from "react";
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
  faPlus,
  faTimes,
  faChevronRight,
  faChevronLeft,
  faHeart,
  faHeart as farHeart,
  faEllipsisV,
  faTrash,
  faUsers,
  faGlobe,
  faSmile,
} from "@fortawesome/free-solid-svg-icons";
import BannerHome from "../components/BannerHome.js";
import ListChatFriend from "./ListChatFriend.js";
import SharedPostView from "./SharedPostView";
import { containsBannedWords } from "./BannedWords"; // Import banned words utility
import EmojiPicker from 'emoji-picker-react';

const PostHome = () => {
  const [friends, setFriends] = useState([]);
  const [postIds, setPostIds] = useState([]);
  const [sharedPostIds, setSharedPostIds] = useState([]);
  const [combinedPosts, setCombinedPosts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [files, setFiles] = useState([]);
  const [postPrivacy, setPostPrivacy] = useState("PUBLIC");
  const [previewUrls, setPreviewUrls] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stories, setStories] = useState([]);
  const [likedStories, setLikedStories] = useState({});
  const [storyUserDetails, setStoryUserDetails] = useState({});
  const [showStoryOptions, setShowStoryOptions] = useState(false);
  const storyOptionsRef = useRef(null);

  const [showStoryModal, setShowStoryModal] = useState(false);
  const [storyContent, setStoryContent] = useState("");
  const [storyFiles, setStoryFiles] = useState([]);
  const [storyPreviewUrls, setStoryPreviewUrls] = useState([]);
  const [isSubmittingStory, setIsSubmittingStory] = useState(false);
  const [storyPrivacy, setStoryPrivacy] = useState("PUBLIC");
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(null);

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

  // Alternative implementation that doesn't require a new API endpoint
  // Alternative implementation that uses the new API endpoint
  const combinePosts = async () => {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);
      // Fetch all posts and shared posts in one request
      const response = await axios.post(
        `${API_URL}/api/posts/listPostIdAndSharedPostId`,
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
      console.log("Combined posts response:", response.data);

      // Chuyển đổi dữ liệu từ response thành định dạng cần thiết
      const regularPosts = [];
      const sharedPosts = [];

      if (Array.isArray(response.data)) {
        // Xử lý từng item trong mảng kết quả
        for (const item of response.data) {
          if (item.post) {
            // Đây là regular post
            const postId = item.post;
            regularPosts.push({
              id: postId,
              type: "regular",
            });
          } else if (item.sharedPost) {
            // Đây là shared post
            const sharedPostId = item.sharedPost;
            sharedPosts.push({
              id: sharedPostId,
              type: "shared",
            });
          }
        }
      }

      // Cập nhật state cho các loại bài viết riêng biệt
      setPostIds(regularPosts.map((post) => post.id));
      setSharedPostIds(sharedPosts.map((post) => post.id));

      // Gộp tất cả posts - Không cần sắp xếp vì backend đã sắp xếp
      const allPosts = [...regularPosts, ...sharedPosts];

      // Filter posts theo thứ tự đã sắp xếp từ backend
      const orderedPosts = response.data
        .map((item) => {
          if (item.post) {
            return {
              id: item.post,
              type: "regular",
            };
          } else if (item.sharedPost) {
            return {
              id: item.sharedPost,
              type: "shared",
            };
          }
          return null;
        })
        .filter((item) => item !== null);

      setCombinedPosts(orderedPosts);
    } catch (error) {
      console.error("Lỗi khi lấy bài viết:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  };
  const refreshAfterShare = () => {
    console.log("Refreshing posts after share...");
    // Đặt loading để hiển thị trạng thái đang tải
    setLoading(true);
    // Gọi hàm combinePosts để lấy dữ liệu mới
    combinePosts();
  };

  // Fetch stories
  const fetchStories = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/posts/stories`,
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

      // Lấy danh sách story
      const storiesData = response.data;
      setStories(storiesData);

      // Lấy chi tiết người dùng cho mỗi story
      const userIds = [...new Set(storiesData.map((story) => story.userId))];
      const userDetailsMap = {};

      await Promise.all(
        userIds.map(async (uid) => {
          try {
            const userDetail = await fetchUserDetail(uid);
            userDetailsMap[uid] = userDetail;
          } catch (error) {
            console.error(`Lỗi khi lấy thông tin người dùng ${uid}:`, error);
            userDetailsMap[uid] = {
              avatar: "https://via.placeholder.com/40",
              fullname: "Người dùng",
            };
          }
        })
      );

      setStoryUserDetails(userDetailsMap);

      // Xác định trạng thái like dựa trên likedUsers có sẵn trong mỗi story
      const likedStatusMap = {};
      storiesData.forEach((story) => {
        // Kiểm tra nếu userId hiện tại có trong danh sách likedUsers
        const isLiked = story.likedUsers?.includes(Number(userId)) || false;
        likedStatusMap[story.postId] = isLiked;
      });

      setLikedStories(likedStatusMap);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách story:", error);
    }
  };
  const likeStory = async (storyId) => {
    // Dừng timer tạm thời
    if (autoAdvanceTimer) {
      clearInterval(autoAdvanceTimer);
      setAutoAdvanceTimer(null);
    }

    try {
      // Cập nhật UI trước để tạo trải nghiệm mượt mà
      setLikedStories((prev) => ({
        ...prev,
        [storyId]: !prev[storyId],
      }));

      // Cập nhật danh sách likedUsers trong state story
      setStories((prevStories) =>
        prevStories.map((story) => {
          if (story.postId === storyId) {
            let updatedLikedUsers = [...(story.likedUsers || [])];

            // Nếu đã like, xóa khỏi danh sách; nếu chưa like, thêm vào danh sách
            if (updatedLikedUsers.includes(Number(userId))) {
              updatedLikedUsers = updatedLikedUsers.filter(
                (id) => id !== Number(userId)
              );
            } else {
              updatedLikedUsers.push(Number(userId));
            }

            return { ...story, likedUsers: updatedLikedUsers };
          }
          return story;
        })
      );

      // Gửi request để cập nhật trên server
      const res = await axios.post(
        `${API_URL}/api/posts/${storyId}/like/${userId}`,
        null,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (error) {
      console.error("Lỗi khi thích/bỏ thích story:", error);

      // Hoàn tác các thay đổi nếu có lỗi
      setLikedStories((prev) => ({
        ...prev,
        [storyId]: !prev[storyId],
      }));

      // Hoàn tác thay đổi trong stories
      setStories((prevStories) =>
        prevStories.map((story) => {
          if (story.postId === storyId) {
            let updatedLikedUsers = [...(story.likedUsers || [])];

            // Đảo ngược lại thao tác like/unlike
            if (updatedLikedUsers.includes(Number(userId))) {
              updatedLikedUsers = updatedLikedUsers.filter(
                (id) => id !== Number(userId)
              );
            } else {
              updatedLikedUsers.push(Number(userId));
            }

            return { ...story, likedUsers: updatedLikedUsers };
          }
          return story;
        })
      );
    } finally {
      // Bắt đầu lại timer sau khi hoàn thành
      startStoryTimer();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        storyOptionsRef.current &&
        !storyOptionsRef.current.contains(event.target)
      ) {
        setShowStoryOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const deleteStory = async (storyId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa story này không?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/posts/${storyId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setShowStoryOptions(false);
      // Close story viewer and refresh stories
      closeStoryViewer();
      fetchStories();
    } catch (error) {
      console.error("Lỗi khi xóa story:", error);
      alert("Không thể xóa story. Vui lòng thử lại sau.");
    }
  };

  const updateStoryPrivacy = async (storyId, privacy) => {
    try {
      await axios.put(
        `${API_URL}/api/posts/${storyId}/privacy`,
        { privacy },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update local story state
      setStories((prevStories) =>
        prevStories.map((story) =>
          story.postId === storyId ? { ...story, postPrivacy: privacy } : story
        )
      );

      setShowStoryOptions(false);
      alert(`Đã cập nhật quyền riêng tư thành ${privacy}`);
    } catch (error) {
      console.error("Lỗi khi cập nhật quyền riêng tư:", error);
      alert("Không thể cập nhật quyền riêng tư. Vui lòng thử lại sau.");
    }
  };

  const handleStoryClick = (index) => {
    setCurrentStoryIndex(index);
    setStoryProgress(0);
    setShowStoryViewer(true);
    // Bắt đầu đếm thời gian
    startStoryTimer();
  };

  const startStoryTimer = () => {
    // Clear timer cũ nếu có
    if (autoAdvanceTimer) {
      clearInterval(autoAdvanceTimer);
    }

    // Tạo interval mới - cập nhật progress mỗi 300ms (0.3 giây)
    const timer = setInterval(() => {
      setStoryProgress((prevProgress) => {
        const newProgress = prevProgress + 1;

        // Khi đạt 100%, chuyển sang story tiếp theo
        if (newProgress >= 100) {
          goToNextStory();
          return 0;
        }
        return newProgress;
      });
    }, 300); // 300ms x 100 = 30 seconds

    setAutoAdvanceTimer(timer);
  };

  const goToPreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setStoryProgress(0);
      startStoryTimer();
    } else {
      // Nếu đang ở story đầu tiên, đóng story viewer
      closeStoryViewer();
    }
  };

  // Chuyển sang story tiếp theo
  const goToNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setStoryProgress(0);
      startStoryTimer();
    } else {
      // Nếu đang ở story cuối cùng, đóng story viewer
      closeStoryViewer();
    }
  };

  const closeStoryViewer = () => {
    setShowStoryViewer(false);
    if (autoAdvanceTimer) {
      clearInterval(autoAdvanceTimer);
      setAutoAdvanceTimer(null);
    }
  };

  // Dừng timer khi component unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimer) {
        clearInterval(autoAdvanceTimer);
      }
    };
  }, [autoAdvanceTimer]);

  // Dừng timer khi story viewer đóng
  useEffect(() => {
    if (!showStoryViewer && autoAdvanceTimer) {
      clearInterval(autoAdvanceTimer);
      setAutoAdvanceTimer(null);
    }
  }, [showStoryViewer]);

  // Handle story file change
  const handleStoryFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const maxSize = 10 * 1024 * 1024;
    if (selectedFiles.length > 1) {
      alert("Story chỉ được chọn 1 file.");
      return;
    }
    const validFiles = selectedFiles.filter((file) => file.size <= maxSize);
    if (validFiles.length < selectedFiles.length) {
      alert("File quá lớn, chỉ chọn file dưới 10MB.");
    }
    setStoryFiles(validFiles);

    // Create preview URLs
    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));
    setStoryPreviewUrls(newPreviewUrls);
  };

  // Create story
  const createStory = async () => {
    // Kiểm tra có ít nhất một trong hai: nội dung văn bản hoặc media
    if (storyFiles.length === 0 && !storyContent.trim()) {
      alert("Vui lòng nhập nội dung hoặc chọn ảnh/video cho story");
      return;
    }

    const { hasBannedWords, bannedWordsFound } = containsBannedWords(storyContent);
    if (hasBannedWords) {
      alert(`Story có chứa từ không phù hợp: ${bannedWordsFound.join(', ')}`);
      return;
    }

    setIsSubmittingStory(true);
    let mediaUrls = [];

    const formData = new FormData();
    storyFiles.forEach((file) => formData.append("files", file));

    if (storyFiles.length > 0) {
      const formData = new FormData();
      storyFiles.forEach((file) => formData.append("files", file));

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
        setIsSubmittingStory(false);
        return;
      }
    }
    const storyData = {
      post: {
        userId,
        postPrivacy: storyPrivacy,
        createdAt: new Date().toISOString(),
      },
      content: storyContent,
      mediaUrls,
      story: true,
    };

    try {
      await axios.post(`${API_URL}/api/posts/create`, storyData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("Story created successfully");
      setStoryContent("");
      setStoryFiles([]);
      setStoryPreviewUrls([]);
      setShowStoryModal(false);
      fetchStories();
    } catch (error) {
      alert("Lỗi khi tạo story!");
      console.error("Lỗi khi tạo story:", error);
    } finally {
      setIsSubmittingStory(false);
    }
  };
  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      storyPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [storyPreviewUrls]);

  const fetchCurrentUser = async () => {
    if (userId) {
      try {
        const userDetail = await fetchUserDetail(userId);
        console.log("sdsd", userDetail);
        setCurrentUser(userDetail);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng hiện tại:", error);
      }
    }
  };

  const onEmojiClick = (emojiObject) => {
    setNewContent((prevContent) => prevContent + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const createPost = async () => {
    if (!newContent.trim()) {
      alert("Vui lòng nhập nội dung bài viết");
      return;
    }

    const { hasBannedWords, bannedWordsFound } = containsBannedWords(newContent);
    if (hasBannedWords) {
      alert(`Nội dung có chứa từ không phù hợp: ${bannedWordsFound.join(', ')}`);
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
      fetchPostIds();
      combinePosts();
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
    fetchStories();
  }, [userId]);

  useEffect(() => {
    fetchPostIds();
    combinePosts();
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
        {/* Story section */}
        <div className="stories-container">
          {/* Create story card */}
          <div
            className="story-card create-story"
            onClick={() => setShowStoryModal(true)}
          >
            <div className="story-create-overlay">
              <div className="add-story-icon">
                <FontAwesomeIcon icon={faPlus} />
              </div>
            </div>
            <img
              src={currentUser.avatar || "https://via.placeholder.com/40"}
              alt="Your profile"
              className="story-avatar"
            />
            <div className="story-footer">Tạo story</div>
          </div>
          {/* Stories list */}
          {stories.map((story, index) => (
            <div
              key={story.postId}
              className="story-card"
              onClick={() => handleStoryClick(index)}
            >
              {story.content?.files &&
              story.content.files[0]?.startsWith("http") ? (
                story.content.files[0].includes(".mp4") ? (
                  <video src={story.content.files[0]} className="story-media" />
                ) : (
                  <img
                    src={story.content.files[0]}
                    alt="Story"
                    className="story-media"
                  />
                )
              ) : (
                <div className="story-text-preview">
                  {story.content?.text || ""}
                </div>
              )}
              <div className="story-overlay"></div>
              <img
                src={
                  storyUserDetails[story.userId]?.avatar ||
                  "https://via.placeholder.com/40"
                }
                alt={storyUserDetails[story.userId]?.fullname || "User"}
                className="story-avatar"
              />
              <div className="story-footer">
                {storyUserDetails[story.userId]?.fullname || "User"}
              </div>
            </div>
          ))}
        </div>
        {/* Story creation modal */}
        {showStoryModal && (
          <div className="story-modal-overlay">
            <div className="story-modal">
              <div className="story-modal-header">
                <h3>Tạo story</h3>
                <button
                  className="close-button"
                  onClick={() => setShowStoryModal(false)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="story-modal-body">
                <textarea
                  className="story-textarea"
                  placeholder="Nội dung story (không bắt buộc)"
                  value={storyContent}
                  onChange={(e) => setStoryContent(e.target.value)}
                ></textarea>
                <div className="story-hint">
                  <small>
                    * Bạn có thể đăng story với chỉ nội dung văn bản hoặc
                    ảnh/video
                  </small>
                </div>
                {storyPreviewUrls.length > 0 && (
                  <div className="story-preview-container">
                    {storyPreviewUrls.map((url, index) => {
                      const file = storyFiles[index];
                      const isVideo = file.type.startsWith("video/");
                      return isVideo ? (
                        <video
                          key={index}
                          src={url}
                          className="story-media-preview"
                          controls
                        />
                      ) : (
                        <img
                          key={index}
                          src={url}
                          alt="Story preview"
                          className="story-media-preview"
                        />
                      );
                    })}
                  </div>
                )}
                <div className="story-options">
                  <div className="privacy-selector story-privacy">
                    <div className="privacy-display">
                      {getPrivacyIcon(storyPrivacy)}
                      <span>
                        {storyPrivacy === "PUBLIC"
                          ? "Công khai"
                          : storyPrivacy === "FRIENDS"
                          ? "Bạn bè"
                          : "Riêng tư"}
                      </span>
                      <select
                        className="privacy-select"
                        value={storyPrivacy}
                        onChange={(e) => setStoryPrivacy(e.target.value)}
                      >
                        <option value="PUBLIC">Công khai</option>
                        <option value="FRIENDS">Bạn bè</option>
                        <option value="PRIVATE">Riêng tư</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="story-modal-actions">
                  <label className="file-input-label">
                    <FontAwesomeIcon icon={faImage} className="icon" />
                    <span>Chọn ảnh/video</span>
                    <input
                      className="file-input"
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleStoryFileChange}
                    />
                  </label>

                  <button
                    className={`story-create-button ${
                      isSubmittingStory ? "submitting" : ""
                    }`}
                    onClick={createStory}
                    disabled={isSubmittingStory}
                  >
                    {isSubmittingStory ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      "Đăng story"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Story viewer modal */}
        {showStoryViewer && stories.length > 0 && (
          <div className="story-viewer-overlay" onClick={closeStoryViewer}>
            <div className="story-viewer" onClick={(e) => e.stopPropagation()}>
              {/* Story header */}
              <div className="story-viewer-header">
                <div className="story-user-info">
                  <img
                    src={
                      storyUserDetails[stories[currentStoryIndex].userId]
                        ?.avatar || "https://via.placeholder.com/40"
                    }
                    alt={
                      storyUserDetails[stories[currentStoryIndex].userId]
                        ?.fullname || "User"
                    }
                    className="story-avatar"
                  />
                  <div className="story-user-name">
                    {storyUserDetails[stories[currentStoryIndex].userId]
                      ?.fullname || "User"}
                    <br />
                    <span className="story-time">
                      {(() => {
                        const storyTime = new Date(
                          stories[currentStoryIndex].createdAt
                        );
                        const now = new Date();
                        const diffMs = now - storyTime;
                        const diffMins = Math.floor(diffMs / 60000);
                        const diffHours = Math.floor(diffMins / 60);
                        const diffDays = Math.floor(diffHours / 24);

                        if (diffMins < 1) return "Vừa xong";
                        if (diffMins < 60) return `${diffMins} phút trước`;
                        if (diffHours < 24) return `${diffHours} giờ trước`;
                        return `${diffDays} ngày trước`;
                      })()}
                    </span>
                  </div>
                </div>
                {/* Options menu (only show for user's own stories) */}
                {stories[currentStoryIndex].userId === Number(userId) && (
                  <div
                    className="story-options-container"
                    ref={storyOptionsRef}
                  >
                    <button
                      className="story-options-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowStoryOptions(!showStoryOptions);
                      }}
                    >
                      <FontAwesomeIcon icon={faEllipsisV} />
                    </button>
                    {showStoryOptions && (
                      <div className="story-options-menu">
                        <button
                          onClick={() =>
                            deleteStory(stories[currentStoryIndex].postId)
                          }
                        >
                          <FontAwesomeIcon icon={faTrash} /> Xóa
                        </button>
                        <div className="privacy-options">
                          <div className="privacy-menu-label">
                            Quyền riêng tư:
                          </div>
                          <button
                            onClick={() =>
                              updateStoryPrivacy(
                                stories[currentStoryIndex].postId,
                                "PRIVATE"
                              )
                            }
                            className={
                              stories[currentStoryIndex].postPrivacy ===
                              "PRIVATE"
                                ? "active"
                                : ""
                            }
                          >
                            <FontAwesomeIcon icon={faLock} /> Chỉ mình tôi
                          </button>
                          <button
                            onClick={() =>
                              updateStoryPrivacy(
                                stories[currentStoryIndex].postId,
                                "FRIENDS"
                              )
                            }
                            className={
                              stories[currentStoryIndex].postPrivacy ===
                              "FRIENDS"
                                ? "active"
                                : ""
                            }
                          >
                            <FontAwesomeIcon icon={faUsers} /> Bạn bè
                          </button>
                          <button
                            onClick={() =>
                              updateStoryPrivacy(
                                stories[currentStoryIndex].postId,
                                "PUBLIC"
                              )
                            }
                            className={
                              stories[currentStoryIndex].postPrivacy ===
                              "PUBLIC"
                                ? "active"
                                : ""
                            }
                          >
                            <FontAwesomeIcon icon={faGlobe} /> Công khai
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <button className="close-button" onClick={closeStoryViewer}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              {/* Story progress bar */}
              <div className="story-progress-container">
                <div
                  className="story-progress-bar"
                  style={{ width: `${storyProgress}%` }}
                ></div>
              </div>
              {/* Story content */}
              <div className="story-viewer-content">
                {stories[currentStoryIndex].content?.files &&
                stories[currentStoryIndex].content.files[0]?.startsWith(
                  "http"
                ) ? (
                  stories[currentStoryIndex].content.files[0].includes(
                    ".mp4"
                  ) ? (
                    <video
                      src={stories[currentStoryIndex].content.files[0]}
                      className="story-viewer-media"
                      autoPlay
                      loop
                      muted
                    />
                  ) : (
                    <img
                      src={stories[currentStoryIndex].content.files[0]}
                      alt="Story"
                      className="story-viewer-media"
                    />
                  )
                ) : (
                  <div className="story-viewer-text">
                    {stories[currentStoryIndex].content?.text || ""}
                  </div>
                )}
                {/* Like button và số lượt like */}
                <div className="story-like-section">
                  <button
                    className={`story-like-button ${
                      likedStories[stories[currentStoryIndex].postId]
                        ? "liked"
                        : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      likeStory(stories[currentStoryIndex].postId);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={
                        likedStories[stories[currentStoryIndex].postId]
                          ? faHeart
                          : farHeart
                      }
                      className={
                        likedStories[stories[currentStoryIndex].postId]
                          ? "heart-filled"
                          : "heart-outline"
                      }
                    />
                  </button>
                  <span className="like-count">
                    {(stories[currentStoryIndex].likedUsers?.length || 0) > 0 &&
                      `${
                        stories[currentStoryIndex].likedUsers?.length || 0
                      } lượt thích`}
                  </span>
                </div>

                {/* Navigation buttons */}
                <button
                  className="story-nav-button prev-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPreviousStory();
                  }}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button
                  className="story-nav-button next-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNextStory();
                  }}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            </div>
          </div>
        )}
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

            <div className="emoji-picker-container">
              <button 
                className="emoji-button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <FontAwesomeIcon icon={faSmile} className="icon" />
                <span>Emoji</span>
              </button>
              {showEmojiPicker && (
                <div className="emoji-picker-popup">
                  <EmojiPicker onEmojiClick={onEmojiClick} />
                </div>
              )}
            </div>
            
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
          ) : combinedPosts.length === 0 ? (
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
            <>
              {/* Display mixed posts in timestamp order */}
              <div className="posts-container">
                {loading ? (
                  <div className="loading-container">
                    <FontAwesomeIcon
                      icon={faSpinner}
                      spin
                      className="spinner"
                    />
                    <span>Đang tải bài viết...</span>
                  </div>
                ) : combinedPosts.length === 0 ? (
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
                  <>
                    {/* Display mixed posts in timestamp order */}
                    {combinedPosts.map((post) =>
                      post.type === "regular" ? (
                        <Post
                          key={`post-${post.id}`}
                          postId={post.id}
                          refreshPosts={refreshAfterShare} // Sử dụng hàm mới
                        />
                      ) : (
                        <SharedPostView
                          key={`shared-${post.id}`}
                          sharedPostId={post.id}
                        />
                      )
                    )}
                  </>
                )}
              </div>
            </>
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
