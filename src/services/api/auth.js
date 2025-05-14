import request from "../taroRequest";

export default {
  wechatLogin: (code) => {
    console.log("微信登录请求参数:", code);
    return request.post("/api/auth/wxlogin", { code }); // 添加return
  },
  register: (data) => request.post("/api/auth/register", data),
  login: (data) => request.post("/api/auth/login", data),
  getCurrentUser: () => request.get("/api/auth/user"),
  updateUserProfile: (data) => request.put(`/api/auth/profile`, data),
};
