import axios from "axios";

const FRIEND_API = process.env.REACT_APP_USER_FRIEND_API_URL;
export async function getListFriendWithfullName(userId) {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${FRIEND_API}/name/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (response) {
      console.log("lst friend with name: ", response.data);
      return response.data;
    }
  } catch (er) {
    throw er || er.message;
  }
}
export async function getListFriend(id) {
  const token = localStorage.getItem("token");

  console.log(FRIEND_API);
  try {
    const response = await axios.get(`${FRIEND_API}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log(`ds ban be cua user ${id} trong api: `, response.data);
    if (response.data.length > 0) return response.data.friends;
    else return [];
  } catch (err) {
    if (err.response) {
      console.log("Lỗi  server:", err.response.status, err.response.data);
    } else {
      console.log("Lỗi không phản hồi:", err.message);
    }
    return [];
  }
}
export async function getListPending(id) {
  const token = localStorage.getItem("token");

  console.log(FRIEND_API);
  try {
    const response = await axios.get(`${FRIEND_API}/${id}/pending`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log("ds pending: ", response.data);
    return response.data.friends;
  } catch (err) {
    if (err.response) {
      console.log("Lỗi  server:", err.response.status, err.response.data);
    } else {
      console.log("Lỗi không phản hồi:", err.message);
    }
    return [];
  }
}
export async function sendFriendRequest(userId, friendId) {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${FRIEND_API}/add`,
      {
        userId: userId,
        friendId: friendId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response) {
      console.log("friend req: ", response.data);
      return response;
    }
  } catch (err) {
    throw new Error("Error send friend request api: ", err);
  }
}
export async function accpeptFriend(userId, friendId) {
  const token = localStorage.getItem("token");
  try {
    const response = axios.put(
      `${FRIEND_API}/accept`,
      {
        userId: userId,
        friendId: friendId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response) {
      console.log("accpet friend: ", response.data);
      return response.data;
    }
  } catch (err) {
    throw new Error("Erro accept friend api: ", err);
  }
}
export async function removeFriend(userId, friendId) {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.delete(`${FRIEND_API}/removeFriend`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        userId,
        friendId,
      },
    });
    const rs = response.data;
    console.log("delete: ", rs);
    return rs;
  } catch (err) {
    throw new Error("err remove friend in api: ", err);
  }
}
export async function removeFriendRequest(userId, friendId) {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.delete(
      `http://localhost:8080/api/friends/decline`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {
          userId,
          friendId,
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (err) {
    throw err;
  }
}
