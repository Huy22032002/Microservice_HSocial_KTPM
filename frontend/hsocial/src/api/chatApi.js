import axios from "axios";
import { fetchUserDetail } from "../api/userApi";

const CONVER_API = process.env.REACT_APP_CONVER_API_URL;
const MESSAGE_API = process.env.REACT_APP_MESSAGE_API_URL;

export async function fetchConversations(userId) {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${CONVER_API}/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = response.data;
    console.log("data fetching conversations: ", data);

    if (Array.isArray(data)) {
      const sorted = data.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      return sorted;
    }
    console.warn("API trả về object lỗi:", data);
    return [];
  } catch (error) {
    if (error.response && error.response.status === 429) {
      alert("Bạn đang tải quá nhiều tin nhắn. Vui lòng chờ rồi thử lại.");
    } else {
      console.error(`Lỗi khi tải tin nhắn: ${error}`);
    }
    return [];
  }
}
export const fetchMessages = async (id) => {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.get(`${MESSAGE_API}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const messages = response.data;

    //fetch user avatar voi moi message
    // goi song song tat ca cac fetchUserDetail
    const avatarPromises = messages.map((message) =>
      fetchUserDetail(message.sender)
    );
    const userDetails = await Promise.all(avatarPromises);
    messages.forEach((msg, i) => {
      msg.avatar = userDetails[i].avatar;
    });

    return messages;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      alert("Bạn đang tải quá nhiều tin nhắn. Vui lòng chờ rồi thử lại.");
    } else {
      console.error(`Lỗi khi tải tin nhắn: ${error}`);
    }
    return [];
  }
};
export async function postMessage(
  message,
  currentConversationId,
  conversations,
  userId
) {
  const token = localStorage.getItem("token");

  try {
    if (!currentConversationId) {
      console.log("No conversation selected");
      return;
    }
    // Lấy cuộc trò chuyện hiện tại
    const currentConversation = conversations.find(
      (conv) => conv.id === currentConversationId
    );
    if (!currentConversation) {
      console.log("Conversation not found");
      return;
    }
    // Lọc danh sách người nhận, loại bỏ chính mình
    const receivers = currentConversation.participants.filter(
      (id) => id != userId
    );

    const response = await axios.post(
      `${MESSAGE_API}/save-message`,
      {
        conversationId: currentConversationId,
        sender: userId,
        receivers: receivers,
        type: "CHAT",
        content: message,
        status: "ACTIVE",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      // Lỗi vượt quá rate limit
      throw new Error(
        "Bạn đã gửi quá nhiều yêu cầu, vui lòng chờ một chút rồi thử lại."
      );
    }
    throw error;
  }
}
export async function checkOrCreate(user1, user2) {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${CONVER_API}/checkOrCreate?user1=${user1}&user2=${user2}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (er) {
    console.error("Check or create error:", er);
    throw er;
  }
}
