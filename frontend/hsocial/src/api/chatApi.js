import axios from "axios";
import { fetchUserDetail } from "../api/userApi";
//lay userId tu Redux

const USER_API = process.env.REACT_APP_USER_API_URL;
const CONVER_API = process.env.REACT_APP_CONVER_API_URL;
const MESSAGE_API = process.env.REACT_APP_MESSAGE_API_URL;

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
    console.log(data);
    return data;
  } catch (error) {
    console.log("Error fetch user", error);
  }
}
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
    return data;
  } catch (error) {
    console.log(error);
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
    console.log(`error fetch messages: ${error}`);
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
      (id) => id !== userId
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
  } catch (e) {
    console.log(`Error save message ${e}`);
  }
}
