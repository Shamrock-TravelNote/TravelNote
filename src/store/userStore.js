import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Taro from "@tarojs/taro";

// 自定义 Taro Storage 适配器
const taroStorage = {
  getItem: async (name) => {
    const res = Taro.getStorageSync(name);
    return res || null;
  },
  setItem: async (name, value) => {
    return Taro.setStorageSync(name, value);
  },
  removeItem: async (name) => {
    return Taro.removeStorageSync(name);
  },
};

export const useUserStore = create(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      userInfo: null, // {userId, username, avatar, role}
      setUserInfo: (userInfo) => set({ userInfo }),
      logout: () => {
        set({ token: null, userInfo: null });
        Taro.removeStorageSync("user-storage"); // 清除本地缓存
        Taro.redirectTo({
          url: "/pages/login/index", // 跳转到登录页面
        });
      },
      activeTabIndex: 0, // 当前选中的 tab 索引
      setActiveTabIndex: (index) => set({ activeTabIndex: index }),
    }),
    {
      name: "user-storage", // 本地缓存中key
      storage: createJSONStorage(() => taroStorage), // 使用自定义的 Taro Storage 适配器
      // getStorageSync: true,
    }
  )
);

// 获取登陆状态
export const checkUserLoggedIn = () => {
  const { token, userInfo } = useUserStore.getState();
  console.log("checkUserLoggedIn: token:", token);
  console.log("checkUserLoggedIn: userInfo:", userInfo);

  if (!token || !userInfo) {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];

    // 如果当前页面不是登录页，则跳转到登录页
    if (currentPage?.route !== "pages/login/index") {
      Taro.redirectTo({
        url: "/pages/login/index",
      });
      return false;
    }
  }
  return true;
};

export const uesActiveTabIndex = () => {
  const { activeTabIndex, setActiveTabIndex } = useUserStore();
  return {
    activeTabIndex,
    setActiveTabIndex,
  };
};
