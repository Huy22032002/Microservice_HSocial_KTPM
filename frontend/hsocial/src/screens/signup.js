import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/SignUp.module.css";

import { signUp } from "../api/authApi";
import { createUserDetail } from "../api/userApi";

function SignUp() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignUp = async (event) => {
    event.preventDefault();
    setError("");

    if (
      !username ||
      !email ||
      !password ||
      !phone ||
      !fullName ||
      !gender ||
      !age
    ) {
      setError("All fields are required.");
      alert("Vui lòng nhập đủ thông tin!.");
      return;
    }
    try {
      const data = await signUp(username, email, password, phone);
      if (data && data.id) {
        const userDetailData = await createUserDetail(
          data.id,
          fullName,
          gender,
          age
        );
        if (userDetailData) {
          alert("Sign Up Successfully!");
          navigate("/login", { state: { username: username } });
        }
      } else {
        setError("Đăng ký thất bại!");
      }
    } catch (err) {
      console.error("SignUp error: ", err);
      setError(err.response?.data?.message || "Đky failed. lỗi server.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles["left-content"]}>
        <h2>Chào mừng bạn đến với HSocial</h2>
        <p>Nền tảng mạng xã hội chia sẻ nội dung!</p>
      </div>
      <form className={styles.formSignUp} onSubmit={handleSignUp}>
        <h3>Đăng ký tài khoản!</h3>

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
          placeholder="Tên đăng nhập"
        ></input>

        <input
          className={styles.inputSignUp}
          name="password"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
          }}
          placeholder="Mật khẩu"
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

        <input
          className={styles.inputSignUp}
          name="fullName"
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Họ và tên"
        />

        <select
          className={styles.inputSignUp}
          name="gender"
          value={gender}
          onChange={(event) => setGender(event.target.value)}
        >
          <option value="">Giới tính</option>
          <option value="1">Nam</option>
          <option value="0">Nữ</option>
        </select>

        <input
          className={styles.inputSignUp}
          name="age"
          type="number"
          value={age}
          onChange={(event) => setAge(event.target.value)}
          placeholder="Tuổi"
        />

        <div className={styles.policy}>
          <input type="checkbox" required />
          <p>
            Tôi đồng ý <b>với các Chính sách</b> và <b>Điều khoản sử dụng</b>{" "}
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
