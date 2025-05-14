import { View, Text, Textarea, Input } from "@tarojs/components";
import { useState, useCallback } from "react";
import { useDidShow } from "@tarojs/taro";
import { AtImagePicker, AtButton } from "taro-ui";
import Taro from "@tarojs/taro";
import { useUserStore, checkUserLoggedIn, useUIStore } from "@/store";
import MediaPicker from "@/components/MediaPicker";
import { upload, travel } from "@/services";
import "./index.scss";

// DONE: 上传检查互斥类型逻辑优化
// DONE: 发布成功后跳转至profile
const Publish = () => {
  // 使用 useCallback 来缓存选择器
  const setActiveTabIndex = useUserStore(
    useCallback((state) => state.setActiveTabIndex, [])
  );
  const userInfo = useUserStore(useCallback((state) => state.userInfo, []));
  const triggerProfileRefresh = useUIStore(
    (state) => state.triggerProfileRefresh
  );

  const [files, setFiles] = useState([]);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  useDidShow(() => {
    checkUserLoggedIn();
    setActiveTabIndex(1);
  });

  // 处理图片选择
  const handleMediaChange = (newFiles) => {
    // console.log('选择的文件:', newFiles)
    setFiles(newFiles);
  };

  // 处理图片删除
  const handleImageRemove = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  // 处理内容输入
  const handleContentChange = (e) => {
    setContent(e.detail.value);
  };

  // 处理单个图片上传
  const uploadSingleFileToOSS = async (file) => {
    try {
      const fileUrl = await upload.uploadTempFile(file);
      console.log("ossupload!", fileUrl);
      return fileUrl;
    } catch (error) {
      console.error("图片上传失败:", error);
      throw error;
    }
  };

  // 发布游记
  const handlePublish = async () => {
    if (!userInfo || !userInfo.id) {
      Taro.showToast({ title: "请先登录", icon: "none" });
      return;
    }

    if (!content.trim()) {
      Taro.showToast({ title: "请输入游记内容", icon: "none" });
      return;
    }

    if (files.length === 0) {
      Taro.showToast({ title: "请至少上传一张图片或视频", icon: "none" });
      return;
    }

    try {
      setUploading(true);
      console.log("发布本地文件:", files);

      const uploadedOSSUrl = await Promise.all(
        files.map((file) => uploadSingleFileToOSS(file))
      );

      console.log("oss :", uploadedOSSUrl);
      // 这里可以调用创建游记的 API
      const params = {
        title: title.trim(),
        content: content.trim(),
        mediaType: files[0].type,
        detailType: files[0].orientation,
      };

      console.log("type:", files[0].type);

      if (params.mediaType === "image") {
        params.images = uploadedOSSUrl;
      } else if (params.mediaType === "video") {
        params.video = uploadedOSSUrl[0];
      }

      console.log("params", params);

      await travel.createTravel(params);

      Taro.showToast({ title: "发布成功", icon: "success" });

      setFiles([]);
      setTitle("");
      setContent("");

      triggerProfileRefresh();

      Taro.switchTab({ url: "/pages/profile/index" });
    } catch (error) {
      console.error("发布失败:", error);
      Taro.showToast({ title: "发布失败", icon: "none" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="publish">
      <View className="publish-form">
        <Text className="form-title">发布游记</Text>
        <View className="media-picker-container">
          <MediaPicker
            value={files}
            maxCount={9}
            onChange={handleMediaChange}
            // onRemove={handleImageRemove}
          />
        </View>
        <Input
          className="title-input"
          placeholder="添加标题"
          value={title}
          onInput={(e) => setTitle(e.detail.value)}
        />
        <Textarea
          className="content-input"
          placeholder="分享你的旅行故事..."
          value={content}
          onInput={handleContentChange}
        />
        <AtButton
          className="publish-btn"
          type="primary"
          loading={uploading}
          onClick={handlePublish}
        >
          发布
        </AtButton>
      </View>
    </View>
  );
};

export default Publish;
