import React, { useEffect } from "react";
import Header from "./header";
import styles from "../styles/Home.module.css";
import PostHome from "./PostHome";
function Home() {
  useEffect(() => {});

  return (
    <div>
      <Header />
      <PostHome />
    </div>
  );
}

export default Home;
