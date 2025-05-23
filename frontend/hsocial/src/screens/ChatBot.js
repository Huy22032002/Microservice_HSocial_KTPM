import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Avatar,
  IconButton,
  Stack,
  Grid,
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";
import {
  Send as SendIcon,
  Person as PersonIcon,
  QuestionAnswer as QuestionIcon,
  Home as HomeIcon,
  Language,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const GEMINI_API_KEY =
  process.env.REACT_APP_GEMINI_API_KEY ||
  "AIzaSyCpMl_mk29YqWOvBhusgF_8l9z7e0ctwhI"; // <-- THAY KEY CỦA BẠN VÀO ĐÂY
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Danh sách câu hỏi có sẵn
const PREDEFINED_QUESTIONS = [
  {
    id: 1,
    question: "Làm thế nào để đăng bài viết mới?",
    icon: "📝",
  },
  {
    id: 2,
    question: "Cách thay đổi ảnh đại diện hoặc ảnh bìa?",
    icon: "🖼️",
  },
  {
    id: 3,
    question: "Cách tìm và kết bạn với người dùng khác?",
    icon: "👥",
  },
  {
    id: 4,
    question: "Làm thế nào để tạo và xem Stories?",
    icon: "📱",
  },
  {
    id: 5,
    question: "Các tùy chọn quyền riêng tư có sẵn?",
    icon: "🔒",
  },
  {
    id: 6,
    question: "Cách nhắn tin với bạn bè?",
    icon: "💬",
  },
];
moment.locale("vi");

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      language: "vi",
      content:
        "Chào bạn! Tôi là HBot - trợ lý AI của mạng xã hội HSocial. Bạn có thể chọn một câu hỏi bên dưới hoặc đặt câu hỏi riêng.",
    },
  ]);
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showQuestionsPanel, setShowQuestionsPanel] = useState(true);

  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống tin nhắn cuối cùng
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cập nhật hàm handleSend

  const goToHome = () => {
    navigate("/home");
  };

  const handleSend = async (questionText = input) => {
    if (!questionText.trim()) return;

    // Thêm tin nhắn của người dùng vào cuộc trò chuyện
    const userMessage = { role: "user", content: questionText };
    setMessages((prev) => [...prev, userMessage]);

    // Nếu là câu hỏi từ input, xóa trường nhập liệu
    if (questionText === input) {
      setInput("");
    }

    // Ẩn bảng câu hỏi sau khi người dùng đã chọn hoặc nhập câu hỏi
    setShowQuestionsPanel(false);

    setLoading(true);
    setError(null);

    // Kiểm tra xem có câu trả lời mẫu hay không
    if (PREDEFINED_ANSWERS[questionText]) {
      // Sử dụng câu trả lời mẫu
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: PREDEFINED_ANSWERS[questionText],
          },
        ]);
        setLoading(false);
      }, 500); // Thêm độ trễ nhỏ để tạo cảm giác tự nhiên

      return;
    }

    // Nếu không có câu trả lời mẫu, gọi API như bình thường
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              role: "user",
              parts: [{ text: questionText }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }
      );

      // Trích xuất nội dung phản hồi từ Gemini API
      let aiResponse = "Xin lỗi, tôi không thể tạo phản hồi.";
      if (
        response.data &&
        response.data.candidates &&
        response.data.candidates.length > 0 &&
        response.data.candidates[0].content &&
        response.data.candidates[0].content.parts &&
        response.data.candidates[0].content.parts.length > 0
      ) {
        aiResponse = response.data.candidates[0].content.parts[0].text;
      }

      // Thêm phản hồi của AI vào cuộc trò chuyện
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiResponse },
      ]);
    } catch (err) {
      console.error(
        "Lỗi khi gọi Gemini API:",
        err.response ? err.response.data : err.message
      );
      setError("Không thể nhận phản hồi từ AI. Vui lòng thử lại sau.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Đã xảy ra lỗi khi kết nối với AI. Vui lòng thử lại.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Thêm đoạn này sau danh sách PREDEFINED_QUESTIONS

  // Danh sách câu trả lời mẫu cho các câu hỏi có sẵn
  const PREDEFINED_ANSWERS = {
    "Làm thế nào để đăng bài viết mới?":
      "Để đăng bài viết mới trên HSocial, bạn làm theo các bước sau:\n\n" +
      "1️⃣ Truy cập vào trang chủ (Home) của HSocial\n\n" +
      '2️⃣ Tìm ô nhập liệu có ghi "Bạn đang nghĩ gì?" ở đầu trang\n\n' +
      "3️⃣ Nhấp vào ô đó và nhập nội dung bài viết\n\n" +
      "4️⃣ Nếu muốn thêm hình ảnh, nhấn vào biểu tượng hình ảnh và chọn ảnh từ thiết bị của bạn\n\n" +
      "5️⃣ Chọn quyền riêng tư cho bài đăng từ menu thả xuống (PUBLIC - Công khai, FRIENDS - Bạn bè, PRIVATE - Chỉ mình tôi)\n\n" +
      '6️⃣ Nhấn nút "Đăng" để chia sẻ bài viết\n\n' +
      "Bài viết của bạn sẽ xuất hiện trên trang cá nhân và có thể xuất hiện trong bảng tin của bạn bè tùy thuộc vào cài đặt quyền riêng tư.",

    "Cách thay đổi ảnh đại diện hoặc ảnh bìa?":
      "Để thay đổi ảnh đại diện hoặc ảnh bìa trên HSocial:\n\n" +
      "📸 *Thay đổi ảnh đại diện:*\n" +
      "1. Truy cập vào trang cá nhân của bạn bằng cách nhấp vào PROFILE trên thanh điều hướng\n" +
      "2. Chọn nút cập nhật\n" +
      '3. Chọn "Cập nhật ảnh đại diện"\n' +
      "4. Chọn ảnh mới từ thiết bị của bạn\n" +
      "5. Điều chỉnh vùng hiển thị nếu cần\n" +
      '6. Nhấn "Lưu thay đổi"\n\n' +
      "Lưu ý: Ảnh đại diện nên có kích thước vuông để hiển thị đẹp nhất.",

    "Cách tìm và kết bạn với người dùng khác?":
      "Để tìm và kết bạn với người dùng khác trên HSocial:\n\n" +
      "🔍 *Tìm kiếm người dùng:*\n" +
      "1. Nhấp vào thanh tìm kiếm ở đầu trang\n" +
      "2. Nhập tên người dùng bạn muốn tìm\n" +
      "3. HSocial sẽ hiển thị kết quả phù hợp\n\n" +
      "➕ *Gửi lời mời kết bạn:*\n" +
      "1. Truy cập vào trang cá nhân của người dùng bạn muốn kết bạn\n" +
      '2. Nhấn nút "Thêm bạn bè" \n' +
      "3. Người dùng kia sẽ nhận được thông báo về lời mời kết bạn của bạn\n\n" +
      "✅ *Chấp nhận lời mời kết bạn:*\n" +
      '1. Kiểm tra thông báo của bạn (biểu tượng chuông) hoặc mục "Lời mời kết bạn" trong phần Bạn bè\n' +
      '2. Nhấp vào "Chấp nhận" để trở thành bạn bè\n\n' +
      "Sau khi kết bạn, bạn có thể nhìn thấy bài viết của nhau (tùy thuộc vào cài đặt quyền riêng tư) và có thể nhắn tin trực tiếp.",

    "Làm thế nào để tạo và xem Stories?":
      "Stories là tính năng chia sẻ nội dung ngắn tồn tại trong 24 giờ trên HSocial:\n\n" +
      "📱 *Cách tạo Stories:*\n" +
      '1. Trên trang chủ, nhấp vào biểu tượng "+" trên avatar của bạn ở đầu trang\n' +
      "2. Chọn ảnh hoặc viết nội dung bạn muốn chia sẻ\n" +
      "3. Tùy chỉnh bằng cách thêm văn bản, sticker hoặc hiệu ứng (nếu có)\n" +
      "4. Chọn quyền riêng tư cho Story (Công khai, Bạn bè, Chỉ mình tôi)\n" +
      '5. Nhấn "Đăng Story"\n\n' +
      "👀 *Cách xem Stories:*\n" +
      "1. Trên trang chủ, các Stories được hiển thị ở phần đầu trang\n" +
      "2. Nhấp vào avatar của người dùng để xem Story của họ\n" +
      "3. Nhấp vào bên phải màn hình để chuyển sang Story tiếp theo\n" +
      "4. Nhấp vào bên trái để quay lại Story trước đó\n\n" +
      "⚙️ *Quản lý Stories:*\n" +
      '1. Để sửa quyền riêng tư, mở Story của bạn, nhấn vào biểu tượng "..." và chọn quyền riêng tư muốn đổi\n' +
      '2. Để xóa Story, mở Story của bạn, nhấn vào biểu tượng "..." và chọn "Xóa"\n\n' +
      "Stories sẽ tự động biến mất sau 24 giờ kể từ khi đăng.",

    "Các tùy chọn quyền riêng tư có sẵn?":
      "HSocial cung cấp nhiều tùy chọn quyền riêng tư để bảo vệ thông tin và nội dung của bạn:\n\n" +
      "🔒 *Quyền riêng tư cho bài đăng:*\n" +
      "- PUBLIC (Công khai): Mọi người đều có thể xem\n" +
      "- FRIENDS (Bạn bè): Chỉ bạn bè mới có thể xem\n" +
      "- PRIVATE (Chỉ mình tôi): Chỉ bạn mới có thể xem\n\n" +
      "🔒 *Quyền riêng tư cho Stories:*\n" +
      "- PUBLIC: Mọi người đều có thể xem\n" +
      "- FRIENDS: Chỉ bạn bè mới có thể xem\n" +
      "- PRIVATE: Chỉ bạn mới có thể xem\n\n" +
      "Bạn có thể thay đổi các cài đặt này bất cứ lúc nào để đảm bảo quyền riêng tư theo nhu cầu của mình.",

    "Cách nhắn tin với bạn bè?":
      "HSocial cung cấp tính năng nhắn tin trực tiếp để bạn có thể trò chuyện với bạn bè:\n\n" +
      "💬 *Bắt đầu cuộc trò chuyện mới:*\n" +
      "1. Nhấp vào biểu tượng tin nhắn trên thanh điều hướng\n" +
      '2. Nhấp vào biểu tượng "Tạo tin nhắn mới" (thường là biểu tượng bút hoặc +)\n' +
      "3. Tìm và chọn người bạn muốn nhắn tin\n" +
      "4. Nhập tin nhắn của bạn và nhấn Enter hoặc nút Gửi\n\n" +
      "💬 *Trả lời tin nhắn hiện có:*\n" +
      "1. Nhấp vào biểu tượng tin nhắn trên thanh điều hướng\n" +
      "2. Chọn cuộc trò chuyện từ danh sách\n" +
      "3. Nhập tin nhắn của bạn và nhấn Enter hoặc nút Gửi\n\n" +
      "📎 *Gửi hình ảnh hoặc tệp đính kèm:*\n" +
      "1. Trong cửa sổ nhắn tin, nhấp vào biểu tượng đính kèm (thường là hình kẹp giấy)\n" +
      "2. Chọn hình ảnh hoặc tệp từ thiết bị của bạn\n" +
      "3. Thêm chú thích nếu muốn và nhấn Gửi\n\n" +
      "Tin nhắn của bạn được mã hóa và chỉ bạn và người nhận mới có thể xem.",
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Hiển thị lại panel câu hỏi
  const showQuestions = () => {
    setShowQuestionsPanel(true);
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: 4,
        mb: 4,
        height: "calc(100vh - 100px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <IconButton
          onClick={goToHome}
          title="Trở về trang chủ"
          sx={{
            bgcolor: "#4caf50",
            color: "white",
            "&:hover": {
              bgcolor: "#388e3c",
            },
            borderRadius: "50%",
            p: "8px",
          }}
        >
          <HomeIcon />
        </IconButton>

        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "#1976d2",
            textAlign: "center",
            flex: 1,
          }}
        >
          Trợ lý AI HSocial
        </Typography>
      </Box>

      <Typography
        variant="subtitle1"
        gutterBottom
        sx={{ mb: 2, color: "#666", textAlign: "center" }}
      >
        Chọn một câu hỏi hoặc đặt câu hỏi tùy chỉnh
      </Typography>

      <Paper
        elevation={3}
        sx={{
          flex: 1,
          mb: 2,
          p: 2,
          overflow: "auto",
          backgroundColor: "#f5f7fb",
          borderRadius: 2,
          position: "relative",
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              mb: 2,
              flexDirection: message.role === "user" ? "row-reverse" : "row",
              alignItems: "flex-start",
            }}
          >
            <Avatar
              sx={{
                bgcolor: message.role === "user" ? "#1976d2" : "#9c27b0",
                height: 32,
                width: 32,
                mr: message.role === "user" ? 0 : 1,
                ml: message.role === "user" ? 1 : 0,
                mt: 1,
              }}
            >
              {message.role === "user" ? <PersonIcon /> : "AI"}
            </Avatar>

            <Paper
              elevation={1}
              sx={{
                p: 1.5,
                maxWidth: "70%",
                borderRadius:
                  message.role === "user"
                    ? "12px 12px 0 12px"
                    : "12px 12px 12px 0",
                bgcolor: message.role === "user" ? "#e3f2fd" : "white",
                color: message.role === "user" ? "#0d47a1" : "#333",
                wordBreak: "break-word",
              }}
            >
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {message.content}
              </Typography>
            </Paper>
          </Box>
        ))}

        {loading && (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress size={24} />
            <Typography sx={{ ml: 1 }}>AI đang suy nghĩ...</Typography>
          </Box>
        )}

        {error && !loading && (
          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: "#ffebee",
              color: "#d32f2f",
              mb: 2,
              textAlign: "center",
            }}
          >
            <Typography>{error}</Typography>
          </Box>
        )}

        {/* Panel câu hỏi có sẵn */}
        {showQuestionsPanel && !loading && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontWeight: "medium", color: "#333", textAlign: "center" }}
            >
              Câu hỏi phổ biến về HSocial
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {PREDEFINED_QUESTIONS.map((q) => (
                <Grid item xs={12} sm={6} key={q.id}>
                  <Card
                    sx={{
                      backgroundColor: "#f0f7ff",
                      "&:hover": {
                        backgroundColor: "#e3f2fd",
                        transform: "translateY(-2px)",
                        transition: "all 0.2s",
                      },
                    }}
                  >
                    <CardActionArea onClick={() => handleSend(q.question)}>
                      <CardContent
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <Typography variant="h4" sx={{ mr: 2 }}>
                          {q.icon}
                        </Typography>
                        <Typography variant="body1">{q.question}</Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Paper>

      <Stack direction="row" spacing={1} alignItems="flex-end">
        {!showQuestionsPanel && (
          <IconButton
            onClick={showQuestions}
            title="Hiển thị câu hỏi có sẵn"
            sx={{
              bgcolor: "#9c27b0",
              color: "white",
              "&:hover": {
                bgcolor: "#7b1fa2",
              },
              borderRadius: "50%",
              p: "8px",
            }}
          >
            <QuestionIcon />
          </IconButton>
        )}
        <TextField
          fullWidth
          multiline
          maxRows={4}
          variant="outlined"
          placeholder="Nhập câu hỏi của bạn ở đây..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          sx={{
            backgroundColor: "white",
            "& .MuiOutlinedInput-root": {
              borderRadius: "20px",
              "& fieldset": {
                borderColor: "#ccc",
              },
              "&:hover fieldset": {
                borderColor: "#1976d2",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#1976d2",
              },
            },
          }}
        />
        <IconButton
          color="primary"
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          sx={{
            p: "12px",
            bgcolor: "#1976d2",
            color: "white",
            "&:hover": {
              bgcolor: "#1565c0",
            },
            "&.Mui-disabled": {
              bgcolor: "#e0e0e0",
            },
            borderRadius: "50%",
          }}
        >
          <SendIcon />
        </IconButton>
      </Stack>
    </Container>
  );
};

export default ChatBot;
