import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // شيل /api
});

export default api;
