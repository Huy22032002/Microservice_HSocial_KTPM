import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import styles from "../styles/Login.module.css";
import { useDispatch } from "react-redux";
import { login } from "../redux/userSlice";

import { loginApi } from "../api/authApi";
const Login = () => {
  const [username, setUserName] = useState("");
  const [pass, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (event) => {
    event.preventDefault();

    const data = await loginApi(username, pass);
    if (data) {
      localStorage.setItem("token", data.token);

      dispatch(login({ userId: data.user.id }));
      console.log(dispatch(login({ userId: data.user.id })));

      navigate("/");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftContent}>
        <h2>Welcome to HSocial</h2>
        <p>Best Social Platform!</p>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className={styles.formContainer}>
        <form className={styles.formLogin} onSubmit={handleLogin}>
          <input
            className={styles.inputLogin}
            name="username"
            type="text"
            value={username}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Username"
            required
          />

          <input
            className={styles.inputLogin}
            name="password"
            type="password"
            value={pass}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />

          <button className={styles.btnLogin} type="submit">
            Login
          </button>
        </form>
        <button className={styles.btnGoogleLogin}>
          <FontAwesomeIcon icon={faGoogle} className={styles.googleIcon} />
          Login with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
