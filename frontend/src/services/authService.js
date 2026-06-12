import api from "../api/axios";

export const registerUser = async (data) => {
  const response = await api.post(
    "/api/auth/register",
    data
  );

  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post(
    "/api/auth/login",
    data
  );

  localStorage.setItem(
    "access_token",
    response.data.access_token
  );

  localStorage.setItem(
    "refresh_token",
    response.data.refresh_token
  );

  return response.data;
};

export const getProfile = async () => {
  const response = await api.get(
    "/api/auth/me"
  );

  return response.data;
};

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};