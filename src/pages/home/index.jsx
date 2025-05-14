import { View } from "@tarojs/components";
import { useEffect, useState, useMemo } from "react";
import SearchBar from "@/components/SearchBar";
import WaterFall from "../../components/WaterFall";
import Taro, { useDidShow, useTabItemTap } from "@tarojs/taro";
import { useUserStore, useUIStore, TAB_BAR_HOME_INDEX } from "@/store";
import "./index.scss";

const PAGE_LIMIT = 10;
const SCROLL_THRESHOLD = 400;

const Home = () => {
  const setActiveTabIndex = useUserStore((state) => state.setActiveTabIndex);
  const lastHomeRefreshTime = useUIStore((state) => state.lastHomeRefreshTime);
  const setLastTabBarTap = useUIStore((state) => state.setLastTabBarTap);

  useTabItemTap((item) => {
    console.log("[HomePage] useTabItemTap:", item);
    if (item.pagePath === "pages/home/index") {
      // 或者使用 item.index === TAB_BAR_HOME_INDEX
      setLastTabBarTap(TAB_BAR_HOME_INDEX);
    }
  });

  const waterfallKey = useMemo(
    () => `home-${lastHomeRefreshTime}`,
    [lastHomeRefreshTime]
  );

  useDidShow(() => {
    setActiveTabIndex(0);
  });

  return (
    <View className="home">
      {/* <CustomNavBar title="首页" showBackButton={false} /> */}
      <View className="page-content-wrapper">
        <View className="header">
          <SearchBar />
        </View>
        <View className="content">
          <WaterFall key={waterfallKey} itemNavigationSource="home" />
        </View>
      </View>
    </View>
  );
};

export default Home;
