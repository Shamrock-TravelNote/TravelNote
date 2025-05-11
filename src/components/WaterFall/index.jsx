import { View, ScrollView, GridView } from "@tarojs/components";
import { AtLoadMore } from "taro-ui";
import { useEffect, useRef, useState } from "react";
import TravelCard from "@/components/TravelCard";
import travel from "@/services/api/travel";
import Taro, { usePullDownRefresh } from "@tarojs/taro";
// import { useUserStore } from '@/store'
import "./index.scss";

const PAGE_LIMIT = 10;
const SCROLL_THRESHOLD = 400;

// TODO：支持用户下拉界面更新整体数据
// DONE：支持三种状态的笔记
const WaterFall = ({
  keyword = "",
  isProfile = false,
  statusFilter = "approved",
}) => {
  const scrollViewRef = useRef(null);
  const isLoadingMore = useRef(false);
  const [scrollViewHeight, setScrollViewHeight] = useState("100vh");

  const [travelNotes, setTravelNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 计算单项高度逻辑，与原 Grid 计算保持一致
  const getItemSize = (index) => {
    const note = travelNotes[index];
    if (!note) return 360;
    return note.mediaType === "video"
      ? note.detailType === "vertical"
        ? 540
        : 380
      : note.detailType === "vertical"
      ? 520
      : 360;
  };

  useEffect(() => {
    fetchTravelNotes(1, true);
    Taro.nextTick(() => {
      const query = Taro.createSelectorQuery();
      query
        .select(".scroll-view")
        .boundingClientRect((rect) => {
          if (rect) {
            console.log("height:", rect.height);
            setScrollViewHeight(rect.height);
          }
        })
        .exec();
    });
  }, []);

  const fetchTravelNotes = async (pageToFetch, isRefresh = false) => {
    if (
      (isLoadingMore.current && pageToFetch !== 1) ||
      (!isRefresh && !hasMore)
    ) {
      return;
    }

    isLoadingMore.current = true;
    setLoading(true);

    try {
      let response;
      const params = {
        page: pageToFetch,
        limit: PAGE_LIMIT,
        keyword: keyword || undefined,
      };

      // 获取游记列表
      if (!isProfile) {
        response = await travel.getTravelList(params);
        // console.log(response);
      } else {
        params.status = statusFilter;
        response = await travel.getMyTravelList(params);
      }

      const newTravelNotes = response.data || [];
      const totalNotes = response.total || 0;

      // console.log(`获取第 ${pageToFetch} 页游记列表`, newTravelNotes)

      setTravelNotes((prevNotes) => {
        return isRefresh ? newTravelNotes : [...prevNotes, ...newTravelNotes];
      });

      // 更新是否有更多数据
      const currentTotalLength = isRefresh
        ? newTravelNotes.length
        : travelNotes.length + newTravelNotes.length;
      setHasMore(currentTotalLength < totalNotes);

      // 如果是刷新操作，重置当前页码
      if (newTravelNotes.length > 0 || isRefresh) {
        setCurrentPage(isRefresh ? 1 : pageToFetch);
      }
    } catch (error) {
      console.error(`获取游记列表第 ${pageToFetch} 页失败`, error);
      setHasMore(false);
    } finally {
      // TODO: 防止切换页面时产生界面闪烁，设置合适的Loading界面
      setLoading(false);
      if (!isRefresh) {
        setTimeout(() => {
          isLoadingMore.current = false;
          console.log(
            "[WaterFall] isLoadingMore reset to false (after timeout)."
          );
        }, 100); // 这个延迟可以调整
      }
      console.log(
        `[WaterFall] fetchTravelNotes finished. Loading: ${false}, isLoadingMore (if not refresh): ${
          isLoadingMore.current
        }`
      );
    }
  };

  const handleScroll = (event) => {
    if (!hasMore || isLoadingMore.current || !scrollViewHeight) return;

    const { scrollTop, scrollHeight } = event.detail;
    console.log(scrollTop, scrollHeight, scrollViewHeight);

    if (scrollTop + scrollViewHeight >= scrollHeight - SCROLL_THRESHOLD) {
      console.log("滚动接近底部，提前加载更多");
      fetchTravelNotes(currentPage + 1);
    }
  };

  usePullDownRefresh(async () => {
    console.log("下拉刷新");
    // setCurrentPage(1);
    // setHasMore(true);
    await fetchTravelNotes(1, true);
    Taro.stopPullDownRefresh();
  });

  return (
    <View className="waterfall-container">
      <ScrollView
        ref={scrollViewRef}
        className="scroll-view"
        scrollY
        scrollWithAnimation
        onScroll={handleScroll} // 使用 onScroll 监听
        // lowerThreshold={SCROLL_THRESHOLD}
      >
        <GridView
          type="masonry"
          crossAxisCount={2}
          mainAxisGap={10}
          crossAxisGap={10}
          onItemSize={getItemSize}
        >
          {travelNotes.map((note) => {
            return <TravelCard key={note.id} data={{ ...note }} />;
          })}
        </GridView>
        <AtLoadMore
          status={loading ? "loading" : hasMore ? "more" : "noMore"}
          noMoreText="没有更多了"
          moreBtnText="加载更多"
          loadingText="加载中..."
        />
      </ScrollView>
    </View>
  );
};

export default WaterFall;
