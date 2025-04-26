import axios from "axios";

const USER_API = process.env.REACT_APP_USER_API_URL;
const USER_DETAIL_API_URL = process.env.REACT_APP_USER_DETAIL_API_URL;
const USER_STATUS_API_URL = process.env.REACT_APP_USER_STATUS_API_URL;

export async function fetchUser(userId) {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${USER_API}/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch User: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error fetch user", error);
  }
}
export async function fetchUserDetail(userId) {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.get(`${USER_DETAIL_API_URL}/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (err) {
    console.log(err);
    throw new Error(`Error fetch user detail: ${err.message}`);
  }
}
export async function updateUserDetail(id, data) {
  const token = localStorage.getItem("token");
  console.log(token);

  try {
    const response = await axios.put(
      `${USER_DETAIL_API_URL}/update/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Friend response data:", response.data);
    return response.data;
  } catch (err) {
    console.log(err);
    throw new Error("Error update UserDetail api: ", err.message);
  }
}
export async function setUserStatus(id, status) {
  const token = localStorage.getItem("token");

  console.log(USER_STATUS_API_URL);
  console.log("token setStatus:", token);

  try {
    const response = await axios.put(
      `${USER_STATUS_API_URL}/${id}`,
      {
        status: status,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (err) {
    console.log(err);
    throw new Error("Error set UserStatus: ", err);
  }
}
export async function uploadAvatar(id, formData) {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${USER_DETAIL_API_URL}/upload-avatar/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    console.log(err);
    throw new Error("Error upload Avatar: ", err.message);
  }
}
export async function getListUserDetailByValue(value) {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `${USER_DETAIL_API_URL}/search?value=${value}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response) {
      console.log("search results: ", response.data);
      return response.data;
    }
  } catch (err) {
    throw new Error("Error fetch search Results: ", err);
  }
}
