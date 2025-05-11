import { View, Text, Image } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { AtIcon } from "taro-ui"; // 假设你使用 taro-ui
import "./index.scss";

const CustomNavBar = ({ title, showBackButton = true, onBack }) => {
  // 获取胶囊按钮信息，用于对齐和计算高度
  // 注意：Taro.getMenuButtonBoundingClientRect() 必须在页面生命周期内调用，
  // 在组件初次渲染时可能获取不到，推荐在页面级别获取并传入
  // 或者使用 try-catch 保证在非小程序环境下不报错
  let menuButtonInfo = {};
  try {
    menuButtonInfo = Taro.getMenuButtonBoundingClientRect();
  } catch (e) {
    console.warn("获取胶囊按钮信息失败，可能不在小程序环境或时机不当");
  }

  const statusBarHeight = menuButtonInfo.top || 0; // 状态栏高度
  const navBarHeight =
    (menuButtonInfo.height || 32) +
    (menuButtonInfo.top || 0) * 2 -
    menuButtonInfo.bottom +
    menuButtonInfo.top; // 导航栏内容区域高度 (不含状态栏)
  // 另一种计算方式，导航栏整体高度（含状态栏） menuButtonInfo.bottom + (menuButtonInfo.top - statusBarHeight)
  // 这里我们简单处理，假设导航栏内容区高度与胶囊按钮同高，再加上上下一定的 padding
  const navContentHeight = menuButtonInfo.height || 32;
  const navBarTotalHeight = statusBarHeight + navContentHeight + 8; // 8是上下padding的估算，你可以根据实际UI调整

  const handleBack = () => {
    if (onBack && typeof onBack === "function") {
      onBack();
    } else {
      Taro.navigateBack().catch(() => {
        // 如果 navigateBack 失败（比如当前是第一个页面），可以跳转到首页
        Taro.switchTab({ url: "/pages/home/index" });
      });
    }
  };

  return (
    <View
      className="custom-nav-bar"
      style={{
        paddingTop: `${statusBarHeight}px`,
        height: `${navBarTotalHeight}px`,
      }}
    >
      <View
        className="nav-bar-content"
        style={{
          height: `${navContentHeight}px`,
          lineHeight: `${navContentHeight}px`,
        }}
      >
        {showBackButton && (
          <View className="back-button" onClick={handleBack}>
            <AtIcon value="chevron-left" size="20" color="#000"></AtIcon>
          </View>
        )}
        <View className="nav-bar-title">
          <Text>{title}</Text>
        </View>
        {/* 你可以在这里添加其他按钮，比如分享、更多操作等 */}
        {/* 为了与胶囊按钮右侧对齐，可以预留一个空白区域 */}
        <View
          className="actions-placeholder"
          style={{ width: `${menuButtonInfo.width || 87}px` }}
        />
      </View>
    </View>
  );
};

export default CustomNavBar;
