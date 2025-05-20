import { View, Text, Image } from "@tarojs/components";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { AtIcon } from "taro-ui";
import Taro from "@tarojs/taro";
import travel from "@/services/api/travel";
import "./index.scss";

// DONE: 视频类型右上角添加播放icon
const TravelCard = React.memo(
  ({ data, navigationSource = "unknown" }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likes, setLikes] = useState(0);
    const [showMedia, setShowMedia] = useState(false); // 控制是否显示媒体
    const cardRef = useRef(null); // 用于 IntersectionObserver
    const observerRef = useRef(null);
    const cardId = useRef(`travel-card-${data.id}`);

    useEffect(() => {
      setLikes(data.likes);
      checkLikeStatus();
    }, [data]);

    useEffect(() => {
      observerRef.current = Taro.createIntersectionObserver(this);
      observerRef.current
        .relativeToViewport({ bottom: 50 })
        .observe(`#${cardId.current}`, () => {
          setShowMedia(true);
          if (observerRef.current) {
            observerRef.current.disconnect();
          }
        });

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }, []);

    // 检查点赞状态
    const checkLikeStatus = useCallback(async () => {
      try {
        const res = await travel.checkLikeStatus(data.id);
        setIsLiked(res.isLiked);
        setLikes(res.likes);
      } catch (error) {
        console.error("获取点赞状态失败:", error);
      }
    }, [data.id]);

    const handleLike = useCallback(
      async (e) => {
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
      },
      [data.id]
    );

    const handleCardClick = useCallback(() => {
      let url = `/packageFeature/pages/detail/index?id=${data.id}`;
      if (navigationSource) {
        url += `&from=${navigationSource.itemNavigationSource}`;
      }
      Taro.navigateTo({
        url: url.replace(/\s+/g, ""),
      });
    }, [data.id, navigationSource]);

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
      <View
        className={cardClassName}
        onClick={handleCardClick}
        ref={cardRef}
        id={cardId.current}
      >
        <View className="card-image-container">
          {showMedia ? (
            <Image
              className="card-image"
              src={data.cover}
              mode="aspectFill"
              lazyLoad
            />
          ) : (
            <View className="card-image-placeholder" />
          )}
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
  },
  (prevProps, nextProps) => {
    return (
      prevProps.data.id === nextProps.data.id &&
      prevProps.navigationSource === nextProps.navigationSource
    );
  }
);

export default React.memo(TravelCard);
