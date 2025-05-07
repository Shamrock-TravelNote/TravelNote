import { View } from '@tarojs/components'
import { useState } from 'react'
import { AtTabBar } from 'taro-ui'
import Home from '../../container/home'
import Publish from '../../container/publish'
import Profile from '../../container/profile'
import './index.scss'

export default function Index() {
  const [current, setCurrent] = useState(0)

  const handleTabClick = (value) => {
    setCurrent(value)
  }

  const renderContent = () => {
    switch (current) {
      case 0:
        return <Home />
      case 1:
        return <Publish />
      case 2:
        return <Profile />
      default:
        return null
    }
  }

  return (
    <View className='index'>
      {renderContent()}
      <AtTabBar
        fixed
        tabList={[
          { title: '首页', iconType: 'home' },
          { title: '发布', iconType: 'edit' },
          { title: '我的', iconType: 'user' }
        ]}
        onClick={handleTabClick}
        current={current}
      />
    </View>
  )
}