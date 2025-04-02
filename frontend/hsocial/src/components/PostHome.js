import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { useSelector } from "react-redux";


// Styled Components
const Container = styled.div`
  padding: 20px;
  max-width: 700px;
  margin: auto;
  position: relative;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 2px solid #eee;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
`;

const Title = styled.h2`
  text-align: center;
  font-size: 28px;
  color: #333;
  margin-bottom: 20px;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #ff7eb3, #ff758c);
  color: white;
  border: none;
  padding: 10px 15px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;

  &:hover {
    background: linear-gradient(135deg, #ff758c, #ff7eb3);
    transform: scale(1.05);
  }
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const Input = styled.input`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const TextArea = styled.textarea`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 5px;
  height: 80px;
`;

const PostCard = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 15px;
  margin-bottom: 15px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const PostTitle = styled.h3`
  font-size: 20px;
  color: #444;
`;

const PostContent = styled.p`
  font-size: 16px;
  color: #666;
`;

const Reactions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const CommentSection = styled.div`
  margin-top: 10px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 5px;
`;

const Comment = styled.p`
  font-size: 14px;
  color: #555;
  margin-bottom: 5px;
`;

const PostHome = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [user,setUser] = useState({});
  const navigate = useNavigate();


  const fetchUser = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:8080/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
    }
  }

  const userId = useSelector((state) => state.user.userId);


  const userAvatar = useSelector((state) => state.user.avatar); 

  // Lấy danh sách bài viết
  const fetchPosts = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/posts/listPost/${userId}`);
      if (!response.ok) throw new Error("Lỗi khi lấy dữ liệu");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  // Thêm bài viết mới
  const createPost = async () => {
    if (!newContent) return alert("Vui lòng nhập đầy đủ thông tin");

    try {
        
      await fetch("http://localhost:8080/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            content: newContent,
            userId: userId,
            postTime: new Date().toISOString(),
            isStory: false,
            postPrivacy: "PUBLIC"
        }),
      });

      setNewTitle("");
      setNewContent("");
      fetchPosts();
    } catch (error) {
      console.error("Lỗi khi tạo bài viết:", error);
    }
  };

  // Thả cảm xúc
  const reactToPost = async (postId, reaction) => {
    try {
      await fetch(`http://localhost:8080/posts/${postId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction }),
      });

      fetchPosts();
    } catch (error) {
      console.error("Lỗi khi thả cảm xúc:", error);
    }
  };

//   // Chia sẻ bài viết
//   const sharePost = async (postId) => {
//     try {
//       await fetch(`http://localhost:8080/posts/${postId}/share`, {
//         method: "POST",
//       });

//       alert("Đã chia sẻ bài viết!");
//     } catch (error) {
//       console.error("Lỗi khi chia sẻ bài viết:", error);
//     }
//   };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <Container>
      {/* Header với avatar */}
      <Header>
        <Title>📝 Danh sách bài viết</Title>
        <Avatar src={userAvatar} alt="Avatar" onClick={() => navigate("/userProfile")} />
      </Header>

      {/* Form thêm bài viết */}
      <Form>
        <TextArea
          placeholder="Nội dung bài viết"
          value={newContent}
          onChange={(e) => setNewContent(e.target.text)}
        />
        <input type="file" accept="image/*" onChange={(e) => setNewContent(e.target.files[0])} />

        <Button onClick={createPost}>➕ Đăng bài</Button>
      </Form>

      <Button onClick={fetchPosts}>🔄 Làm mới</Button>

      {loading ? (
        <p style={{ textAlign: "center", color: "#888" }}>Đang tải...</p>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id}>
            <PostTitle>{post.title}</PostTitle>
            <PostContent>{post.content}</PostContent>

            {/* Cảm xúc */}
            <Reactions>
              {["❤️", "😂", "😮", "😢", "😡"].map((emoji) => (
                <span key={emoji} onClick={() => reactToPost(post.id, emoji)} style={{ cursor: "pointer" }}>
                  {emoji}
                </span>
              ))}
            </Reactions>

            {/* Nút chia sẻ */}
            {/* <Button onClick={() => sharePost(post.id)}>📢 Chia sẻ</Button> */}

            {/* Bình luận */}
            <CommentSection>
              <strong>Bình luận:</strong>
              {post.comments?.map((c, index) => (
                <Comment key={index}>{c}</Comment>
              ))}
            </CommentSection>
          </PostCard>
        ))
      )}
    </Container>
  );
};

export default PostHome;
