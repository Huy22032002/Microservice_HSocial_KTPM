import styles from "../styles/Chat.module.css";
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faIcons,
  faImage,
  faPaperPlane,
  faSearch,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { faLock } from "@fortawesome/free-solid-svg-icons/faLock";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { fetchConversations, fetchMessages, postMessage } from "../api/chatApi";
import { fetchUserDetail, fetchUser } from "../api/userApi";

export default function Chat() {
  const navigate = useNavigate();

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

  //luu ten conversation hien tai
  const [currentConversationName, setCurrentConversationName] = useState("");

  //fetch user detail
  const [userDetail, setUserDetail] = useState(null);
  const getUserDetail = async () => {
    try {
      const data = await fetchUserDetail(userId);
      if (!data) return;
      setUserDetail(data);
      console.log("User Detail: ", data);
    } catch (err) {
      console.log(err);
      alert("Failed to fetch User Detail", err);
    }
  };

  const currentConversationIdRef = useRef(null);

  async function handlePostMessage(message) {
    try {
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
    currentConversationIdRef.current = currentConversationId;

    if (!userId) return;

    async function fetchData() {
      const data = await fetchUser(userId);
      if (data) setUser(data);
      const lstConvers = await fetchConversations(userId);
      if (lstConvers) setConversations(lstConvers);
      getUserDetail();
    }
    fetchData();

    const ws = new WebSocket(`ws://localhost:8082/chat?userId=${userId}`);
    ws.onopen = () => {
      console.log("Connected WebSocket");
    };
    //nhan message realtime tu server, luu vao setMessages
    ws.onmessage = (event) => {
      console.log("Received Raw message:", event.data);
      try {
        const messageObj = JSON.parse(event.data); // chuyen JSON String thanh Object

        if (!messageObj || !messageObj.sender || !messageObj.receiver) {
          console.warn("Invalid message format: ", messageObj);
          return;
        }
        // Nếu là tin nhắn của cuộc trò chuyện hiện tại thì thêm vào danh sách
        if (messageObj.conversationId === currentConversationIdRef.current) {
          setMessages((prev) => [...prev, messageObj]);
        }
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
  }, [currentConversationId]);

  const sendMessageToSocket = async () => {
    const currentConversation = conversations.find(
      (conv) => conv.id === currentConversationId
    );
    if (!currentConversation) return;

    const receiverId = currentConversation.participants.find(
      (id) => id.toString() !== userId.toString()
    );
    console.log("Current userId:", userId);
    console.log("Resolved receiverId:", receiverId);

    if (message.trim() !== "" && socket && user) {
      const messageData = {
        sender: userId,
        receiver: receiverId,
        content: message,
        conversationId: currentConversationId,
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
      {/* left container */}
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
          <FontAwesomeIcon icon={faSearch} style={{ color: "#65686C" }} />
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
                setCurrentConversationName(conver.name);
              }}
              key={index}
              className={styles.lstCon}
            >
              <img
                src={conver.avatar || require("../assets/default_avatar.png")}
                className={styles.avatar}
                alt="avatar"
              />
              <div className={styles.conversation}>
                <p className={styles.userName}>
                  <b>{conver.name}</b>
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
      {/* center container     */}
      <div className={styles.chatBox}>
        <div>
          <button className={styles.chatBoxHeader}>
            <div className={styles.imgChatBoxHeader}>
              <img
                src={user?.avatar || "https://imgur.com/kEcv3Jx.png"}
                alt="avatar user"
                style={{ width: "40px", height: "40px" }}
              />
            </div>
            <div className={styles.userInfoChatBoxHeader}>
              <h4
                style={{ color: "black", fontSize: 22, margin: 0, padding: 0 }}
              >
                {currentConversationName || "Receiver Name"}
              </h4>
              <p
                style={{
                  color: "rgba(105, 105, 105, 0.75)",
                  fontSize: 15,
                  margin: 0,
                  padding: 0,
                }}
              >
                Hoạt động 10 phút trước
              </p>
            </div>
          </button>
        </div>
        <div className={styles.chatBoxContent}>
          {messages.map((msg, index) => {
            const isMyMessage = msg.sender.toString() === userId.toString();
            return (
              <div
                key={index}
                className={isMyMessage ? styles.myMessage : styles.otherMessage}
              >
                <strong>
                  <img
                    src={
                      isMyMessage
                        ? msg.avatar || require("../assets/default_avatar.png")
                        : msg.avatar || require("../assets/default_avatar.png")
                    }
                    alt="avatar"
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginRight: "6px",
                      verticalAlign: "middle",
                    }}
                  />
                </strong>
                {msg.content}
              </div>
            );
          })}
        </div>
        <div className={styles.chatBoxFooter}>
          <button className={styles.btnTypeMessage}>
            <FontAwesomeIcon icon={faImage} />
          </button>
          <button className={styles.btnTypeMessage}>
            <FontAwesomeIcon icon={faIcons} />
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
      {/* right container */}
      <div className={styles.chatInformation}>
        <img
          src={userDetail?.avatar}
          alt="avatar user"
          style={{ width: 150, height: 150, borderRadius: 150 }}
        />
        <h3 style={{ color: "white" }}> {user?.username} </h3>
        <p style={{ color: "white", fontSize: 24, marginTop: "-12px" }}>
          {userDetail?.fullname || "Ten User"}
        </p>
        <div className={styles.btnContainerChatInformation}>
          <div className={styles.containerBtnInfo}>
            <button
              onClick={() => {
                navigate("/profile");
              }}
              className={styles.btnChatInfo}
            >
              <FontAwesomeIcon icon={faUser} />
            </button>
            <p
              style={{
                color: "#000000",
                fontSize: 14,
                marginTop: "5px",
              }}
            >
              Trang cá nhân
            </p>
          </div>
          <div className={styles.containerBtnInfo}>
            <button className={styles.btnChatInfo}>
              <FontAwesomeIcon icon={faSearch} />
            </button>
            <p
              style={{
                color: "#000",
                fontSize: 14,
                marginTop: "5px",
              }}
            >
              Tìm kiếm
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
