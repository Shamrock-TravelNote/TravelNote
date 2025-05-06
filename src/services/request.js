import axios from "axios";
import Taro from "@tarojs/taro";
import { API_CONFIG } from "./config";

const instance = axios.create(API_CONFIG);

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 从本地获取token
    const token = Taro.getStorageSync("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    const { data } = response;
    // 这里可以根据后端返回的数据结构进行适当的处理
    if (data.code === 200) {
      return data.data;
    }
    return Promise.reject(data);
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // token过期或未登录
          Taro.navigateTo({ url: "/pages/login/index" });
          break;
        case 403:
          Taro.showToast({
            title: "没有权限访问",
            icon: "none",
          });
          break;
        default:
          Taro.showToast({
            title: "服务器错误",
            icon: "none",
          });
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
