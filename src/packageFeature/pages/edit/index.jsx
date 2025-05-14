// src/pages/edit-travel/index.jsx
import { View, Text, Textarea, Input } from "@tarojs/components";
import { useState, useCallback, useEffect } from "react";
import Taro, { useRouter, useDidShow } from "@tarojs/taro";
import { AtButton } from "taro-ui";
import { useUserStore, checkUserLoggedIn, useUIStore } from "@/store";
import MediaPicker from "@/components/MediaPicker";
import { upload, travel } from "@/services";
import "./index.scss";

// DONE: 编辑中若删除图片，OSS也要同步删除
const EditTravelPage = () => {
  const router = useRouter();
  const travelId = router.params.id;

  const userInfo = useUserStore(useCallback((state) => state.userInfo, []));
  const triggerProfileRefresh = useUIStore(
    (state) => state.triggerProfileRefresh
  );

  const [files, setFiles] = useState([]);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [initialMediaLoaded, setInitialMediaLoaded] = useState(false);

  // 加载游记详情
  useEffect(() => {
    checkUserLoggedIn();
    if (travelId) {
      setLoadingData(true);
      travel
        .getTravelDetail(travelId)
        .then((detail) => {
          if (detail) {
            setTitle(detail.title || "");
            setContent(detail.content || "");

            const mediaToLoad = [];
            if (
              detail.mediaType === "image" &&
              detail.images &&
              detail.images.length > 0
            ) {
              detail.images.forEach((imgUrl) => {
                // 注意：这里我们只有 URL，没有本地路径 tempFilePath。
                // MediaPicker 通常设计用于处理本地选择的文件。
                // 为了在编辑时显示已上传的图片/视频，MediaPicker 可能需要改造，
                // 或者我们在这里只显示预览，而不允许直接在 MediaPicker 中删除这些已在OSS上的文件。
                // 一个简单的方式是，MediaPicker 也接受已上传的URL，并能区分它们。
                // 假设 MediaPicker 可以处理 { url: ossUrl, type: 'image', ossUrl: true } 这样的对象
                mediaToLoad.push({
                  url: imgUrl,
                  type: "image",
                  ossUrl: true,
                  orientation: detail.detailType || "horizontal",
                });
              });
            } else if (detail.mediaType === "video" && detail.video) {
              mediaToLoad.push({
                url: detail.video,
                type: "video",
                ossUrl: true,
                orientation: detail.detailType || "horizontal",
              });
            }
            setFiles(mediaToLoad);
            setInitialMediaLoaded(true);
          } else {
            Taro.showToast({ title: "未找到游记信息", icon: "none" });
          }
        })
        .catch((err) => {
          console.error("加载游记详情失败:", err);
          Taro.showToast({ title: "加载游记详情失败", icon: "none" });
        })
        .finally(() => {
          setLoadingData(false);
        });
    } else {
      Taro.showToast({ title: "无效的游记ID", icon: "none" });
      setLoadingData(false);
    }
  }, [travelId]);

  const handleMediaChange = (newFiles) => {
    // 编辑时，MediaPicker 的行为可能需要调整：
    // 1. 新增的文件是本地文件。
    // 2. 已有的文件是 OSS URL。
    // MediaPicker 的 onChange 可能需要返回所有文件（包括旧的OSS URL和新的本地文件）
    setFiles(newFiles);
  };

  // 处理单个文件上传
  const uploadSingleFileToOSS = async (file) => {
    if (file.ossUrl) {
      // 如果是已上传的文件，直接返回其 URL
      return file.url;
    }
    // 如果是新文件 (没有 ossUrl 标记，或者有 tempFilePath)，则上传
    try {
      const fileUrl = await upload.uploadTempFile(file);
      return fileUrl;
    } catch (error) {
      console.error("文件上传失败:", error);
      throw error;
    }
  };

  // 更新游记
  const handleUpdate = async () => {
    if (!userInfo || !userInfo.id) {
      Taro.showToast({ title: "请先登录", icon: "none" });
      return;
    }
    if (!travelId) {
      Taro.showToast({ title: "无效的游记ID", icon: "none" });
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
      // 上传新增的文件 (MediaPicker 返回的 files 中，新文件没有 ossUrl 属性)
      const uploadedOSSUrls = await Promise.all(
        files.map((file) => uploadSingleFileToOSS(file))
      );

      const params = {
        title: title.trim(),
        content: content.trim(),
        mediaType: files.length > 0 ? files[0].type : undefined,
        detailType: files.length > 0 ? files[0].orientation : undefined,
      };

      if (params.mediaType === "image") {
        params.images = uploadedOSSUrls.filter(
          (url) => typeof url === "string"
        );
      } else if (params.mediaType === "video") {
        const videoUrl = uploadedOSSUrls.find(
          (url) =>
            typeof url === "string" &&
            files.find((f) => f.url === url)?.type === "video"
        );
        if (videoUrl) {
          params.video = videoUrl;
        } else if (files.find((f) => f.type === "video" && f.ossUrl)) {
          params.video = files.find((f) => f.type === "video" && f.ossUrl).url;
        }
      }

      if (!params.mediaType && files.length > 0) {
        params.mediaType = files[0].type;
        params.detailType = files[0].orientation;
        if (params.mediaType === "image") params.images = uploadedOSSUrls;
        else if (params.mediaType === "video")
          params.video = uploadedOSSUrls[0];
      }

      console.log("ID:", travelId, "params", travelId);
      // 调用更新 API
      await travel.updateTravel(travelId, params);

      Taro.showToast({ title: "更新成功", icon: "success" });
      triggerProfileRefresh(); // 触发 Profile 页面刷新

      Taro.switchTab({ url: "/pages/profile/index" });
    } catch (error) {
      console.error("更新失败:", error);
      Taro.showToast({ title: error.message || "更新失败", icon: "none" });
    } finally {
      setUploading(false);
    }
  };

  if (loadingData && !initialMediaLoaded) {
    // 初始加载数据时显示 loading
    return (
      <View style={{ padding: "20px", textAlign: "center" }}>
        <AtButton loading type="primary" circle>
          加载中
        </AtButton>
      </View>
    );
  }

  return (
    <View className="publish">
      <View className="publish-form">
        <Text className="form-title">编辑游记</Text>
        <View className="media-picker-container">
          <MediaPicker
            value={files}
            maxCount={9}
            onChange={handleMediaChange}
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
          onInput={(e) => setContent(e.detail.value)}
        />
        <AtButton
          className="publish-btn" // 复用样式
          type="primary"
          loading={uploading}
          onClick={handleUpdate} // 调用 handleUpdate
        >
          确认修改
        </AtButton>
      </View>
    </View>
  );
};

export default EditTravelPage;
