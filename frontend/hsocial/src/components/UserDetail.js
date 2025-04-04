import { useEffect, useState } from "react";
import { fetchUserDetail, updateUserDetail } from "../api/userApi";
import { useSelector } from "react-redux";

import styles from "../styles/UserDetail.module.css";

const UserDetail = () => {
  const [userDetails, setUserDetails] = useState(null);
  const userId = useSelector((state) => state.user.userId);
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails({
      ...userDetails,
      [name]: value,
    });
  };

  const handleUpdate = async () => {
    try {
      const updatedUserDetail = await updateUserDetail(userId, userDetails);
      if (!updatedUserDetail) {
        alert("Error while updating user detail");
        return;
      }
      setUserDetails(updatedUserDetail);
      alert("Update successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const getUserDetails = async () => {
    const userDetail = await fetchUserDetail(userId);
    setUserDetails(userDetail);
  };

  useEffect(() => {
    getUserDetails();
  }, []);
  if (!userDetails) {
    return <p>Loading...</p>;
  }

  return (
    <div className={styles.profileContainer}>
      <h2>User Profile</h2>
      <div className={styles.avatarSection}>
        <img
          src={userDetails.avatar}
          alt="User Avatar"
          className={styles.avatar}
        />
      </div>

      <div className={styles.detailsSection}>
        <div className={styles.field}>
          <label>Full Name:</label>
          {isEditing ? (
            <input
              type="text"
              name="fullname"
              value={userDetails.fullname}
              onChange={handleInputChange}
            />
          ) : (
            <span>{userDetails.fullname}</span>
          )}
        </div>

        <div className={styles.field}>
          <label>Address:</label>
          {isEditing ? (
            <input
              type="text"
              name="address"
              value={userDetails.address}
              onChange={handleInputChange}
            />
          ) : (
            <span>{userDetails.address}</span>
          )}
        </div>

        <div className={styles.field}>
          <label>Age:</label>
          {isEditing ? (
            <input
              type="number"
              name="age"
              value={userDetails.age}
              onChange={handleInputChange}
            />
          ) : (
            <span>{userDetails.age}</span>
          )}
        </div>

        <div className={styles.field}>
          <label>Gender:</label>
          {isEditing ? (
            <select
              name="gender"
              value={userDetails.gender}
              onChange={handleInputChange}
            >
              <option value="true">Male</option>
              <option value="false">Female</option>
            </select>
          ) : (
            <span>{userDetails.gender ? "Male" : "Female"}</span>
          )}
        </div>

        <div className={styles.buttons}>
          {isEditing ? (
            <>
              <button className={styles.saveButton} onClick={handleUpdate}>
                Save
              </button>
              <button className={styles.cancelButton} onClick={handleCancel}>
                Cancel
              </button>
            </>
          ) : (
            <button
              className={styles.editButton}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default UserDetail;
