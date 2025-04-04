import React, { useEffect } from "react";
import Header from "./header";
import styles from "../styles/Home.module.css";
function Home() {
  useEffect(() => {});

  return (
    <div>
      <Header />
      {/* Main Content */}
      <div className={styles.main}>
        <div className={styles.leftPanel}>
          <div className={styles.postBox}>
            <img
              src="https://imgur.com/4fzhaj3.png"
              alt="Avatar"
              className={styles.avatar}
            />
            <input type="text" placeholder="Type sth..." />
            <div className={styles.postActions}>
              <button>Create Your Post</button>
            </div>
          </div>
          <div className={styles.post}>
            <div className={styles.userInfo}>
              <img
                src="https://imgur.com/4fzhaj3.png"
                alt="Avatar"
                className={styles.avatar}
              />
              <div>
                <h4>Vishnu Kumar Agrawal</h4>
                <p>UI Designer at Dwm Technology</p>
              </div>
            </div>
            <p>Lorem Ipsum is simply dummy text...</p>
            <div className={styles.postActions}>
              <button>Like</button>
              <button>Comment</button>
              <button>Share</button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={styles.rightPanel}>
          <div className={styles.profileView}>
            <p>
              <strong>569</strong> Profile views
            </p>
            <p>
              <strong>32</strong> Connections
            </p>
          </div>
          <div className={styles.suggestions}>
            <h3>People you might know</h3>
            <div className={styles.userSuggestion}>
              <div>
                <p>John Cena</p>
                <p>UI Designer at Dwm Technology</p>
              </div>
              <button>Connect</button>
            </div>
            <div className={styles.userSuggestion}>
              <div>
                <p>Lionel Messi</p>
                <p>UX Designer</p>
              </div>
              <button>Connect</button>
            </div>
          </div>

          <div className={styles.lstFriend}>
            <h3>Upcoming Events</h3>
            <p>03 Dec - Design Thinking</p>
            <p>12 Dec - Information Architecture</p>
            <p>16 Dec - Web Dev Meetup</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
