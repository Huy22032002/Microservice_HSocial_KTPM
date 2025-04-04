import styles from "../styles/Chat.module.css";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faIcons,
  faImage,
  faInfo,
  faPaperPlane,
  faSearch,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { faLock } from "@fortawesome/free-solid-svg-icons/faLock";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  fetchUser,
  fetchConversations,
  fetchMessages,
  postMessage,
} from "../api/chatApi";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  //lay userId tu Redux
  const userId = useSelector((state) => state.user.userId);
  const token = localStorage.getItem("token");

  //luu danh sach conversations
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);

  // const fetchMessages = async (id) => {
  //   try {
  //     const response = await axios.get(
  //       `http://localhost:8082/api/messages/${id}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );
  //     console.log("fetch All Messages data: ", response.data);
  //     setMessages(response.data);
  //   } catch (error) {
  //     console.log(`error fetch messages: ${error}`);
  //   }
  // };

  async function handlePostMessage(message) {
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
      const data = await postMessage(
        message,
        currentConversationId,
        conversations,
        userId
      );
      console.log("Message saved successfully:", data);
    } catch (e) {
      console.log(`Error save message ${e}`);
    }
  }

  useEffect(() => {
    if (!userId) return;

    async function fetchData() {
      const data = await fetchUser(userId);
      if (data) setUser(data);
      const lstConvers = await fetchConversations(userId);
      if (lstConvers) setConversations(lstConvers);
    }
    fetchData();

    const ws = new WebSocket("ws://localhost:8082/chat");

    ws.onopen = () => {
      console.log("Connected WebSocket");
    };

    ws.onmessage = (event) => {
      console.log("Received Raw message:", event.data);
      try {
        const messageObj = JSON.parse(event.data); // chuyen JSON String thanh Object

        if (!messageObj || !messageObj.sender) {
          console.warn("Invalid message format: ", messageObj);
          return;
        }
        setMessages((prev) => [...prev, messageObj]);
      } catch (error) {
        console.log("error:", error);
      }
    };

    ws.onclose = () => {
      console.log("Disconneced WebSocket");
    };
    ws.onerror = (error) => {
      console.log(`WebSocket error: ${error}`);
    };

    setSocket(ws);

    return () => {
      ws.close(); //dong ket noi khi unmount
    };
  }, [userId]);

  const sendMessageToSocket = async () => {
    if (message.trim() !== "" && socket && user) {
      const messageData = {
        sender: userId,
        content: message,
      };
      try {
        socket.send(JSON.stringify(messageData));
        await handlePostMessage(message);
        setMessage("");
      } catch (error) {
        console.log("Error sending message:", error);
      }
    } else {
    }
  };

  //neu user offline(socket == null) thi gui qua message queue
  const sendMessageToQueue = async () => {
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
      "http://localhost:8082/api/messages/send",
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
  };

  const handleSend = () => {
    if (socket) {
      sendMessageToSocket();
    } else {
      sendMessageToQueue();
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.listChat}>
        <div className={styles.headerListChat}>
          <h1>Đoạn Chat</h1>
          <button
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "40px",
              backgroundColor: "white",
              border: "none",
            }}
          >
            <FontAwesomeIcon icon={faLock} />
          </button>
        </div>

        <div className={styles.filterListChat}>
          <FontAwesomeIcon
            icon={faSearch}
            style={{ color: "rgba(255, 255, 255,0.8)" }}
          />
          <input
            type="text"
            placeholder="Tìm kiếm bạn bè hoặc ai đó..."
            style={{
              width: "80%",
              background: "none",
              color: "rgba(255, 255, 255)",
              outline: "none",
              border: "none",
              margin: "0 6px",
            }}
          />
        </div>

        <div className={styles.containerBtnList}>
          <button className={styles.btnFilter}>Hộp thoại</button>
          <button className={styles.btnFilter}>Đang chờ</button>
        </div>

        <div className={styles.mainListChat}>
          {conversations.map((conver, index) => (
            <div
              onClick={async () => {
                const messages = await fetchMessages(conver.id);
                setMessages(messages);
                setCurrentConversationId(conver.id);
              }}
              key={index}
              className={styles.lstCon}
            >
              <img
                src="https://imgur.com/kEcv3Jx.png"
                className={styles.avatar}
                alt="avatar"
              />
              <div className={styles.conversation}>
                <p className={styles.userName}>
                  <b>User {conver.participants}</b>
                </p>
                <div className={styles.messageContainer}>
                  <p className={styles.messageContent}>
                    {conver.lastMessage?.content || "No messages"}
                  </p>
                  <p>---</p>
                  <p className={styles.timestamp}>
                    {conver.lastMessage?.timestamp || ""}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.chatBox}>
        <div className={styles.chatBoxHeader}>
          <div className={styles.imgChatBoxHeader}>
            <img
              src={user?.avatar || "https://imgur.com/kEcv3Jx.png"}
              alt="avatar user"
              style={{ width: "40px", height: "40px" }}
            />
          </div>
          <div className={styles.userInfoChatBoxHeader}>
            <h4 style={{ color: "white", fontSize: 22, margin: 0, padding: 0 }}>
              {conversations
                .find((conver) => conver.id === currentConversationId)
                ?.participants.filter((p) => p !== userId)?.[0] ||
                "Receiver Name"}
            </h4>
            <p
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: 14,
                margin: 0,
                padding: 0,
              }}
            >
              Hoạt động 10 phút trước
            </p>
          </div>
          <button className={styles.btnUserInfo}>
            <FontAwesomeIcon icon={faInfo} />
          </button>
        </div>
        <div className={styles.chatBoxContent}>
          {messages.map((msg, index) => {
            const isMyMessage = msg.sender == userId;
            console.log(
              `msg.sender: ${msg.sender} && userRedux: ${userId} && ${
                msg.sender == user.id
              }`
            );

            return (
              <div
                key={index}
                className={isMyMessage ? styles.myMessage : styles.otherMessage}
              >
                <strong>
                  {isMyMessage ? "Bạn" : `User ${msg.sender || "Unknown"}`}:
                </strong>{" "}
                {msg.content}
              </div>
            );
          })}
        </div>
        <div className={styles.chatBoxFooter}>
          <button className={styles.btnTypeMessage}>
            <FontAwesomeIcon icon={faImage} style={{ fontSize: 20 }} />
          </button>
          <button className={styles.btnTypeMessage}>
            <FontAwesomeIcon icon={faIcons} style={{ fontSize: 20 }} />
          </button>
          <input
            type="text"
            onChange={(event) => {
              setMessage(event.target.value);
            }}
            placeholder="Aa"
            className={styles.inputSearch}
          />

          <button
            className={styles.btnSendMessage}
            onClick={handleSend}
            tabIndex={0}
            autoFocus
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>
      <div className={styles.chatInformation}>
        <img src={user?.avatar} alt="avatar user" />
        <h3 style={{ color: "white" }}> {user?.username} </h3>
        <p style={{ color: "gray", fontSize: 14, marginTop: "-15px" }}>
          Hoat dong 25 phut truoc
        </p>
        <div className={styles.btnContainerChatInformation}>
          <div className={styles.containerBtnInfo}>
            <button>
              <FontAwesomeIcon icon={faUser} />
            </button>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: 14,
                marginTop: "5px",
              }}
            >
              Trang ca nhan
            </p>
          </div>
          <div>
            <button>
              <FontAwesomeIcon icon={faBell} />
            </button>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: 14,
                marginTop: "5px",
              }}
            >
              Thong bao
            </p>
          </div>
          <div>
            <button>
              <FontAwesomeIcon icon={faSearch} />
            </button>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: 14,
                marginTop: "5px",
              }}
            >
              Tim kiem
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
