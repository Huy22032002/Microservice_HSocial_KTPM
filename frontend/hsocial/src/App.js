import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./screens/login";
import SignUp from "./screens/signup";
import Home from "./screens/home";
import HomePage from "./screens/HomePage";
import Chat from "./screens/ChatWebSocket";
import PostHome from "./screens/PostHome";
import Profile from "./screens/Profile";
import AnotherUserProfile from "./screens/AnotherUserProfile";
import ImagesComponent from "./components/ImagesComponent";
import AboutComponent from "./components/AboutComponent";
import FriendsComponent from "./components/FriendsComponent";
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
          <Route path="chat" element={<Chat />} />
          <Route path="post" element={<PostHome />} />
          <Route path="profile/:userId" element={<Profile />}>
            <Route path="" />
            <Route path="images" element={<ImagesComponent />} />
            <Route path="friends" element={<FriendsComponent />} />
            <Route path="about" element={<AboutComponent />} />
          </Route>
          <Route
            path="anotherUserProfile/:userId"
            element={<AnotherUserProfile />}
          >
            <Route path="" />
            <Route path="images" element={<ImagesComponent />} />
            <Route path="friends" element={<FriendsComponent />} />
            <Route path="about" element={<AboutComponent />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
