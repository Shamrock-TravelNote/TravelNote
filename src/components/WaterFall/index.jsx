import { View, Text, ScrollView, GridView } from "@tarojs/components";
import { AtLoadMore, AtActivityIndicator } from "taro-ui";
import { useEffect, useRef, useState, useCallback } from "react";
import TravelCard from "@/components/TravelCard";
import Taro, { usePullDownRefresh } from "@tarojs/taro";
import { useInfiniteScrollData } from "@/hooks/useInfiniteScrollData";
import { throttle } from "lodash-es";
import "./index.scss";

const SCROLL_THRESHOLD = 350;

const WaterFall = ({
  keyword = "",
  isProfile = false,
  statusFilter = "approved",
  // 可以添加一个 onItemsChange 回调，如果父组件需要知道数据变化
}) => {
  const scrollViewRef = useRef(null);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);

  const {
    items: travelNotes,
    isLoading,
    isRefreshing,
    hasMore,
    error,
    loadMore,
    refresh,
  } = useInfiniteScrollData({
    keyword,
    isProfile,
    statusFilter,
    autoLoadFirstPage: true,
  });

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
    Taro.nextTick(() => {
      const query = Taro.createSelectorQuery();
      query
        .select(".scroll-view")
        .boundingClientRect((rect) => {
          if (rect && rect.height > 0) {
            // console.log("[WaterFall] ScrollView height calculated:", rect.height);
            setScrollViewHeight(rect.height);
          } else {
            // console.warn("[WaterFall] ScrollView height query failed:", rect);
          }
        })
        .exec();
    });
  }, []);

  const throttledScrollHandler = useCallback(
    throttle(
      (currentScrollTop, currentScrollHeight, currentScrollViewHeight) => {
        if (currentScrollViewHeight <= 0 || isLoading || !hasMore) {
          return;
        }
        if (
          currentScrollTop + currentScrollViewHeight >=
          currentScrollHeight - SCROLL_THRESHOLD
        ) {
          console.log(
            "[WaterFall] Throttled scroll: Threshold reached, calling loadMore."
          );
          loadMore();
        }
      },
      500,
      { leading: false, trailing: true }
    ),
    [loadMore, isLoading, scrollViewHeight, SCROLL_THRESHOLD]
  );

  const handleScroll = (event) => {
    if (scrollViewHeight <= 0 || isLoading || !hasMore) {
      return;
    }
    const { scrollTop, scrollHeight } = event.detail;
    throttledScrollHandler(scrollTop, scrollHeight, scrollViewHeight);
    // if (scrollTop + scrollViewHeight >= scrollHeight - SCROLL_THRESHOLD) {
    //   console.log("[WaterFall] Scroll threshold reached, calling loadMore.");
    //   loadMore();
    // }
  };

  usePullDownRefresh(async () => {
    // console.log("[WaterFall] Pull down refresh triggered by user.");
    await refresh();
    Taro.stopPullDownRefresh();
  });

  // ----- 渲染逻辑 -----

  // 1. 初始加载中，并且还没有任何数据显示时
  if (isLoading && travelNotes.length === 0) {
    return (
      <View className="waterfall-loading-container">
        <AtActivityIndicator mode="center" content="加载中..." size={48} />
      </View>
    );
  }

  // 2. 加载出错，并且没有任何数据显示时
  if (error && travelNotes.length === 0) {
    return (
      <View className="waterfall-error-container">
        <Text>
          {typeof error === "string" ? error : "加载失败，请稍后重试"}
        </Text>
        <View className="retry-button" onClick={refresh}>
          <Text>点击重试</Text>
        </View>
      </View>
    );
  }

  // 3. 没有数据（加载完成，但列表为空且没有更多）
  if (!isLoading && !isRefreshing && travelNotes.length === 0 && !hasMore) {
    return (
      <View className="waterfall-empty-container">
        <Text>暂无内容</Text>
      </View>
    );
  }

  // 4. 正常显示列表
  return (
    <View className="waterfall-container">
      {isRefreshing && travelNotes.length > 0 && (
        <View className="waterfall-refreshing-overlay">
          <AtActivityIndicator content="刷新中..." size={32} />
        </View>
      )}
      <ScrollView
        ref={scrollViewRef}
        className="scroll-view"
        scrollY
        scrollWithAnimation
        onScroll={handleScroll}
      >
        <GridView
          type="masonry"
          crossAxisCount={2}
          mainAxisGap={10}
          crossAxisGap={10}
          onItemSize={getItemSize}
        >
          {travelNotes.map((note) => (
            <TravelCard key={note.id} data={{ ...note }} />
          ))}
        </GridView>
        {(travelNotes.length > 0 || hasMore) && !isRefreshing && (
          <AtLoadMore
            status={
              isLoading && !isRefreshing
                ? "loading"
                : hasMore
                ? "more"
                : "noMore"
            }
            noMoreText="没有更多内容了"
            moreText="上拉或点击加载更多"
            loadingText="正在加载..."
            onClick={() => {
              if (hasMore && !isLoading && !isRefreshing) {
                loadMore();
              }
            }}
          />
        )}
      </ScrollView>
    </View>
  );
};

export default WaterFall;
