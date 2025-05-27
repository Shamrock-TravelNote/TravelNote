import { useState, useCallback, useEffect, useRef } from "react";
import travelService from "@/services/api/travel";

const PAGE_LIMIT = 10;

/**
 * 自定义 Hook 用于处理瀑布流或无限滚动列表的数据加载逻辑。
 *
 * @param {object} options - 配置选项
 * @param {string} [options.keyword=""] - 搜索关键词
 * @param {boolean} [options.isProfile=false] - 是否为个人主页列表
 * @param {string} [options.statusFilter="approved"] - 个人主页时的状态筛选
 * @param {boolean} [options.autoLoadFirstPage=true] - 是否在 Hook 初始化时自动加载第一页
 * @returns {object} 包含数据、状态和操作方法的对象
 */
export const useInfiniteScrollData = ({
  keyword = "",
  isProfile = false,
  statusFilter = "approved",
  autoLoadFirstPage = true,
} = {}) => {
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false); //通用加载状态
  const [isRefreshing, setIsRefreshing] = useState(false); //下拉刷新或key变化导致的强制刷新
  const [error, setError] = useState(null);
  const [totalItemsFromSource, setTotalItemsFromSource] = useState(0);

  // 防止并发的“加载更多”请求
  const isLoadingMoreRef = useRef(false);

  // 用于存储当前活动的 requestTask (或带有 abort 方法的 Promise-like 对象)
  const activeRequestRef = useRef(null);
  // 用于在异步回调中检查组件是否仍挂载
  const isMountedRef = useRef(true);

  // 组件挂载与卸载时更新 isMountedRef
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 数据获取
  const fetchData = useCallback(
    async (pageToFetch, isRefreshOperation = false) => {
      // console.log(`[useInfiniteScrollData] fetchData called. Page: ${pageToFetch}, isRefresh: ${isRefreshOperation}, isLoading: ${isLoading}, isLoadingMoreRef: ${isLoadingMoreRef.current}`);

      // ============= 加载状态 ==================
      // 防止在已加载中时重复触发，除非是刷新操作
      if (isLoading && !isRefreshOperation) {
        // console.log('[useInfiniteScrollData] fetchData skipped: already loading and not a refresh.');
        return;
      }
      // 如果是加载更多，并且 isLoadingMoreRef.current 为 true，或者没有更多了，则跳过
      if (!isRefreshOperation && (isLoadingMoreRef.current || !hasMore)) {
        // console.log(`[useInfiniteScrollData] fetchData for 'more' skipped. isLoadingMoreRef: ${isLoadingMoreRef.current}, hasMore: ${hasMore}`);
        return;
      }

      // 关键点1: 中止上一个活动请求 (主要针对刷新或参数变化)
      if (
        activeRequestRef.current &&
        (isRefreshOperation || (pageToFetch === 1 && !isLoadingMoreRef.current))
      ) {
        if (typeof activeRequestRef.current.abort === "function") {
          console.log(
            "[useInfiniteScrollData] Aborting previous active request before new fetch."
          );
          activeRequestRef.current.abort();
        }
        activeRequestRef.current = null;
      }

      setIsLoading(true);
      setError(null);
      if (isRefreshOperation) {
        setIsRefreshing(true);
        // setCurrentPage(1);
        // setItems([]);
        setHasMore(true);
      } else {
        isLoadingMoreRef.current = true;
      }

      // ============= 数据获取 ==================

      let currentRequestObject;
      try {
        const resolvedPageToFetch = isRefreshOperation ? 1 : pageToFetch;
        const params = {
          page: resolvedPageToFetch,
          limit: PAGE_LIMIT,
          keyword: keyword || undefined,
        };

        let currentRequestObject;
        if (!isProfile) {
          currentRequestObject = travelService.getTravelList(params);
        } else {
          params.status = statusFilter;
          currentRequestObject = travelService.getMyTravelList(params);
        }
        activeRequestRef.current = currentRequestObject;

        let response = await currentRequestObject;
        console.log(currentRequestObject);

        const newItems = response.data || [];
        const totalItemsFromAPI = response.total || 0;
        // console.log(
        //   `[useInfiniteScrollData] API response. New items: ${newItems.length}, Total API: ${totalItemsFromAPI}`
        // );

        setTotalItemsFromSource(totalItemsFromAPI);
        console.log("olditems:", items);
        console.log("newitems:", newItems);
        console.log(
          `[FETCH_DATA_LOG] Keyword: ${keyword}, Page: ${resolvedPageToFetch}, isRefresh: ${isRefreshOperation}, About to call setItems with newItems count: ${newItems.length}`
        );

        setItems(
          isRefreshOperation
            ? newItems
            : (prevItems) => {
                const updatedItems = [...prevItems, ...newItems];
                console.log(
                  `[FETCH_DATA_LOG] Keyword: ${keyword}, setItems for loadMore. Prev count: ${prevItems.length}, New total: ${updatedItems.length}`
                );
                return updatedItems;
              }
        );
        setCurrentPage(resolvedPageToFetch);

        // if (!isRefreshOperation) {
        //   setCurrentPage(resolvedPageToFetch);
        // }

        // const currentTotalAfterUpdate = isRefreshOperation
        //   ? newItems.length
        //   : items.length + newItems.length;

        // setHasMore(currentTotalAfterUpdate < totalItemsFromAPI);

        // const finalItemsLength =
        //   (isRefreshOperation ? 0 : items.length) + newItems.length;

        // console.log("isRefreshOperation:", isRefreshOperation);
        // console.log("之前的长度：", items.length);
        // console.log("请求目前长度:", finalItemsLength);
        // console.log("总长度：", totalItemsFromAPI);

        // setHasMore(finalItemsLength < totalItemsFromAPI);

        // console.log(`[useInfiniteScrollData] hasMore set to ${currentTotalAfterUpdate < totalItemsFromAPI}. Current approx: ${currentTotalAfterUpdate}, API total: ${totalItemsFromAPI}`);
      } catch (e) {
        console.error("[useInfiniteScrollData] Error fetching data:", e);
        setError(e.message || "数据加载失败");
        setTotalItemsFromSource(0);
        // 关键点3: 区分处理 AbortError
        // 你需要根据 Taro abort() 实际抛出的错误特征来判断
        if (
          err &&
          (err.errMsg?.includes("request:fail abort") ||
            err.name === "AbortError") /* 或其他Taro中止特定标识 */
        ) {
          console.log("[useInfiniteScrollData] Fetch aborted as expected.");
        } else {
          console.error("[useInfiniteScrollData] Error fetching data:", err);
          setError(err.message || err.errMsg || "数据加载失败");
        }
        // setHasMore(false);
      } finally {
        setIsLoading(false);
        if (isRefreshOperation) {
          setIsRefreshing(false);
        }
        isLoadingMoreRef.current = false;
        // 关键点4: 如果当前完成的请求是 activeRequestRef 中的那个，则清除它
        if (activeRequestRef.current === currentRequestObject) {
          activeRequestRef.current = null;
        }
        // console.log(`[useInfiniteScrollData] fetchData finished. isLoading: ${false}, isRefreshing: ${false}, isLoadingMoreRef: ${isLoadingMoreRef.current}`);
      }
    },
    [keyword, isProfile, statusFilter]
  );

  // 加载下一页
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore && !isLoadingMoreRef.current) {
      // console.log('[useInfiniteScrollData] loadMore called.');
      return fetchData(currentPage + 1, false);
    } else {
      // console.log(`[useInfiniteScrollData] loadMore skipped. isLoading: ${isLoading}, hasMore: ${hasMore}, isLoadingMoreRef: ${isLoadingMoreRef.current}`);
      return Promise.resolve();
    }
  }, [isLoading, hasMore, currentPage, fetchData]);

  // 更新hasmore
  useEffect(() => {
    if (!isLoading) {
      setHasMore(items.length < totalItemsFromSource);
    }
    // console.log("[useInfiniteScrollData] State Updated:", {
    //   updatedItems: items, // 这是最新的 items 数组
    //   updatedItemsCount: items.length,
    //   currentPage: currentPage, // 这是最新的 currentPage
    //   hasMore: items.length < totalItemsFromSource, // 可以顺便打印计算出的 hasMore
    //   totalInSource: totalItemsFromSource,
    // });
  }, [items, totalItemsFromSource, isLoading]);

  // 刷新函数
  const refresh = useCallback(() => {
    // console.log('[useInfiniteScrollData] refresh called.');
    return fetchData(1, true);
  }, [fetchData]);

  // 初始加载第一页数据
  useEffect(() => {
    if (autoLoadFirstPage) {
      // console.log('[useInfiniteScrollData] Initial autoLoadFirstPage effect.');
      refresh();
    }
  }, [autoLoadFirstPage, refresh]);

  // 关键点6: 组件卸载时的最终清理
  useEffect(() => {
    return () => {
      console.log(
        "[useInfiniteScrollData] Component unmounting, attempting to abort active request."
      );
      if (
        activeRequestRef.current &&
        typeof activeRequestRef.current.abort === "function"
      ) {
        console.log("abort!!");
        activeRequestRef.current.abort();
        activeRequestRef.current = null;
      }
    };
  }, []); // 空依赖数组，仅在卸载时运行

  return {
    items, // 当前数据列表
    isLoading, // 是否正在加载（通用，包括初始、刷新、更多）
    isRefreshing, // 是否正在执行刷新操作 (用于更精细的 UI 反馈)
    isLoadingMore: isLoadingMoreRef.current, // 是否正在加载“更多”
    hasMore, // 是否还有更多数据
    error, // 加载错误信息
    currentPage, // 当前页码
    loadMore, // 加载下一页的函数
    refresh, // 刷新数据的函数
    setItems, // （可选暴露）直接设置 items 的方法，用于某些特殊场景
    setIsLoading,
  };
};
