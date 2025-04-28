import axios from "axios";

const NOTI_API_URL = process.env.REACT_APP_NOTI_API_URL;
const token = localStorage.getItem("token");

export const fetchNotifications = async (userId) => {
  try {
    const res = await axios.get(`${NOTI_API_URL}/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const setAllNotiStatus = async (userId) => {
  try {
    const res = await axios.post(`${NOTI_API_URL}/read_all/${userId}`, null, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error setting read status:", error);
    throw error;
  }
};
