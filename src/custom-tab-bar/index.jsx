import { View, Text } from '@tarojs/components'
// import { useEffect, useState } from 'react'
import { AtIcon } from 'taro-ui'
import Taro from '@tarojs/taro'
import { useUserStore } from '../store'
import './index.scss'

const tabList = [
  { text: '首页', path: '/pages/home/index' },
  { text: '发布', path: '/pages/publish/index', icon: 'add-circle' },
  { text: '我的',  path: '/pages/profile/index' }
]

const CustomTabBar = () => {
  const activeTabIndex = useUserStore(state => state.activeTabIndex)
  // const [selected, setSelected] = useState(0)

  // 确保组件挂载时就同步当前页面状态
  // useEffect(() => {
  //   const page = Taro.getCurrentInstance()
  //   const path = `/${page.router?.path}`
  //   const index = tabList.findIndex(item => item.path === path)
  //   if (index > -1) {
  //     setSelected(index)
  //   }
  // }, [])

  const switchTab = (path, index) => {
    // 先切换路由，状态会在目标页面自动更新
    // Taro.switchTab({ url: path })
    Taro.navigateTo({ url: path })
      .catch(err => {
        console.error('切换路由失败:', err)
      })
  }

  // 暴露给外部调用的方法
  // CustomTabBar.setSelected = (index) => {
  //   setSelected(index)
  // }

  return (
    <View className='tab-bar'>
      {tabList.map((item, index) => (
        <View 
          key={item.text}
          className='tab-bar-item'
          onClick={() => switchTab(item.path, index)}
        >
          <View className={`icon ${index === 1 ? 'plus' : ''}`}>
            <AtIcon
              value={item.icon}
              size={index === 1 ? 30 : 24}
              color={activeTabIndex === index ? '#07c160' : '#666'}
            />
          </View>
          <Text className={`text ${activeTabIndex === index ? 'selected' : ''}`}>
            {item.text}
          </Text>
        </View>
      ))}
    </View>
  )
}

// 必须在组件外部挂载 setSelected 方法
// CustomTabBar.setSelected = (index) => {
//   // 这里需要获取组件实例来调用内部的 setSelected
//   const tabbar = Taro.getTabBar()
//   if (tabbar) {
//     tabbar.setData({ selected: index })
//   }
// }

export default CustomTabBar
