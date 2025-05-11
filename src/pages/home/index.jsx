import { View } from "@tarojs/components";
import { useEffect, useState } from "react";
import CustomNavBar from "@/components/CustomNavBar";
import SearchBar from "@/components/SearchBar";
// import TravelCard from '@/components/TravelCard'
import WaterFall from "../../components/WaterFall";
// import travel from '@/services/api/travel'
import Taro, { useDidShow, usePullDownRefresh } from "@tarojs/taro";
import { useUserStore } from "@/store";
// import React from 'react'
import "./index.scss";

const PAGE_LIMIT = 10;
const SCROLL_THRESHOLD = 400;

// const WaterfallItem = React.memo(({ id, index, data }) => {
//   const note = data[index]
//   return <TravelCard key={note.id} data={note} />
// })

const Home = () => {
  // const scrollViewRef = useRef(null)
  // const [scrollViewHeight, setScrollViewHeight] = useState('100vh')

  const setActiveTabIndex = useUserStore((state) => state.setActiveTabIndex);
  const [navBarInfo, setNavBarInfo] = useState({
    // 用于存储导航栏相关信息
    statusBarHeight: 0,
    navBarHeight: 0,
    menuButtonWidth: 0,
  });
  // const [travelNotes, setTravelNotes] = useState([])
  // const [loading, setLoading] = useState(false)
  // const [currentPage, setCurrentPage] = useState(1)
  // const [hasMore, setHasMore] = useState(true)

  // const gridAutoRows = 5; // As defined in your CSS! IMPORTANT
  // const verticalCardHeight = 550; // As defined in your CSS!
  // const horizontalCardHeight = 390; // As defined in your CSS!

  // 计算单项高度逻辑，与原 Grid 计算保持一致
  // const getItemSize = index => {
  //   const note = travelNotes[index]
  //   return note.mediaType === 'video'
  //     ? (note.detailType === 'vertical' ? 540 : 380)
  //     : (note.detailType === 'vertical' ? 520 : 360)
  // }

  useEffect(() => {
    // 在页面加载时获取胶囊按钮信息
    try {
      const menuButton = Taro.getMenuButtonBoundingClientRect();
      const systemInfo = Taro.getSystemInfoSync(); // 获取系统信息，主要为了状态栏高度的备用方案
      const statusBarHeight = menuButton.top || systemInfo.statusBarHeight || 0;
      // 导航栏内容区域高度（不含状态栏），简单起见可以设为胶囊高度，或根据设计调整
      const navContentHeight = menuButton.height || 32;
      // 整个导航栏的高度（含状态栏）
      const navBarTotalHeight = statusBarHeight + navContentHeight + 8; // 假设上下有4px的padding

      setNavBarInfo({
        statusBarHeight: statusBarHeight,
        navBarHeight: navBarTotalHeight, // 自定义导航栏的总高度
        menuButtonWidth: menuButton.width || 87,
      });
    } catch (e) {
      console.error("获取导航栏信息失败:", e);
      // 可以设置一个默认值
      const systemInfo = Taro.getSystemInfoSync();
      const statusBarHeight = systemInfo.statusBarHeight || 20; // 默认20px状态栏
      const navContentHeight = 32; // 默认导航内容区高度
      setNavBarInfo({
        statusBarHeight: statusBarHeight,
        navBarHeight: statusBarHeight + navContentHeight + 8,
        menuButtonWidth: 87,
      });
    }
  }, []);

  useDidShow(() => {
    setActiveTabIndex(0);
  });

  // useEffect(() => {
  //   fetchTravelNotes(1, true)
  //   Taro.nextTick(() => {
  //     const query = Taro.createSelectorQuery();
  //     query.select('.scroll-view').boundingClientRect(rect => {
  //       if (rect) {
  //         console.log('height:', rect.height)
  //         setScrollViewHeight(rect.height);
  //       }
  //     }).exec();
  //   });
  // }, [])

  // useEffect(() => {
  //       if (cardRefs.current && cardRefs.current.length > 0) {
  //           cardRefs.current.forEach((cardRef, index) => {
  //               if (cardRef) {
  //                   handleSetGridRowEnd(index);
  //               }
  //           });
  //       }
  //   }, [travelNotes]);

  // const fetchTravelNotes = async (pageToFetch, isRefresh = false) => {
  //   if (loading || (!isRefresh && !hasMore)) {
  //     return
  //   }

  //   setLoading(true)
  //   try {
  //     // 获取游记列表
  //     const response = await travel.getTravelList({ page: pageToFetch, limit: PAGE_LIMIT })

  //     const newTravelNotes = response.data || []
  //     const totalNotes = response.total || 0

  //     // console.log(`获取第 ${pageToFetch} 页游记列表`, newTravelNotes)

  //     setTravelNotes(prevNotes => {
  //       return isRefresh ? newTravelNotes : [...prevNotes, ...newTravelNotes]
  //     })

  //     // 更新是否有更多数据
  //     const currentTotalLength = isRefresh ? newTravelNotes.length : (travelNotes.length + newTravelNotes.length);
  //     setHasMore(currentTotalLength < totalNotes);

  //     // 如果是刷新操作，重置当前页码
  //     if (newTravelNotes.length > 0 || isRefresh) {
  //       setCurrentPage(isRefresh ? 1 : pageToFetch);
  //     }

  //   } catch (error) {
  //     console.error(`获取游记列表第 ${pageToFetch} 页失败`, error)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  // const handleScroll = (event) => {
  //   if (!hasMore || loading || !scrollViewHeight) return;

  //   const { scrollTop, scrollHeight } = event.detail;
  //   // console.log(scrollTop, scrollHeight, scrollViewHeight);

  //   if (scrollTop + scrollViewHeight >= scrollHeight - SCROLL_THRESHOLD) {
  //     console.log('滚动接近底部，提前加载更多');
  //     fetchTravelNotes(currentPage + 1);
  //   }
  // };

  // useReachBottom(() => {
  //   console.log('触底加载更多')
  //   if (hasMore && !loading) {
  //     fetchTravelNotes(currentPage + 1)
  //   }
  // })

  // usePullDownRefresh(async() => {
  //   console.log('下拉刷新')
  //   setCurrentPage(1)
  //   setHasMore(true)
  //   await fetchTravelNotes(1, true)
  //   Taro.stopPullDownRefresh()
  // })

  // // 虚拟瀑布流触底加载
  // const handleScrollToLower = () => {
  //   if (hasMore && !loading) fetchTravelNotes(currentPage + 1)
  // }

  // const handleSetGridRowEnd = useCallback((index) => {
  //       if (!cardRefs.current) return;
  //       const cardRef = cardRefs.current[index];
  //       if (!cardRef) return;
  //       const height = cardRef.offsetHeight;
  //       cardRef.style.gridRowEnd = `span ${Math.ceil(height)}`;
  //   }, []);

  const pageContentStyle = {
    paddingTop: `${navBarInfo.navBarHeight}px`, // 使用获取到的导航栏高度
    height: `calc(100vh - ${navBarInfo.navBarHeight}px)`, // 确保内容区域占满剩余高度
    overflowY: "auto", // 如果内容超出一屏，允许滚动
  };

  return (
    <View className="home">
      <CustomNavBar title="首页" showBackButton={false} />
      <View className="page-content-wrapper" style={pageContentStyle}>
        <View className="header">
          <SearchBar />
        </View>
        <View className="content">
          <WaterFall />
        </View>
      </View>
    </View>
  );
};

export default Home;
