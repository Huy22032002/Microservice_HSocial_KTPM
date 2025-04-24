import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import React from "react";
import Login from "./components/login";
import SignUp from "./components/signup";
import Home from "./components/home";
import Chat from "./components/ChatWebSocket";
import PostHome from "./components/PostHome";
import Profile from "./components/Profile";
import AnotherUserProfile from "./components/AnotherUserProfile";

import { Provider } from "react-redux";
import { store } from "./redux/userSlice";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="chat" element={<Chat />} />
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
