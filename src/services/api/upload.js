import request from "../taroRequest";
import { BASE_URL } from "../config";
import Taro from "@tarojs/taro";

// 将小程序的文件上传转换为 Promise
const uploadFile = (file) => {
  return new Promise((resolve, reject) => {
    const mediaType = file.type;

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

    const header = {};
    if (token) {
      header.Authorization = `Bearer ${token}`; // 与你的 taroRequest 拦截器保持一致
      console.log("Token attached to uploadFile header:", token);
    } else {
      console.log("No token found for uploadFile.");
    }

    Taro.uploadFile({
      url: `${BASE_URL}/api/upload/${mediaType}`,
      filePath: file.url,
      header: header,
      name: mediaType,
      success: (res) => {
        console.log("[uploadFile] 上传接口响应成功:", res);
        try {
          // res.data 是后端返回的字符串，需要解析成JSON
          const responseData = JSON.parse(res.data);

          if (res.statusCode >= 200 && res.statusCode < 300) {
            if (responseData && responseData.url) {
              console.log(
                "[uploadFile] 文件上传至OSS成功，OSS URL:",
                responseData.url
              );
              resolve(responseData.url); // *关键：resolve 从后端获取到的 OSS URL*
            } else {
              console.error(
                "[uploadFile] 上传成功，但响应数据中缺少 'url' 字段:",
                responseData
              );
              reject("上传响应格式错误 (缺少url)");
            }
          } else {
            // 处理后端明确返回的错误状态（例如400, 401, 500等）
            console.error(
              `[uploadFile] 服务器端上传失败 (状态码: ${res.statusCode}):`,
              responseData
            );
            reject(
              responseData.message ||
                `文件上传服务失败 (状态码: ${res.statusCode})`
            );
          }
        } catch (parseError) {
          console.error(
            "[uploadFile] 解析服务器响应JSON失败:",
            parseError,
            "原始数据:",
            res.data
          );
          reject(`解析服务器响应失败: ${res.data}`);
        }
      },
      fail: (err) => {
        console.error("[uploadFile] Taro.uploadFile API 调用失败:", err);
        reject(err.errMsg || "文件上传接口调用失败");
      },
    });
  });
};

export default {
  uploadImage: (fileData) => {
    return uploadFile(fileData);
  },
  uploadVideo: (fileData) => {
    return uploadFile(fileData);
  },
  uploadTempFile: uploadFile,
};
