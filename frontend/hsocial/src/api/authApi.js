const SIGNUP_API = process.env.REACT_APP_SIGNUP_API_URL;
const SIGNIN_API = process.env.REACT_APP_SIGNIN_API_URL;

export async function signUp(username, email, password, phone) {
  console.log(SIGNUP_API);
  if (!username || !email || !password || !phone) {
    throw new Error("All fields are required.");
  }

  try {
    const response = await fetch(`${SIGNUP_API}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
        email: email,
        phone: phone,
      }),
    });
    if (!response.ok) {
      console.log("Error status:", response.status);
      throw new Error("Sign up failed");
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
}
export async function loginApi(username, pass) {
  console.log(SIGNIN_API);

  try {
    const response = await fetch(`${SIGNIN_API}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: pass,
      }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }
    const data = await response.json();
    console.log("Login success", data);
    return data;
  } catch (error) {
    console.log("Login error:", error);
  }
}
