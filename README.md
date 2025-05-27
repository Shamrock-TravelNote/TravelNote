# TravelNote旅行笔记

## 项目简介

TravelNote是一个面向旅行爱好者的社交分享平台，用户可以发布旅行游记、浏览他人的旅行经历。
<p align="center">
  <img src="https://github.com/user-attachments/assets/75fb1949-e02e-4a23-af3b-3f38e4f38817" alt="截屏2" width="300"/>
</p>


**特别说明：本项目当前主要针对小程序端开发和优化，H5 版本暂未进行兼容性适配。**

## 技术栈

* **核心框架与语言：**
    * Taro
    * React
    * JavaScript (ES6+)
* **状态管理：**
    * Zustand (配合 Taro Storage 持久化)
* **UI与样式：**
    * Taro UI (组件库)
    * 自定义 React 组件 (如: `WaterFall`, `TravelCard`, `MediaPicker` 等)
    * SCSS (CSS预处理器)
* **网络与数据：**
    * Taro.request (封装及拦截器)
    * CryptoJS (加密)
* **小程序特性与API：**
    * Taro 路由、小程序原生API (文件、图片、位置、设备信息等)
    * 分包加载
* **工具库：**
    * lodash-es (如 `throttle`)

## 项目结构
```
src/
├── app.js                   # 全局逻辑
├── app.config.js            # 全局配置
├── app.scss                 # 全局样式
├── pages/                   # 主包页面
│   ├── home/                # 首页
│   ├── login/               # 登录页
│   ├── profile/             # 个人中心页
│   └── publish/             # 发布页
├── packageFeature/          # 功能分包
│   └── pages/
│       ├── detail/          # 游记详情页
│       ├── edit/            # 游记编辑页
│       └── search/          # 搜索页
├── components/              # 可复用组件
│   ├── WaterFall/
│   ├── TravelCard/
│   ├── MediaPicker/
│   └── ...
├── hooks/                   # 自定义Hooks
│   └── useInfiniteScrollData.js
├── services/                # API服务及请求封装
│   ├── api/
│   ├── taroRequest.js
│   └── ...
├── store/                   # 全局状态管理 (Zustand)
│   ├── userStore.js
│   └── uiStore.js
├── assets/                  # 静态资源
└── custom-tab-bar/          # 自定义TabBar (若使用)
```

## 安装与运行

1.  **克隆项目：**
    ```bash
    git clone https://github.com/Shamrock-TravelNote/TravelNote.git
    cd TravelNote
    ```

2.  **安装依赖：**
    ```bash
    npm install
    # 或者
    yarn install
    ```

3.  **后端服务配置：**
    
    * 本项目的前端运行依赖于后端服务。后端服务的配置和启动说明，请参考：[TravelNoteServer on GitHub](https://github.com/Shamrock-TravelNote/TravelNoteServer)
    * 请确保后端服务已正确运行，并在前端项目 `src/services/config.js` 文件中将 `BASE_URL` 配置为您的实际后端服务地址。


4.  **运行小程序端：**
    ```bash
    # 微信小程序开发模式
    npm run dev:weapp
    # 或 yarn dev:weapp

    # 支付宝小程序开发模式 (暂无兼容性适配)
    # npm run dev:alipay
    ```
    然后在相应的小程序开发者工具中导入项目。

5.  **编译打包：**
    ```bash
    # 微信小程序生产环境打包
    npm run build:weapp
    # 或 yarn build:weapp
    ```

## 注意事项

* 确保 Node.js 环境已安装 (推荐 LTS 版本)。
* 后端服务需配合启动
* `src/services/config.js` 中的 `BASE_URL` 需要根据实际后端服务地址进行配置。
* **H5 兼容性：** 当前版本主要为小程序端开发，未针对 H5 端进行充分的兼容性测试和适配。若需 H5 版本，可能需要额外的调整和优化。

