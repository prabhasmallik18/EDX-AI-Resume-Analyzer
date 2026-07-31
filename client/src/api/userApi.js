import axios from "axios";

const API_URL = "http://localhost:8000/api/users";

export const getProfile = async (token) => {
  return axios.get(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};