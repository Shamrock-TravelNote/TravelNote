import {
  View,
  Text,
  Button,
  Image,
  Swiper,
  SwiperItem,
  Video,
} from "@tarojs/components";
import Taro, { useDidShow, useRouter, useShareAppMessage } from "@tarojs/taro";
import { useState, useEffect } from "react";
import { useUserStore, checkUserLoggedIn } from "@/store";
import { travel } from "@/services";
import { AtActivityIndicator, AtIcon } from "taro-ui";
import { useUIStore } from "@/store/uiStore";
import "./index.scss";

// DONE: API获取数据
// TODO: 评论区（待定）【考虑新增数据库schema】
// DONE：支持视频播放（最好是内嵌式）
// DONE：待定、拒绝类型下方显示状态或者拒绝理由
// DONE: 分享功能
// DONE: 支持笔记编辑、删除功能
const TravelDetail = () => {
  const [travelDetail, setTravelDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const router = useRouter();
  const id = router.params.id;
  const itemNavigationSource = router.params.from;
  console.log("parms", router.params);
  const userInfo = useUserStore((state) => state.userInfo);
  const triggerProfileRefresh = useUIStore(
    (state) => state.triggerProfileRefresh
  );

  useEffect(() => {
    // 使用 useEffect 来替代 useDidShow 进行初次加载和ID变化时的加载
    if (id) {
      fetchTravelDetail();
    } else {
      setError("游记ID不存在");
      setLoading(false);
    }
  }, [id]); // 当 id 变化时重新执行

  useShareAppMessage((res) => {
    // res.from === 'button' 表示用户点击了页面内的分享按钮（如果按钮触发了分享）
    // res.from === 'menu' 表示用户点击了右上角的转发菜单
    // res.target (如果 from === 'button') 是触发分享的 button 组件的 dataset

    if (!travelDetail) {
      // 如果游记数据还未加载完成，可以返回一个默认的分享信息
      return {
        title: "发现一篇精彩游记！",
        path: `/packageFeature/pages/detail/index?id=${id}`,
        // imageUrl: "默认的分享图片URL",
      };
    }

    const shareTitle = travelDetail.title || "这篇游记太棒了，快来看看！";
    const shareImageUrl =
      travelDetail.cover ||
      (travelDetail.images && travelDetail.images.length > 0
        ? travelDetail.images[0]
        : "你的默认分享图片URL");

    const sharePath = `/packageFeature/pages/detail/index?id=${travelDetail.id}`;

    console.log("[TravelDetail] onShareAppMessage triggered:", {
      title: shareTitle,
      path: sharePath,
      imageUrl: shareImageUrl,
      from: res.from,
    });

    return {
      title: shareTitle,
      path: sharePath,
      imageUrl: shareImageUrl,
    };
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
        checkInitialLikeStatus(response.id, response.likes);
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

  const checkInitialLikeStatus = async (id, initialLikes = 0) => {
    if (!id) return;
    setLikeCount(initialLikes);
    try {
      const response = await travel.checkLikeStatus(id);
      setIsLiked(response.isLiked);
      setLikeCount(response.likes);
    } catch (error) {
      console.error("获取初始点赞状态失败:", err);
    }
  };

  const handleImagePreview = (currentUrl) => {
    if (travelDetail && travelDetail.images && travelDetail.images.length > 0) {
      Taro.previewImage({
        current: currentUrl, // 当前显示图片的http链接
        urls: travelDetail.images, // 需要预览的图片http链接列表
        success: () => {
          console.log("图片预览成功");
        },
        fail: (err) => {
          console.error("图片预览失败:", err);
          Taro.showToast({
            title: "图片预览失败",
            icon: "none",
          });
        },
      });
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

  const handleEdit = () => {
    if (!travelDetail || !travelDetail.id) return;
    Taro.navigateTo({
      url: `/packageFeature/pages/edit/index?id=${travelDetail.id}`,
    });
  };

  const handleDelete = () => {
    if (!travelDetail || !travelDetail.id) return;
    Taro.showModal({
      title: "确认删除",
      content: "您确定要删除这篇游记吗？\n温馨提示：删除后的数据不能恢复！",
      confirmText: "确定删除",
      cancelText: "我再想想",
      confirmColor: "#e64340",
      success: async function (res) {
        if (res.confirm) {
          try {
            Taro.showLoading({ title: "删除中..." });
            await travel.deleteTravel(travelDetail.id);
            Taro.hideLoading();
            Taro.showToast({
              title: "删除成功",
              icon: "success",
              duration: 2000,
            });

            triggerProfileRefresh();

            Taro.switchTab({
              url: "/pages/profile/index",
            });
          } catch (error) {
            Taro.hideLoading();
            console.error("删除游记失败:", error);
            Taro.showToast({
              title: error?.message || "删除失败，请稍后再试",
              icon: "none",
              duration: 2000,
            });
          }
        } else if (res.cancel) {
          console.log("用户点击取消");
        }
      },
      fail: function (err) {
        console.error("showModal调用失败:", err);
        Taro.showToast({
          title: "操作取消或出现错误",
          icon: "none",
        });
      },
    });
  };

  const handleShare = () => {
    console.log("分享功能");
    // 仅在微信小程序环境
    if (process.env.TARO_ENV === "weapp") {
      console.log("weixin");
      Taro.showShareMenu({
        withShareTicket: false,
        menus: ["shareAppMessage", "shareTimeline"],
      }).catch((err) => {
        console.warn("showShareMenu fail", err);
        Taro.showToast({ title: "请点击右上角进行分享", icon: "none" });
      });
    } else {
      console.log("can not");
      Taro.showToast({
        title: "分享功能暂未完全适配此平台，可尝试右上角菜单分享",
        icon: "none",
      });
    }
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

  const {
    title,
    author,
    createdAt,
    images,
    video,
    cover,
    mediaType,
    detailType,
    content,
    authorId,
    status,
    rejectionReason,
  } = travelDetail;

  const isAuthor = userInfo && authorId && userInfo.id === authorId;

  const canShowEditDeleteActions =
    isAuthor && itemNavigationSource === "profile";

  return (
    <View className="travel-detail">
      <View className="detail-header">
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
      <View className={`media-content-area ${detailType || "horizontal"}`}>
        {mediaType === "image" && images && images.length > 0 && (
          <Swiper
            className={`cover-swiper ${detailType || "vertical"}`}
            indicatorDots
            indicatorColor="rgba(255, 255, 255, .5)"
            indicatorActiveColor="#ffffff"
            autoplay={false}
            circular
            previousMargin="0px" // 确保全宽
            nextMargin="0px" // 确保全宽
          >
            {images.map((image, index) => (
              <SwiperItem
                key={index}
                className="swiper-item-full"
                onClick={() => handleImagePreview(image)}
              >
                <Image className="swiper-image" src={image} mode="aspectFit" />
              </SwiperItem>
            ))}
          </Swiper>
        )}
        {mediaType === "video" && video && (
          <Video
            className={`detail-video-player ${detailType || "horizontal"}`}
            src={video}
            controls
            autoplay={false} // 是否自动播放，建议false
            poster={cover || ""}
            loop={false}
            muted={false}
            // initialTime={0} // 指定视频初始播放位置
            // objectFit="contain" // 'contain' (默认) 或 'fill' 或 'cover'
            onError={(e) => console.error("Video Error:", e.detail.errMsg)}
          />
        )}
      </View>
      <View className="detail-content">
        <Text className="title">{title || "游记标题加载中..."}</Text>
        <Text className="content-text" user-select>
          {content || "游记内容加载中..."}
        </Text>
      </View>
      {isAuthor && status && status !== "approved" && (
        <View
          className={`status-notice-area ${
            status === "pending" ? "status-pending" : "status-rejected"
          }`}
        >
          {status === "pending" && (
            <Text className="status-text">状态：您的笔记正在等待审核中...</Text>
          )}
          {status === "rejected" && (
            <View>
              <Text className="status-text status-text-title">
                状态：笔记审核未通过
              </Text>
              {rejectionReason && (
                <Text className="status-text rejection-reason">
                  原因：{rejectionReason}
                </Text>
              )}
              {!rejectionReason && (
                <Text className="status-text rejection-reason">
                  原因：暂无具体原因，请联系管理员。
                </Text>
              )}
            </View>
          )}
        </View>
      )}
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
          <Button
            className="action-item share-button-custom"
            openType="share"
            onClick={handleShare}
            // style={{
            //   margin: 0,
            //   border: "none !important",
            //   backgroundColor: "white",
            // }}
          >
            <AtIcon value="share" size="20" />
            <Text className="action-text">分享</Text>
          </Button>
          {canShowEditDeleteActions && (
            <>
              <View className="action-item" onClick={handleEdit}>
                <AtIcon value="edit" size="20" color="#666" />
                <Text className="action-text">编辑</Text>
              </View>
              <View className="action-item" onClick={handleDelete}>
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
