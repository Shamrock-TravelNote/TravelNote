export default defineAppConfig({
  pages: [
    "pages/index/index",
    "container/auth/index",
    "container/home/index",
    "container/publish/index",
    "container/profile/index",
  ],
  usingComponents: {},
  subPackages: [],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "旅行笔记",
    navigationBarTextStyle: "black",
  },
  componentFramework: "glass-easel",
});
