import { View, Text, Image } from "@tarojs/components";
import Taro, { useTabItemTap } from "@tarojs/taro";
import { useState, useMemo, useEffect } from "react";
import {
  useUserStore,
  checkUserLoggedIn,
  useUIStore,
  TAB_BAR_PROFILE_INDEX,
} from "@/store";
import TravelPane from "@/components/TravelPane";
import WaterFall from "@/components/WaterFall";
import { upload, auth } from "@/services";
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
  const setUserInfo = useUserStore((state) => state.setUserInfo);
  const activeTabIndex = useUserStore((state) => state.activeTabIndex);
  const setActiveTabIndex = useUserStore((state) => state.setActiveTabIndex);

  const lastProfileRefreshTime = useUIStore(
    (state) => state.lastProfileRefreshTime
  );
  const setLastTabBarTap = useUIStore((state) => state.setLastTabBarTap);
  const triggerProfileRefresh = useUIStore(
    (state) => state.triggerProfileRefresh
  );

  const [displayAvatar, setDisplayAvatar] = useState(userInfo.avatar);

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
    setDisplayAvatar(userInfo.avatar);
  }, [setActiveTabIndex, userInfo.avatar]);

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

  const handleChangeAvatar = async () => {
    console.log("usrindo", userInfo);
    if (!userInfo || !userInfo.id) {
      Taro.showToast({ title: "请先登录", icon: "none" });
      checkUserLoggedIn();
      return;
    }
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
      });

      const tempFilePath = res.tempFilePaths[0];
      setDisplayAvatar(tempFilePath);

      Taro.showLoading({ title: "上传中..." });

      const fileToUpload = { url: tempFilePath, type: "image" };
      const newOssAvatarUrl = await upload.uploadTempFile(fileToUpload);

      if (newOssAvatarUrl) {
        await auth.updateUserProfile({
          avatar: newOssAvatarUrl,
        });

        setUserInfo({ ...userInfo, avatar: newOssAvatarUrl });
        setDisplayAvatar(newOssAvatarUrl);

        Taro.hideLoading();
        Taro.showToast({ title: "头像更新成功！", icon: "success" });

        triggerProfileRefresh();
      } else {
        Taro.hideLoading();
        Taro.showToast({ title: "头像上传失败", icon: "error" });
        setDisplayAvatar(
          userInfo?.avatar ||
            "https://travelnote-data.oss-cn-nanjing.aliyuncs.com/Gemini_Generated_Image_49ztd749ztd749zt.jpeg"
        );
      }
    } catch (err) {
      Taro.hideLoading();
      if (err.errMsg === "chooseImage:fail cancel") {
        console.log("用户取消选择头像");
        setDisplayAvatar(
          userInfo?.avatar ||
            "https://travelnote-data.oss-cn-nanjing.aliyuncs.com/Gemini_Generated_Image_49ztd749ztd749zt.jpeg"
        );
      } else if (err.message && err.message.includes("请先登录")) {
        checkUserLoggedIn();
      } else {
        Taro.showToast({
          title: err.data?.message || err.message || "操作失败",
          icon: "none",
        });
        setDisplayAvatar(
          userInfo?.avatar ||
            "https://travelnote-data.oss-cn-nanjing.aliyuncs.com/Gemini_Generated_Image_49ztd749ztd749zt.jpeg"
        );
        console.error("更换头像失败:", err);
      }
    }
  };

  return (
    <View className="profile">
      <View className="user-info">
        <View className="avatar-wrapper" onClick={handleChangeAvatar}>
          <Image
            className="avatar"
            mode="aspectFill"
            lazyLoad
            src={displayAvatar}
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
