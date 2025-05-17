import styles from "../styles/BannerHome.module.css";

const BannerHome = () => {
  const banners = [
    {
      id: 1,
      name: "Free MongoDB!",
      image: require("../assets/banner1.png"),
      link: "mongodb.com",
    },
    {
      id: 2,
      name: "Watch Now!",
      image: require("../assets/banner2.jpg"),
      link: "youtube.com",
    },
  ];

  return (
    <div className={styles.container}>
      <div>
        <h2 style={{ color: "gray" }}>Được tài trợ</h2>
      </div>
      {banners.map((item) => (
        <div key={item.id} className={styles.bannerItem}>
          <img
            src={item.image}
            alt="banner1"
            style={{
              width: "180px",
              height: "180px",
              borderRadius: "12px",
              objectFit: "cover",
              margin: "0 12px 12px 0",
            }}
          />
          <div>
            <h3 style={{ boxSizing: "border-box" }}>{item.name}</h3>
            <p style={{ boxSizing: "border-box", color: "gray" }}>
              {item.link}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BannerHome;
