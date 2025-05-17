import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;
const token = localStorage.getItem("token");

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

// const header = {
//   Authorization: `Bearer ${token}`,
// };

export const fetchUserById = async (userId) => {
  const res = await axios.get(`${API_URL}/api/users/${userId}`, { headers });
  return res.data;
};

export const fetchPostById = async (postId) => {
  const res = await axios.get(`${API_URL}/api/posts/${postId}`, {
    // headers
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.data;
};

export const fetchFriendsByUserId = async (userId) => {
  const res = await axios.get(`${API_URL}/api/users/friends/${userId}`, {
    headers,
  });
  return res.data;
};

export const fetchPostsList = async (userId, friendIds) => {
  const res = await axios.post(
    `${API_URL}/api/posts/listPost`,
    { userId: Number(userId), friendIds },
    { headers }
  );
  return res.data;
};

// export const fetchUserPosts = async (userId) => {
//   const res = await axios.get(`${API_URL}/posts/userPosts/${userId}`, {
//     headers,
//   });
//   return res.data;
// };

export const uploadFilesToS3 = async (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const res = await axios.post(`${API_URL}/api/posts/s3upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const createNewPost = async (postData) => {
  const res = await axios.post(`${API_URL}/api/posts/create`, postData, {
    headers,
  });
  return res.data;
};

export const likePostByUser = async (postId, userId) => {
  const res = await axios.post(
    `${API_URL}/api/posts/${postId}/like/${userId}`,
    null,
    { headers }
  );
  return res.data;
};

export const commentOnPost = async (postId, userId, comment) => {
  const res = await axios.post(
    `${API_URL}/api/posts/${postId}/comment`,
    { userId, comment },
    { headers }
  );
  return res.data;
};
