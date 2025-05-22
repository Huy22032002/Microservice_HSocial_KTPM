import axios from "axios";

const NOTI_API_URL = process.env.REACT_APP_NOTI_API_URL;

/**
 * Fetches all notifications for a specific user
 * @param {number} userId - The ID of the user to fetch notifications for
 * @returns {Promise<Array>} - Array of notification objects
 */
export const fetchNotifications = async (userId) => {
  try {
    const token = localStorage.getItem("token");
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

/**
 * Marks all notifications as read for a specific user
 * @param {number} userId - The ID of the user to mark notifications as read
 * @returns {Promise<Object>} - Response from the API
 */
export const setAllNotiStatus = async (userId) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(`${NOTI_API_URL}/read_all/${userId}`, null, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    throw error;
  }
};

/**
 * Marks a specific notification as read
 * @param {number} notificationId - The ID of the notification to mark as read
 * @returns {Promise<Object>} - Response from the API
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${NOTI_API_URL}/read/${notificationId}`,
      null,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};
export const deleteNotification = async (notificationId) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.delete(`${NOTI_API_URL}/${notificationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};
