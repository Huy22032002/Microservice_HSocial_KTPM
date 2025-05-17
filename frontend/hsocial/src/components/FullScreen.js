import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "../styles/FullScreen.module.css";
import { faClose } from "@fortawesome/free-solid-svg-icons";

const FullScreen = ({ post, onClose }) => {
  return (
    <div className={styles.container}>
      <div className={styles.leftContainer}>
        <button onClick={onClose}>
          <FontAwesomeIcon icon={faClose} />
        </button>
        <img
          alt="img"
          style={{ width: "100%", objectFit: "cover" }}
          src={
            post?.content?.files?.[0] || require("../assets/default_avatar.png")
          }
        />
      </div>
      <div className={styles.rightContainer}>
        <div className="post-header">
          <img src={post.avatar} alt="avatar" className="avatar" />
          <h3>{post.fullname}</h3>
        </div>
        <div className={styles.contentPost}>
          <p>{post?.content?.text}</p>
        </div>
        <div className={styles.reactionPost}></div>
        <div className={styles.commentPost}></div>
      </div>
    </div>
  );
};

export default FullScreen;
