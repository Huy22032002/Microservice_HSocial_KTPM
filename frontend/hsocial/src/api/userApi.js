import axios from "axios";

const USER_DETAIL_API_URL = process.env.REACT_APP_USER_DETAIL_API_URL;
const USER_STATUS_API_URL = process.env.REACT_APP_USER_STATUS_API_URL;

export async function fetchUserDetail(userId) {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.get(`${USER_DETAIL_API_URL}/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (err) {
    console.log(err);
    return null;
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
    return null;
  }
}
export async function setUserStatus(id, status) {
  const token = localStorage.getItem("token");

  console.log(USER_STATUS_API_URL);
  console.log("token setStatus:", token);

  try {
    const response = await axios.post(
      `${USER_STATUS_API_URL}/${id}?status=${status}`,
      {}, // body trống
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
    return null;
  }
}
