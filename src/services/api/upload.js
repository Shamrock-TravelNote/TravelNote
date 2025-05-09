import request from "../taroRequest";
import { BASE_URL } from "../config";
import Taro from "@tarojs/taro";

// 将小程序的文件上传转换为 Promise
const uploadFile = (tempFilePath) => {
  return new Promise((resolve, reject) => {
    Taro.uploadFile({
      url: `${BASE_URL}/api/upload/image`,
      filePath: tempFilePath,
      name: "file",
      success: (res) => {
        console.log("上传成功", res);
        const data = JSON.parse(res.data);
        resolve(data.url);
      },
      fail: (err) => {
        console.error("上传失败", err);
        reject(err);
      },
    });
  });
};

export default {
  uploadImage: (data) => request.post("/api/upload/image", data),
  uploadVideo: (data) => request.post("/api/upload/video", data),
  uploadTempFile: uploadFile,
};
