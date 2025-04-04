import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/SignUp.module.css";

import { signUp } from "../api/authApi";

function SignUp() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignUp = async (event) => {
    event.preventDefault();
    setError("");

    if (!username || !email || !password || !phone) {
      setError("All fields are required.");
      alert(error);
      return;
    }

    const data = await signUp(username, email, password, phone);
    if (data) {
      alert("Sign Up Successfully!");
      navigate("/login", { state: { username: username } });
    } else {
      setError("Sign up failed. Please try again later.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles["left-content"]}>
        <h2>Welcome to HSocial</h2>
        <p>Best social platform!</p>
      </div>
      <form className={styles.formSignUp} onSubmit={handleSignUp}>
        <h3>Get Started - it's Free!</h3>

        <input
          className={styles.inputSignUp}
          name="email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
          }}
          placeholder="Email"
        />

        <input
          className={styles.inputSignUp}
          name="username"
          type="text"
          value={username}
          onChange={(event) => {
            setUsername(event.target.value);
          }}
          placeholder="Username"
        ></input>

        <input
          className={styles.inputSignUp}
          name="password"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
          }}
          placeholder="Password"
        ></input>

        <input
          className={styles.inputSignUp}
          name="phone"
          type="text"
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value);
          }}
          placeholder="Phone"
        ></input>

        <div className={styles.policy}>
          <input type="checkbox" required />
          <p>
            I agree with <b>Privacy Policy</b> and <b>Terms of Use</b>{" "}
          </p>
        </div>

        <button className={styles.btnSignUp} id="btnSignUp" type="submit">
          Sign Up
        </button>

        {/* Hiển thị lỗi nếu có */}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}
export default SignUp;
