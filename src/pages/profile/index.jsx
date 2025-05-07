import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
// import CustomTabBar from '@/custom-tab-bar'
import { useUserStore, checkUserLoggedIn } from '@/store'
import './index.scss'
import { use } from 'react'

const Profile = () => {
  const { setActiveTabIndex } = useUserStore(state => ({
    setActiveTabIndex: state.setActiveTabIndex
  }))

  useDidShow(() => {
    checkUserLoggedIn()
    setActiveTabIndex(2)
  }
  )
  
  const userStats = {
    posts: 12,
    followers: 234,
    following: 345
  }

  return (
    <View className='profile'>
      <View className='user-info'>
        <View className='avatar-wrapper'>
          <Text>头像</Text>
        </View>
        <Text className='nickname'>旅行者001</Text>
      </View>
      <View className='user-stats'>
        <View className='stat-item'>
          <Text className='number'>{userStats.posts}</Text>
          <Text className='label'>游记</Text>
        </View>
        <View className='stat-item'>
          <Text className='number'>{userStats.followers}</Text>
          <Text className='label'>关注者</Text>
        </View>
        <View className='stat-item'>
          <Text className='number'>{userStats.following}</Text>
          <Text className='label'>关注中</Text>
        </View>
      </View>
      <View className='action-list'>
        <View className='action-item'>
          <Text className='action-text'>我的游记</Text>
        </View>
        <View className='action-item'>
          <Text className='action-text'>收藏夹</Text>
        </View>
        <View className='action-item'>
          <Text className='action-text'>设置</Text>
        </View>
      </View>
    </View>
  )
}

export default Profile
