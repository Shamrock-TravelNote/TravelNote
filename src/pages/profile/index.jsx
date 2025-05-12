import { View, Text, Image } from "@tarojs/components";
import { useTabItemTap } from "@tarojs/taro";
import { useState, useMemo, useEffect } from "react";
import {
  useUserStore,
  checkUserLoggedIn,
  useUIStore,
  TAB_BAR_PROFILE_INDEX,
} from "@/store";
import TravelPane from "@/components/TravelPane";
import WaterFall from "@/components/WaterFall";
import "./index.scss";

const TAB_LIST_DEFINTION_PROFILE = [
  { title: "我的游记", status: "approved" },
  { title: "等待审核", status: "pending" },
  { title: "违规游记", status: "rejected" },
];

// DONE：添加筛选通过、待定、拒绝
const Profile = () => {
  const [current, setCurrent] = useState(0);

  const userInfo = useUserStore((state) => state.userInfo);
  const activeTabIndex = useUserStore((state) => state.activeTabIndex);
  const setActiveTabIndex = useUserStore((state) => state.setActiveTabIndex);

  const lastProfileRefreshTime = useUIStore(
    (state) => state.lastProfileRefreshTime
  );
  const setLastTabBarTap = useUIStore((state) => state.setLastTabBarTap);

  useTabItemTap((item) => {
    console.log("[ProfilePage] useTabItemTap:", item);
    if (item.pagePath === "pages/profile/index") {
      setLastTabBarTap(TAB_BAR_PROFILE_INDEX);
    }
  });

  const waterfallKey = useMemo(() => {
    console.log(
      "[Profile waterfallKey] current:",
      current,
      "typeof current:",
      typeof current
    );
    if (
      !tabListDefinition ||
      typeof current !== "number" ||
      current < 0 ||
      current >= tabListDefinition.length
    ) {
      console.warn(
        "[Profile waterfallKey WARN] Invalid current index or tabListDefinition for key generation. current:",
        current,
        "tabListDefinition:",
        tabListDefinition
      );
      // 返回一个备用/默认 key，或者根据情况抛出错误或记录更详细信息
      return `profile-${lastProfileRefreshTime}-invalid-${Date.now()}`;
    }

    const status = tabListDefinition[current]?.status || "default";
    const key = `profile-${lastProfileRefreshTime}-${current}-${status}`;
    // console.log('[Profile waterfallKey CALC] Generated key:', key);
    return key;
  }, [lastProfileRefreshTime, current]);

  // 定义标签页列表
  const tabListDefinition = TAB_LIST_DEFINTION_PROFILE;

  useEffect(() => {
    checkUserLoggedIn();
    if (activeTabIndex !== 2) {
      setActiveTabIndex(2);
    }
  }, [setActiveTabIndex]);

  const userStats = {
    posts: 12,
    followers: 234,
    following: 345,
  };

  // 使用 useMemo 缓存游记数据
  const activeWaterFallInstance = useMemo(() => {
    console.log(
      "[Profile activeWaterFallInstance] current:",
      current,
      "typeof current:",
      typeof current
    );
    if (!tabListDefinition[current]) return null;

    console.log(
      `[Profile Page] Rendering WaterFall for tab index ${current} with statusFilter: ${tabListDefinition[current].status}`
    );

    return (
      <WaterFall
        key={waterfallKey}
        isProfile={true}
        statusFilter={tabListDefinition[current].status}
        itemNavigationSource="profile"
      />
    );
  }, [current, waterfallKey]);

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
