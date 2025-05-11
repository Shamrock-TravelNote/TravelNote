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

  // 防止并发的“加载更多”请求
  const isLoadingMoreRef = useRef(false);

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

      setIsLoading(true);
      setError(null);
      if (isRefreshOperation) {
        setIsRefreshing(true);
        setCurrentPage(1);
        // setItems([]);
        setHasMore(true);
      } else {
        isLoadingMoreRef.current = true;
      }

      // ============= 数据获取 ==================

      try {
        const params = {
          page: isRefreshOperation ? 1 : pageToFetch,
          limit: PAGE_LIMIT,
          keyword: keyword || undefined,
        };

        let response;
        if (!isProfile) {
          response = await travelService.getTravelList(params);
        } else {
          params.status = statusFilter;
          response = await travelService.getMyTravelList(params);
        }

        const newItems = response.data || [];
        const totalItemsFromAPI = response.total || 0;
        // console.log(`[useInfiniteScrollData] API response. New items: ${newItems.length}, Total API: ${totalItemsFromAPI}`);

        setItems(
          isRefreshOperation
            ? newItems
            : (prevItems) => [...prevItems, ...newItems]
        );

        if (!isRefreshOperation) {
          setCurrentPage(pageToFetch);
        }

        const currentTotalAfterUpdate = isRefreshOperation
          ? newItems.length
          : items.length + newItems.length;

        setHasMore(currentTotalAfterUpdate < totalItemsFromAPI);
        // console.log(`[useInfiniteScrollData] hasMore set to ${currentTotalAfterUpdate < totalItemsFromAPI}. Current approx: ${currentTotalAfterUpdate}, API total: ${totalItemsFromAPI}`);
      } catch (e) {
        console.error("[useInfiniteScrollData] Error fetching data:", e);
        setError(e.message || "数据加载失败");
        setHasMore(false);
      } finally {
        setIsLoading(false);
        if (isRefreshOperation) {
          setIsRefreshing(false);
        }
        isLoadingMoreRef.current = false;
        // console.log(`[useInfiniteScrollData] fetchData finished. isLoading: ${false}, isRefreshing: ${false}, isLoadingMoreRef: ${isLoadingMoreRef.current}`);
      }
    },
    [keyword, isProfile, statusFilter, hasMore]
  );

  // 加载下一页
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore && !isLoadingMoreRef.current) {
      // console.log('[useInfiniteScrollData] loadMore called.');
      fetchData(currentPage + 1, false);
    } else {
      // console.log(`[useInfiniteScrollData] loadMore skipped. isLoading: ${isLoading}, hasMore: ${hasMore}, isLoadingMoreRef: ${isLoadingMoreRef.current}`);
    }
  }, [isLoading, hasMore, currentPage, fetchData]);

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
  };
};
