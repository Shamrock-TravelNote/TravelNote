export default defineAppConfig({
  pages: ["pages/index/index", "pages/login/index", "pages/search/index"],
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
