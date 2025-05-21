import styles from "../styles/Chat.module.css";
import { useState, useEffect, useRef } from "react";
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
import { fetchConversations, fetchMessages, postMessage } from "../api/chatApi";
import { fetchUserDetail, fetchUser } from "../api/userApi";
import Header from "../components/header";
import moment from "moment/moment";

export default function Chat() {
  const navigate = useNavigate();

  //socket
  const [socket, setSocket] = useState(null);

  //message
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  //luu danh sach conversations
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentConversationName, setCurrentConversationName] = useState(""); //luu ten conversation hien tai
  const currentConversationIdRef = useRef(null);

  //lay userId tu Redux
  const userId = useSelector((state) => state.user.userId);
  //user
  const [user, setUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);

  const [otherUserId, setOtherUserId] = useState(null);
  const [otherUserDetail, setOtherUserDetail] = useState(null);

  //fetch user detail
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

  //save message
  async function handlePostMessage(message) {
    try {
      const data = await postMessage(
        message,
        currentConversationId,
        conversations,
        userId
      );
      console.log(
        "Message saved successfully in method handlePostMessage:",
        data
      );
      return data;
    } catch (e) {
      console.log(`Error save message in method handlePostMessage: ${e}`);
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

        if (!messageObj) {
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
    if (message.trim() !== "" && socket && user) {
      try {
        const data = await handlePostMessage(message);
        socket.send(JSON.stringify(data.message));
        setMessage("");
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }
  };

  const handleSend = () => {
    if (socket) {
      sendMessageToSocket();
    } else {
      alert("Socket chưa kết nối");
      return;
    }
  };

  //format lại thời gian
  const formatTimestamp = (timestamp) => {
    return moment(timestamp).format("DD/MM/YYYY HH:mm");
  };
  //lấy receiverId trong participants
  const getReceiverId = (conversation) => {
    if (conversation.type === "SINGLE") {
      const receiver = conversation.participants.filter((id) => id != userId);
      setOtherUserId(receiver[0]);
      return receiver[0];
    }
  };
  //fetch OtherUserDetail
  const fetchOtherUserDetail = async (receiverId) => {
    try {
      const data = await fetchUserDetail(receiverId);
      setOtherUserDetail(data);
      console.log("Other User Detail: ", data);
    } catch (err) {
      console.log(err);
      alert("Failed to fetch Other User Detail", err);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
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

                  setOtherUserDetail(null);
                  const receiverID = getReceiverId(conver);
                  console.log("receiver id: ", receiverID);

                  await fetchOtherUserDetail(receiverID);
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
                    <p>
                      {conver.lastMessage?.content || "No messages"} -{" "}
                      {conver.lastMessage?.timestamp
                        ? formatTimestamp(conver.lastMessage.timestamp)
                        : ""}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {currentConversationId ? (
          <>
            {" "}
            {/* center container     */}
            <div className={styles.chatBox}>
              <div>
                <button
                  className={styles.chatBoxHeader}
                  onClick={() => navigate(`/anotherUserProfile/${otherUserId}`)}
                >
                  <div className={styles.imgChatBoxHeader}>
                    <img
                      src={user?.avatar || "https://imgur.com/kEcv3Jx.png"}
                      alt="avatar user"
                      style={{ width: "40px", height: "40px" }}
                    />
                  </div>
                  <div className={styles.userInfoChatBoxHeader}>
                    <h4
                      style={{
                        color: "black",
                        fontSize: 20,
                        margin: 0,
                        padding: 0,
                      }}
                    >
                      {currentConversationName || "Receiver Name"}
                    </h4>
                    <p
                      style={{
                        color: "rgba(105, 105, 105, 0.75)",
                        fontSize: 14,
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
                  const isMyMessage =
                    msg.sender.toString() === userId.toString();
                  return (
                    <div
                      key={index}
                      className={
                        isMyMessage ? styles.myMessage : styles.otherMessage
                      }
                    >
                      <strong>
                        <img
                          src={
                            isMyMessage
                              ? msg.avatar ||
                                require("../assets/default_avatar.png")
                              : msg.avatar ||
                                require("../assets/default_avatar.png")
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
                  value={message}
                  onChange={(event) => {
                    setMessage(event.target.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSend();
                    }
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
                src={
                  otherUserDetail?.avatar ||
                  require("../assets/default_avatar.png")
                }
                alt="other user avatar"
                style={{ width: 80, height: 80, borderRadius: 150 }}
              />
              <p style={{ color: "black", fontSize: 24, marginTop: "4px" }}>
                {otherUserDetail?.fullname || "Tên người dùng"}
              </p>
              <p style={{ color: "gray", fontSize: 16, marginTop: "-16px" }}>
                hoạt động
              </p>
              <div className={styles.btnContainerChatInformation}>
                <div className={styles.containerBtnInfo}>
                  <button
                    onClick={() => {
                      console.log(
                        "sự kiện click trang cá nhân other user: ",
                        otherUserId
                      );

                      navigate(`/anotherUserProfile/${otherUserId}`);
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
          </>
        ) : (
          <p>Vui lòng chọn 1 cuộc hội thoại</p>
        )}
      </div>
    </div>
  );
}
