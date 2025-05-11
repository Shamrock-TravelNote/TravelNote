import { View, Text, Image } from "@tarojs/components";
import { useState, useEffect } from "react";
import { AtIcon } from "taro-ui";
import Taro from "@tarojs/taro";
import travel from "@/services/api/travel";
import "./index.scss";

// TODO: 视频类型右上角添加播放icon
const TravelCard = ({ data }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  // const [imageType, setImageType] = useState('horizontal')

  useEffect(() => {
    setLikes(data.likes);
    // checkImageOrientation()
    checkLikeStatus();
  }, [data]);

  // const checkImageOrientation = () => {
  //   Taro.getImageInfo({
  //     src: data.cover,
  //     success: (res) => {
  //       const { width, height } = res
  //       setImageType(height > width ? 'vertical' : 'horizontal')
  //     }
  //   })
  // }

  // 检查点赞状态
  const checkLikeStatus = async () => {
    try {
      const res = await travel.checkLikeStatus(data.id);
      setIsLiked(res.isLiked);
      setLikes(res.likes);
    } catch (error) {
      console.error("获取点赞状态失败:", error);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation(); // 阻止事件冒泡
    try {
      const res = await travel.toggleLike(data.id);
      setIsLiked((prev) => !prev);
      setLikes(res.likes);
    } catch (error) {
      Taro.showToast({
        title: "操作失败",
        icon: "none",
      });
    }
  };

  const handleCardClick = () => {
    Taro.navigateTo({
      url: `/packageFeature/pages/detail/index?id=${data.id}
`,
    });
  };

  // 构建卡片的动态类名
  let cardClassName = "travel-card";
  if (data.detailType === "vertical") {
    cardClassName += " vertical-card-style";
  } else {
    cardClassName += " horizontal-card-style";
  }

  // 根据 status 添加额外的类名
  if (data.status === "pending") {
    cardClassName += " status-pending";
  } else if (data.status === "rejected") {
    cardClassName += " status-rejected";
  }

  return (
    <View className={cardClassName} onClick={handleCardClick}>
      <View className="card-image-container">
        <Image
          className="card-image"
          src={data.cover}
          mode="aspectFill"
          lazyLoad
        />
        {data.mediaType === "video" && (
          <View className="play-icon-container">
            <AtIcon value="play" size="20" color="#fff" />
          </View>
        )}
        {data.status && data.status !== "approved" && (
          <View className={`status-overlay status-overlay-${data.status}`}>
            <Text className="status-overlay-text">
              {data.status === "pending"
                ? "审核中"
                : data.status === "rejected"
                ? "未通过"
                : ""}
            </Text>
          </View>
        )}
      </View>
      <View className="card-content">
        <Text className="title" numberOfLines={2}>
          {data.title}
        </Text>
        <View className="bottom-row">
          <View className="author-info">
            <Image className="avatar" src={data.author.avatar} />
            <Text className="author-name">{data.author.nickname}</Text>
          </View>
          <View className="like-btn" onClick={handleLike}>
            <AtIcon
              value={isLiked ? "heart-2" : "heart"}
              size="18"
              color={isLiked ? "#ff4757" : "#666"}
            />
            <Text className="like-count">{likes}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TravelCard;
