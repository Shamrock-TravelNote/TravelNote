import Taro from "@tarojs/taro";
import { BASE_URL } from "./config"; // 假设你的 BASE_URL 在这里

// 拦截器对象
const customInterceptor = function (chain) {
  const requestParams = chain.requestParams;
  const { method, data, url, header = {} } = requestParams; // header 默认为空对象

  // console.log(`Taro.request: 发起 ${method || "GET"} 请求到 ${url}`, data);

  // 统一在 header 中添加 token
  let token = null;
  try {
    const persistedUserState = Taro.getStorageSync("user-storage");
    if (persistedUserState) {
      const userState = JSON.parse(persistedUserState);
      // console.log("userState", userState.state);
      if (userState && userState.state && userState.state.token) {
        token = userState.state.token;
      }
    }
  } catch (e) {
    console.error("Taro.request Interceptor: Error retrieving token:", e);
  }

  const newHeader = { ...header }; // 创建新的header对象或直接修改

  if (token) {
    newHeader.Authorization = `Bearer ${token}`;
    // console.log("Taro.request Interceptor: Token attached:", token);
  }

  // 确保 Content-Type (主要针对 POST/PUT/PATCH)
  // Taro.request 默认 GET 的 Content-Type 是 'application/json'
  // POST 默认是 'application/x-www-form-urlencoded'，如果发送JSON，需要明确设置
  if (method && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
    if (!newHeader["Content-Type"]) {
      newHeader["Content-Type"] = "application/json";
    }
    // 如果 data 是 FormData, Taro.request 通常能自动处理 Content-Type (multipart/form-data)
    // 但最好确认一下，或者在特定上传场景中手动设置
  }

  requestParams.header = newHeader; // 更新请求参数中的 header
  // console.log(
  //   "Taro.request Interceptor: Final headers being sent:",
  //   JSON.stringify(newHeader)
  // );

  return chain
    .proceed(requestParams)
    .then((res) => {
      // 响应拦截逻辑
      // console.log(`Taro.request: 收到来自 ${url} 的响应:`, res);

      // 示例：统一处理 HTTP 错误状态码
      // 注意：Taro.request 的成功回调 (then) 包含了服务器返回的各种 HTTP 状态码
      // 你需要自己检查 res.statusCode
      if (res.statusCode === 401) {
        console.error(
          "Taro.request Interceptor: Unauthorized (401). Redirecting to login."
        );
        Taro.removeStorageSync("user-storage"); // 清除 token
        Taro.redirectTo({ url: "/pages/login/index" }); // 跳转到登录页面
        // 可以通过返回一个reject的Promise中断后续的业务逻辑
        return Promise.reject({ ...res, message: "请先登录" });
      }
      if (res.statusCode === 403) {
        Taro.showToast({ title: "没有权限访问", icon: "none" });
        return Promise.reject({ ...res, message: "没有权限访问此资源" });
      }
      if (res.statusCode >= 400 && res.statusCode < 500) {
        // 其他客户端错误
        Taro.showToast({
          title: res.data?.message || "请求参数错误",
          icon: "none",
        });
        return Promise.reject({
          ...res,
          message: res.data?.message || "请求参数错误",
        });
      }
      if (res.statusCode >= 500) {
        Taro.showToast({ title: "服务器开小差了，请稍后再试", icon: "none" });
        return Promise.reject({ ...res, message: "服务器错误" });
      }

      // 如果你的API响应体有一个统一的结构，比如 { code, data, message }
      // 可以在这里做一层数据提取或错误判断
      // if (res.data && res.data.code !== 200) { // 假设 code 200 是成功
      //   Taro.showToast({ title: res.data.message || '操作失败', icon: 'none' });
      //   return Promise.reject(res.data);
      // }
      // return res.data.data; // 直接返回业务数据部分
      // console.log("Taro.request Interceptor: 成功响应数据:", res);
      return res.data; // 或者直接返回 res.data
    })
    .catch((err) => {
      // 网络错误或其他 chain.proceed 内部的JS错误
      console.error(`Taro.request Interceptor: 请求 ${url} 失败:`, err);
      if (!err.statusCode) {
        // 如果没有statusCode，可能是网络问题或代码错误
        Taro.showToast({ title: "网络连接失败，请检查网络", icon: "none" });
      }
      // 确保向上抛出错误，让业务代码的catch能捕获
      return Promise.reject(err);
    });
};

// 添加拦截器
Taro.addInterceptor(customInterceptor);
// Taro.addInterceptor(Taro.interceptors.logInterceptor) // Taro内置的日志拦截器
// Taro.addInterceptor(Taro.interceptors.timeoutInterceptor) // Taro内置的超时拦截器

// 封装一个通用的请求函数
// const request = (options) => {
//   return Taro.request({
//     url: BASE_URL + options.url, // 拼接 baseURL
//     data: options.data || {},
//     method: options.method || "GET",
//     header: options.header || {}, // 业务层面如果需要额外header可以传入
//     timeout: options.timeout || 10000, // 默认超时时间
//     // ... 其他 Taro.request 支持的参数
//   });
// };

const request = {
  get: (url, data, options = {}) => {
    return Taro.request({
      url: BASE_URL + url,
      data,
      method: "GET",
      header: options.header || {}, // 允许在调用时覆盖或添加header
      ...options, // 其他 Taro.request 支持的参数，如 timeout
    });
  },
  post: (url, data, options = {}) => {
    return Taro.request({
      url: BASE_URL + url,
      data,
      method: "POST",
      header: options.header || {},
      ...options,
    });
  },
  put: (url, data, options = {}) => {
    return Taro.request({
      url: BASE_URL + url,
      data,
      method: "PUT",
      header: options.header || {},
      ...options,
    });
  },
  delete: (url, data, options = {}) => {
    return Taro.request({
      url: BASE_URL + url,
      data,
      method: "DELETE",
      header: options.header || {},
      ...options,
    });
  },
  // 你还可以添加 patch, head 等方法如果需要
  // 通用请求方法，如果不想区分 get/post 等
  send: (options) => {
    return Taro.request({
      ...options,
      url: BASE_URL + options.url,
    });
  },
};

export default request;
