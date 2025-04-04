import axios from "axios";

const USER_DETAIL_API_URL = process.env.REACT_APP_USER_DETAIL_API_URL;
const token = localStorage.getItem("token");

export async function fetchUserDetail(userId) {
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

export async function updateUserDetail(id, userDetail) {
  try {
    const response = await axios.put(
      `${USER_DETAIL_API_URL}/update/${id}`,
      userDetail,
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
