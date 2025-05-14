import React, { useEffect } from 'react';
import Taro, { useDidShow, getCurrentInstance } from '@tarojs/taro';
import { checkUserLoggedIn } from '../store/userStore'; // 引入登录检查函数

const withAuth = (WrappedComponent) => {
  const ComponentWithAuth = (props) => {
    useDidShow(() => {
      const isLoggedIn = checkUserLoggedIn();
      console.log('withAuth: Checking login status on useDidShow - isLoggedIn:', isLoggedIn);

      if (!isLoggedIn) {
        console.log('withAuth: User not logged in, redirecting to login page');
        // 获取当前页面的路径，以便登录后可以跳回
        const router = getCurrentInstance().router;
        const currentPagePath = router?.path || '/pages/index/index'; // 默认为首页
        const redirectUrl = currentPagePath + (router?.params && Object.keys(router.params).length > 0 ? '?' + Taro.arrayBufferToString(Taro.utils.serializeParams(router.params)) : '');


        Taro.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000,
          success: () => {
            setTimeout(() => {
              Taro.redirectTo({
                url: `/pages/login/index?redirectUrl=${encodeURIComponent(redirectUrl)}`,
              });
            }, 1500); // 延迟跳转，让Toast显示完整
          }
        });
      }
    });

    // 如果已登录，或者在跳转前，先渲染页面（或者根据需要返回null/loading）
    // 只有在确认未登录并准备跳转时，才考虑不渲染WrappedComponent
    // 但通常，即使未登录，页面骨架先渲染一下然后跳转体验更好，或者显示一个Loading
    const isLoggedIn = checkUserLoggedIn(); // 再次检查，确保渲染时也是基于最新状态
    if (!isLoggedIn && WrappedComponent.name !== 'Login') { // 避免Login页面自己重定向自己
      // 可以在这里返回一个 Loading 组件，或者 null，直到 useDidShow 中的重定向发生
        console.log('isLoggedIn:', isLoggedIn);
        console.log('withAuth: User not logged in, rendering null or loading for', WrappedComponent.name);
      // return <LoadingComponent />; // 或者 return null;
      // return null;
      // 这里返回null，避免渲染WrappedComponent
      // 但注意，这里可能会导致页面闪烁，因为useDidShow会在页面加载后立即执行
      // 也就是说，useDidShow会在页面加载后立即执行，所以如果在这里返回null，可能会导致页面闪烁
      // 解决方法是，在useDidShow中设置一个状态，来控制是否渲染WrappedComponent
      // 但是这样会导致页面加载时，WrappedComponent会被渲染两次
      // 1. 第一次是正常渲染
      // 2. 第二次是useDidShow中重定向后，WrappedComponent会被重新渲染
      // 但是，这样做的好处是，可以避免在useDidShow中直接重定向导致的页面闪烁
    }

    return <WrappedComponent {...props} />;
  };

  return ComponentWithAuth;
};

export default withAuth;