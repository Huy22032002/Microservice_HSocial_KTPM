import React, { useEffect, useState } from "react";
import styles from "../styles/EditProfileModal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const EditProfileModal = ({ user, onClose, onSave }) => {
  const [fullname, setFullname] = useState(user.fullname || "");
  const [age, setAge] = useState(user.age || "");
  const [gender, setGender] = useState(user.gender || true);
  const [avatar, setAvatar] = useState(user.avatar || null);
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [streetNumber, setStreetNumber] = useState("");

  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  //load api city
  useEffect(() => {
    axios
      .get("https://provinces.open-api.vn/api/p")
      .then((res) => setCities(res.data));
  }, []);
  //load district
  useEffect(() => {
    if (city) {
      const selectedCity = cities.find((c) => c.name === city);
      if (selectedCity) {
        axios
          .get(
            `https://provinces.open-api.vn/api/p/${selectedCity.code}?depth=2`
          )
          .then((res) => setDistricts(res.data.districts));
      }
    }
  }, [city]);
  //load wards
  useEffect(() => {
    if (district) {
      const selectedDistrict = districts.find((d) => d.name === district);
      if (selectedDistrict) {
        axios
          .get(
            `https://provinces.open-api.vn/api/d/${selectedDistrict.code}?depth=2`
          )
          .then((res) => setWards(res.data.wards));
      }
    }
  }, [district]);

  const handleSubmit = () => {
    //validate
    if (
      !fullname ||
      !age ||
      !gender ||
      !city ||
      !district ||
      !ward ||
      !streetNumber
    ) {
      alert("Vui lòng nhập đủ thông tin!");
      return;
    }
    const updateUserDetail = {
      fullname,
      age,
      gender,
      address: `${streetNumber}, ${ward}, ${district}, ${city}`,
    };
    if (avatar) {
      const formData = new FormData();
      formData.append("avatar", avatar);
      formData.append("data", JSON.stringify(updateUserDetail));
      onSave(formData);
    } else {
      onSave(updateUserDetail);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Chỉnh sửa thông tin cá nhân</h3>
          <button onClick={onClose} className={styles.closeBtn}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <label>Hình ảnh (tùy chọn)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files[0])}
          />
          <label>Họ tên</label>
          <input
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            placeholder="Nhập họ tên"
          />
          <label>Giới tính</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value={true}>Nam</option>
            <option value={false}>Nữ</option>
          </select>
          <label>Tuổi</label>
          <input
            value={age}
            placeholder="Tuổi"
            onChange={(e) => setAge(e.target.value)}
          />
          <label>Thành phố</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          >
            {cities.map((city) => (
              <option key={city.code} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
          <label>Quận</label>
          <select
            required
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            {districts.map((d) => (
              <option key={d.code} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          <label>Phường</label>
          <select
            value={ward}
            onChange={(e) => setWard(e.target.value)}
            required
          >
            {wards.map((w) => (
              <option key={w.code} value={w.name}>
                {w.name}
              </option>
            ))}
          </select>

          <label>Số nhà</label>
          <input
            value={streetNumber}
            onChange={(e) => setStreetNumber(e.target.value)}
            placeholder="Nhập số nhà"
            required
          />
        </div>
        <div className={styles.modalFooter}>
          <button onClick={handleSubmit} className={styles.saveBtn}>
            Lưu
          </button>
          <button onClick={onClose} className={styles.cancelBtn}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
