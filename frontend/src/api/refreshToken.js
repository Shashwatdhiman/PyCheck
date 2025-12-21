import axios from "axios";

const refreshToken = async () => {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) throw new Error("No refresh token");

  const response = await axios.post(
    "token/refresh/",
    { refresh }
  );

  localStorage.setItem("access_token", response.data.access);
  return response.data.access;
};

export default refreshToken;
