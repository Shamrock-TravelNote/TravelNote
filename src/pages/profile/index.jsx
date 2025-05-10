import { View, Text, Image } from "@tarojs/components";
// import Taro, { useDidShow } from "@tarojs/taro";
import { useState, useMemo, useEffect } from "react";
import { useUserStore, checkUserLoggedIn } from "@/store";
import TravelPane from "@/components/TravelPane";
import WaterFall from "@/components/WaterFall";
import "./index.scss";

// DONE：添加筛选通过、待定、拒绝
const Profile = () => {
  const [current, setCurrent] = useState(0);
  const userInfo = useUserStore((state) => state.userInfo);
  const activeTabIndex = useUserStore((state) => state.activeTabIndex);
  const setActiveTabIndex = useUserStore((state) => state.setActiveTabIndex);

  const getItemSize = (index) => {
    const note = travelNotesByTab[current][index];
    return note.mediaType === "video"
      ? note.detailType === "vertical"
        ? 540
        : 380
      : note.detailType === "vertical"
      ? 520
      : 360;
  };

  // 定义标签页列表
  const tabListDefinition = [
    { title: "我的游记", status: "approved" },
    { title: "等待审核", status: "pending" },
    { title: "违规游记", status: "rejected" },
  ];

  useEffect(() => {
    checkUserLoggedIn();
    if (activeTabIndex !== 2) {
      setActiveTabIndex(2);
    }
  }, [setActiveTabIndex]);

  // 模拟游记数据
  const mockTravelNotes = [
    {
      id: 1,
      title: "杭州西湖三日游",
      cover: "https://example.com/cover1.jpg",
      author: "旅行者001",
      authorAvatar: "https://example.com/avatar1.jpg",
      likes: 128,
      views: 1234,
    },
    {
      id: 2,
      title: "北京故宫一日游",
      cover: "https://example.com/cover2.jpg",
      author: "旅行者001",
      authorAvatar: "https://example.com/avatar1.jpg",
      likes: 256,
      views: 2345,
    },
  ];

  const userStats = {
    posts: 12,
    followers: 234,
    following: 345,
  };

  // 使用 useMemo 缓存游记数据
  const activeWaterFallInstance = useMemo(() => {
    if (!tabListDefinition[current]) return null;

    console.log(
      `[Profile Page] Rendering WaterFall for tab index ${current} with statusFilter: ${tabListDefinition[current].status}`
    );
    return (
      <WaterFall
        isProfile={true}
        statusFilter={tabListDefinition[current].status}
      />
    );
  }, [current, tabListDefinition]);

  const atTabsFormattedTabList = useMemo(
    () => tabListDefinition.map((tab) => ({ title: tab.title })),
    [tabListDefinition]
  );

  return (
    <View className="profile">
      <View className="user-info">
        <View className="avatar-wrapper">
          <Image
            className="avatar"
            mode="aspectFill"
            lazyLoad
            src={
              userInfo?.avatar ||
              "https://travelnote-data.oss-cn-nanjing.aliyuncs.com/Gemini_Generated_Image_49ztd749ztd749zt.jpeg"
            }
          />
        </View>
        <Text className="nickname">{userInfo?.nickname || "旅行者"}</Text>
      </View>
      <View className="user-stats">
        <View className="stat-item">
          <Text className="number">{userStats.posts}</Text>
          <Text className="label">游记</Text>
        </View>
        <View className="stat-item">
          <Text className="number">{userStats.followers}</Text>
          <Text className="label">关注者</Text>
        </View>
        <View className="stat-item">
          <Text className="number">{userStats.following}</Text>
          <Text className="label">关注中</Text>
        </View>
      </View>
      <View className="action-list">
        <TravelPane
          current={current}
          onClick={(index) => setCurrent(index)}
          tabList={atTabsFormattedTabList}
          className="travel-list"
        >
          {activeWaterFallInstance}
        </TravelPane>
      </View>
    </View>
  );
};

export default Profile;
