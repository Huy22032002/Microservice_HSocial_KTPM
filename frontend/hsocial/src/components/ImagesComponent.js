import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchPostsUser } from "../api/postApi";
import styles from "../styles/ImagesComponent.module.css";
import { useParams } from "react-router-dom";

const ImagesComponent = () => {
  const userIdRedux = useSelector((state) => state.user.userId);
  const { userId } = useParams();

  const [posts, setPosts] = useState([]);
  const [images, setImages] = useState([]);

  const checkUser = () => {
    if (userId != userIdRedux) return userId;
    else return userIdRedux;
  };

  const fetchPosts = async () => {
    try {
      const userIdSelected = checkUser();
      const data = await fetchPostsUser(userIdSelected);
      if (data) {
        setPosts(data);
        // Lọc các bài viết có ảnh
        const postsWithImages = data.filter(
          (post) => post.content?.files?.length > 0
        );
        setImages(postsWithImages);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, userIdRedux);

  return (
    <div className={styles.container}>
      {images.length > 0 ? (
        images.map((p, i) => (
          <div
            key={i}
            style={{ width: "200px", height: "200px", cursor: "pointer" }}
          >
            {" "}
            <img
              alt="hinh"
              src={p.content.files}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "12px",
              }}
            />{" "}
          </div>
        ))
      ) : (
        <p>Không có bài viết nào!</p>
      )}
    </div>
  );
};
export default ImagesComponent;
