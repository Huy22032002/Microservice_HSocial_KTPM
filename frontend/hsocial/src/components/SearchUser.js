import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getListUserDetailByValue } from "../api/userApi";
import { debounce } from "lodash"; //goi api theo giay
import { useSelector } from "react-redux";

const SearchUser = () => {
  const userId = useSelector((state) => state.user.userId);

  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const fetchSearchResults = debounce(async () => {
    if (searchValue.trim() === "") {
      setSearchResults([]);
      setShowPopup(false);
      return;
    }
    try {
      const data = await getListUserDetailByValue(searchValue);
      setShowPopup(true);
      setSearchResults(data);
    } catch (err) {
      console.log("search fail: ", err);
      setShowPopup(false);
      setSearchResults([]);
      alert(err);
    }
  }, 500); //khi user ngung 0.4s se goi api

  useEffect(() => {
    fetchSearchResults();
  }, [searchValue]);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        background: "#e4e6e9",
        padding: "12px",
        borderRadius: "16px",
        margin: "10px 0",
        width: "240px",
      }}
    >
      <input
        type="text"
        placeholder="Tìm kiếm bạn bè hoặc ai đó..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onFocus={() => {
          if (searchResults.length > 0) setShowPopup(true);
        }}
        onBlur={() => setTimeout(() => setShowPopup(false), 200)}
        style={{
          background: "#e4e6e9",
          outline: "none",
          border: "none",
          margin: "0 6px",
          width: "80%",
        }}
      />
      {showPopup && (
        <div
          style={{
            position: "absolute",
            top: "48px",
            backgroundColor: "white",
            width: "300px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            zIndex: 999,
            color: "#333",
          }}
        >
          {searchResults.length === 0 ? (
            <p style={{ padding: "10px", color: "gray" }}>
              Không tìm thấy người dùng
            </p>
          ) : (
            searchResults.map((user) => (
              <div
                key={user.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                }}
                onClick={() => {
                  if (user.id === userId) navigate(`/profile/${userId}`);
                  else navigate(`/anotherUserProfile/${user.id}`);
                  setSearchValue("");
                  setShowPopup(false);
                }}
              >
                <img
                  src={user.avatar || require("../assets/default_avatar.png")}
                  alt="avatar"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                  }}
                />
                <span>{user.fullname}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchUser;
