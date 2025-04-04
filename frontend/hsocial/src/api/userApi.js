import axios from "axios";

const USER_DETAIL_API_URL = process.env.REACT_APP_USER_DETAIL_API_URL;
const token = localStorage.getItem("token");

export async function fetchUserDetail(userId) {
  console.log(USER_DETAIL_API_URL);
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
