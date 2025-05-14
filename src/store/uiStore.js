import { create } from "zustand";
import Taro from "@tarojs/taro"; // 如果需要 Taro API，但这个 store 可能不需要

export const TAB_BAR_HOME_INDEX = 0;
export const TAB_BAR_PUBLISH_INDEX = 1;
export const TAB_BAR_PROFILE_INDEX = 2;

export const useUIStore = create((set, get) => ({
  // --- Profile Page Refresh State ---
  lastProfileRefreshTime: 0,
  /**
   * 触发 Profile 页面的数据刷新。
   * 调用此方法会更新 lastProfileRefreshTime 时间戳。
   */
  triggerProfileRefresh: () => set({ lastProfileRefreshTime: Date.now() }),

  // --- Home Page Refresh State ---
  lastHomeRefreshTime: 0,
  /**
   * 触发 Home 页面的数据刷新。
   * 调用此方法会更新 lastHomeRefreshTime 时间戳。
   */
  triggerHomeRefresh: () => set({ lastHomeRefreshTime: Date.now() }),

  // --- TabBar Tap State ---
  lastTabBarTap: { index: -1, time: 0 },
  /**
   * 处理 TabBar 点击事件，用于检测重复点击并触发相应页面的刷新。
   * @param {number} index - 被点击的 TabBar 项的索引。
   */
  setLastTabBarTap: (index) => {
    const now = Date.now();
    const previousTap = get().lastTabBarTap;

    // 判断是否是短时间内重复点击同一个 tab
    const REPEAT_TAP_THRESHOLD = 500;

    console.log(
      `[UIStore] setLastTabBarTap called with index: ${index}. Previous tap:`,
      previousTap
    );

    console.log("时间差", now - previousTap.time);

    if (
      previousTap.index === index &&
      now - previousTap.time > REPEAT_TAP_THRESHOLD
    ) {
      console.log(`[UIStore] Repetitive tap on TabBar index: ${index}`);
      if (index === TAB_BAR_HOME_INDEX) {
        console.log(
          "[UIStore] Repetitive tap on Home, attempting to triggerHomeRefresh."
        );
        get().triggerHomeRefresh();
      } else if (index === TAB_BAR_PROFILE_INDEX) {
        console.log(
          "[UIStore] Repetitive tap on Home, attempting to triggerProfileRefresh."
        );
        get().triggerProfileRefresh();
      }
    }
    set({ lastTabBarTap: { index, time: now } });
  },

  // --- (可选) 其他 UI 相关状态 ---
  // 例如：全局加载状态、弹窗显示状态等
  // globalLoading: false,
  // setGlobalLoading: (isLoading) => set({ globalLoading: isLoading }),
}));
