export default {
  pages: [
    'pages/home/index',
    'pages/publish/index', 
    'pages/profile/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    list: [{
      pagePath: 'pages/home/index',
      text: '首页',
      iconPath: 'assets/tab/home.png',
      selectedIconPath: 'assets/tab/home-active.png'
    }, {
      pagePath: 'pages/publish/index', 
      text: '发布',
      iconPath: 'assets/tab/publish.png',
      selectedIconPath: 'assets/tab/publish-active.png'
    }, {
      pagePath: 'pages/profile/index',
      text: '我的',
      iconPath: 'assets/tab/profile.png', 
      selectedIconPath: 'assets/tab/profile-active.png'
    }]
  }
}
