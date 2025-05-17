import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./screens/login";
import SignUp from "./screens/signup";
import Home from "./screens/home";
import HomePage from "./screens/HomePage";
import Chat from "./screens/ChatWebSocket";
import PostHome from "./components/PostHome";
import Profile from "./screens/Profile";
import AnotherUserProfile from "./screens/AnotherUserProfile";

import { Provider } from "react-redux";
import { store } from "./redux/userSlice";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="chat/:userId" element={<Chat />} />
          <Route path="post" element={<PostHome />} />
          <Route path="profile" element={<Profile />} />
          <Route
            path="anotherUserProfile/:userId"
            element={<AnotherUserProfile />}
          />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
