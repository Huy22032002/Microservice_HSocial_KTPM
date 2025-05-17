const ProfileImage = ({ images }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        maxWidth: "510x",
        gap: "10px",
      }}
    >
      {images.map((img, index) => (
        <div
          key={index}
          style={{ width: "160px", height: "160px", cursor: "pointer" }}
        >
          <img
            alt="h/anh"
            src={img.content.files}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      ))}
    </div>
  );
};

export default ProfileImage;
