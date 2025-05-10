import { View, Text, Image, Swiper, SwiperItem } from "@tarojs/components";
import Tarp, { useDidShow, useRouter } from "@tarojs/taro";
import { useState, useEffect } from "react";
import { useUserStore, checkUserLoggedIn } from "@/store";
import { travel } from "@/services";
import { AtActivityIndicator, AtIcon } from "taro-ui";
import "./index.scss";

// TODO: API获取数据
// TODO: 评论区（待定）
const TravelDetail = () => {
  const [travelDetail, setTravelDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const router = useRouter();
  const id = router.params.id;
  const userInfo = useUserStore((state) => state.userInfo);

  useDidShow(() => {
    checkUserLoggedIn();
    if (id) {
      fetchTravelDetail();
      checkInitialLikeStatus();
    } else {
      setError("游记ID不存在");
      setLoading(false);
    }
  });

  const fetchTravelDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const response = await travel.getTravelDetail(id);
      console.log("detailData:", response);
      if (response) {
        setTravelDetail(response);
      } else {
        setError("未找到游记详细");
      }
    } catch (error) {
      console.error("加载详细笔记数据失败：", error);
      setError(error.message || "加载详细笔记数据失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const checkInitialLikeStatus = async () => {
    if (!id) return;
    try {
      const response = await travel.checkLikeStatus(id);
      setIsLiked(response.isLiked);
      setLikeCount(response.likes);
    } catch (error) {
      console.error("获取初始点赞状态失败:", err);
    }
  };

  const handleLike = async () => {
    if (!id || !checkUserLoggedIn()) return;
    try {
      const res = await travel.toggleLike(id);
      setIsLiked((prev) => !prev);
      setLikeCount(res.likes);
      Taro.showToast({
        title: isLiked ? "取消点赞" : "点赞成功",
        icon: "success",
        duration: 1000,
      });
    } catch (error) {
      Taro.showToast({
        title: "操作失败",
        icon: "none",
      });
    }
  };

  const handleShare = () => {
    Taro.showShareMenu({ withShareTicket: true }); // 开启转发
    // 或者直接触发自定义分享逻辑
    Taro.showToast({ title: "请点击右上角进行分享", icon: "none" });
  };

  if (loading) {
    return (
      <View className="loading-container">
        <AtActivityIndicator mode="center" content="加载中..." />
      </View>
    );
  }

  if (error) {
    return (
      <View className="error-container">
        <Text>{error}</Text>
        <Button onClick={fetchTravelDetail}>重试</Button>
      </View>
    );
  }

  if (!travelDetail) {
    return (
      <View className="empty-container">
        <Text>游记不存在或已被删除</Text>
      </View>
    );
  }

  const { title, author, createdAt, images, content } = travelDetail;

  return (
    <View className="travel-detail">
      <View className="detail-header">
        <Text className="title">{title || "游记标题加载中..."}</Text>
        <View className="author-info-bar">
          {author?.avatar && (
            <Image
              className="author-avatar"
              src={author.avatar}
              mode="aspectFill"
            />
          )}
          <View className="author-text-info">
            <Text className="author-name">
              {author?.nickname || "匿名作者"}
            </Text>
            <Text className="publish-date">
              {createdAt
                ? new Date(createdAt).toLocaleDateString()
                : "未知日期"}
            </Text>
          </View>
        </View>
      </View>
      {images && images.length > 0 && (
        <Swiper
          className="cover-swiper"
          indicatorDots
          indicatorColor="rgba(255, 255, 255, .5)"
          indicatorActiveColor="#ffffff"
          autoplay
          circular
          previousMargin="0px" // 确保全宽
          nextMargin="0px" // 确保全宽
        >
          {images.map((image, index) => (
            <SwiperItem key={index} className="swiper-item-full">
              <Image className="swiper-image" src={image} mode="aspectFill" />
            </SwiperItem>
          ))}
        </Swiper>
      )}
      <View className="detail-content">
        <Text className="content-text" selectable>
          {content || "游记内容加载中..."}
        </Text>
      </View>
      <View className="detail-footer">
        <View className="action-bar">
          <View className="action-item" onClick={handleLike}>
            <AtIcon
              value={isLiked ? "heart-2" : "heart"}
              size="20"
              color={isLiked ? "#ff4757" : "#666"}
            />
            <Text className="action-text">
              {likeCount > 0 ? likeCount : "点赞"}
            </Text>
          </View>
          <View
            className="action-item"
            onClick={() =>
              Taro.showToast({ title: "评论功能开发中", icon: "none" })
            }
          >
            <AtIcon value="message" size="20" color="#666" />
            <Text className="action-text">评论</Text>
          </View>
          <View className="action-item" onClick={handleShare}>
            <AtIcon value="share" size="20" color="#666" />
            <Text className="action-text">分享</Text>
          </View>
          {userInfo && travelDetail.authorId === userInfo.id && (
            <>
              <View
                className="action-item"
                onClick={() =>
                  Taro.showToast({ title: "编辑功能开发中", icon: "none" })
                }
              >
                <AtIcon value="edit" size="20" color="#666" />
                <Text className="action-text">编辑</Text>
              </View>
              <View
                className="action-item"
                onClick={() =>
                  Taro.showToast({ title: "删除功能开发中", icon: "none" })
                }
              >
                <AtIcon value="trash" size="20" color="#E93B3D" />
                <Text className="action-text">删除</Text>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default TravelDetail;
