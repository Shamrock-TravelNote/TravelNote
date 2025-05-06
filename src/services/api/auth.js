import request from "../request";

export default {
  register: (data) => request.post("/api/auth/register", data),
  login: (data) => request.post("/api/auth/login", data),
  getCurrentUser: () => request.get("/api/auth/user"),
};
