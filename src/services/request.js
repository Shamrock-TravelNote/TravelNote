import axios from "axios";
import Taro from "@tarojs/taro";
import { API_CONFIG } from "./config";
import { TaroAdapter } from "axios-taro-adapter";
import { useUserStore } from "../store";

const instance = axios.create({ ...API_CONFIG, adapter: TaroAdapter });

// const instance = axios.create({ API_CONFIG });

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 添加更详细的请求日志
    // console.log("完整请求配置:", {
    //   url: config.url,
    //   baseURL: config.baseURL,
    //   method: config.method,
    //   headers: config.headers,
    //   data: config.data,
    //   fullPath: `${config.baseURL || ""}${config.url}`,
    // });

    // 验证baseURL
    if (!config.baseURL) {
      console.warn("Warning: baseURL is not set in API_CONFIG");
    }

    let token = null;

    try {
      const persistedUserState = Taro.getStorageSync("user-storage");
      if (persistedUserState) {
        const userState = JSON.parse(persistedUserState);
        if (userState && userState.state && userState.state.token) {
          token = userState.state.token;
        }
      }
    } catch (e) {
      console.error(
        "Error retrieving token from storage for request interceptor:",
        e
      );
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Token attached to request:", token);
    } else {
      console.log("No token found for request.");
    }

    // 确保请求头包含正确的 Content-Type
    if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    console.log("headers:", config.headers);
    console.log("headers(JSON)", JSON.stringify(config.headers));
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    console.log("Response:", response.config.url, response.data);
    if (response) {
      return response.data || response;
    }
  },
  (error) => {
    console.error("Response Error:", error);

    if (!error.response) {
      // 处理网络错误
      Taro.showToast({
        title: "网络连接失败，请检查网络设置",
        icon: "none",
      });
      return Promise.reject(new Error("Network Error"));
    }

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
