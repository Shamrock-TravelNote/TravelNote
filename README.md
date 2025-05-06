# TravelNote 旅行笔记

基于Taro + React开发的跨平台旅行笔记小程序。

## 项目介绍

TravelNote是一个面向旅行爱好者的社交分享平台，用户可以发布旅行游记、浏览他人的旅行经历、收藏喜欢的内容等。

## 技术栈

- Taro 4.0.12
- React 18
- Taro UI
- Sass

## 项目结构

```
src/
  ├── components/        # 公共组件
  │   ├── SearchBar/    # 搜索栏组件
  │   └── TravelCard/   # 游记卡片组件
  ├── container/        # 页面容器组件
  │   ├── home/        # 首页模块
  │   ├── profile/     # 个人中心模块
  │   └── publish/     # 发布游记模块
  ├── pages/           # 页面文件
  │   ├── index/       # 主页面
  │   ├── login/       # 登录页面
  │   └── search/      # 搜索页面
  ├── services/        # 服务层
  │   ├── api/         # API接口
  │   └── request.js   # 请求封装
  ├── app.config.js    # 应用配置
  ├── app.jsx         # 应用入口
  └── app.scss        # 全局样式
```

## 本地开发

1. 安装依赖
```bash
pnpm install
```

2. 运行到微信小程序
```bash
pnpm dev:weapp
```

3. 运行到H5
```bash
pnpm dev:h5
```

## 构建部署

1. 构建微信小程序
```bash
pnpm build:weapp
```

2. 构建H5版本
```bash
pnpm build:h5
```

## 注意事项

- 开发时请遵循ESLint规范
- 组件样式使用BEM命名规范
- 提交代码前请先进行本地测试

