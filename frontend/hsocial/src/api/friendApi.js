import axios from "axios";

const FRIEND_API = process.env.REACT_APP_USER_FRIEND_API_URL;

export async function getListFriend(id) {
  const token = localStorage.getItem("token");

  console.log(FRIEND_API);
  try {
    const response = await axios.get(`${FRIEND_API}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.data) {
      console.log("ko fetch dc friends");
      return [];
    }
    console.log(response.data);
    return response.data.friends;
  } catch (err) {
    if (err.response) {
      console.log("Lỗi  server:", err.response.status, err.response.data);
    } else {
      console.log("Lỗi không phản hồi:", err.message);
    }
    return [];
  }
}
