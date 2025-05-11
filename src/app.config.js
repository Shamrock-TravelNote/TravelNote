export default defineAppConfig({
  pages: [
    // "pages/index/index",
    "pages/home/index",
    "pages/login/index",
    "pages/publish/index",
    "pages/profile/index",
  ],
  subPackages: [
    {
      root: "packageFeature",
      name: "feature",
      pages: ["pages/detail/index", "pages/search/index"],
    },
  ],
  enablepullDownRefresh: true,
  usingComponents: {},
  window: {
    backgroundTextStyle: "light",
    // navigationStyle: "custom",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "旅行笔记",
    navigationBarTextStyle: "black",
  },
  // renderer: "skyline", // 全局启用 Skyline
  // rendererOptions: {
  //   skyline: {
  //     defaultDisplayBlock: true,
  //     disableABTest: false,
  //     sdkVersionBegin: "2.28.0",
  //     sdkVersionEnd: "999.999.999",
  //   },
  // },
  // componentFramework: "glass-easel", // Skyline 依赖于 glass-easel
  // lazyCodeLoading: "requiredComponents",
  tabBar: {
    color: "#666666", // 未选中文字颜色
    selectedColor: "#c1ea2b", // 选中文字颜色
    backgroundColor: "#FAFAFA", // 背景色
    borderStyle: "white", // 边框颜色 (可选 black 或 white)
    list: [
      {
        pagePath: "pages/home/index",
        text: "首页",
        iconPath: "assets/home.png",
        selectedIconPath: "assets/homefill.png",
      },
      {
        pagePath: "pages/publish/index",
        text: "发布",
        iconPath: "assets/roundadd.png",
        selectedIconPath: "assets/roundaddfill.png",
      },
      {
        pagePath: "pages/profile/index",
        text: "我的",
        iconPath: "assets/people.png",
        selectedIconPath: "assets/peoplefill.png",
      },
    ],
  },
  networkTimeout: {
    request: 10000,
    connectSocket: 10000,
    uploadFile: 10000,
    downloadFile: 10000,
  },
  debug: true,
  permission: {
    "scope.userLocation": {
      desc: "您的位置信息将用于获取当前位置",
    },
    "scope.camera": {
      desc: "您的相机权限将用于拍照",
    },
    "scope.record": {
      desc: "您的麦克风权限将用于录音",
    },
  },
  requiredBackgroundModes: ["audio", "location"],
});
