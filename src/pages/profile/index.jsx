import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useMemo } from 'react'
import { useUserStore, checkUserLoggedIn } from '@/store'
import TravelCard from '@/components/TravelCard'
import TravelPane from '@/components/TravelPane'
import './index.scss'

const Profile = () => {
  const [current, setCurrent] = useState(0)
  const activeTabIndex = useUserStore(state => state.activeTabIndex);
  const setActiveTabIndex = useUserStore(state => state.setActiveTabIndex);

  // 定义标签页列表
  const tabList = [
    { title: '我的游记' },
    { title: '等待审核' },
    { title: '违规游记' }
  ]

  // 模拟游记数据
  const mockTravelNotes = [
    {
      id: 1,
      title: '杭州西湖三日游',
      cover: 'https://example.com/cover1.jpg',
      author: '旅行者001',
      authorAvatar: 'https://example.com/avatar1.jpg',
      likes: 128,
      views: 1234
    },
    {
      id: 2,
      title: '北京故宫一日游',
      cover: 'https://example.com/cover2.jpg',
      author: '旅行者001',
      authorAvatar: 'https://example.com/avatar1.jpg',
      likes: 256,
      views: 2345
    }
  ]

  useDidShow(() => {
    checkUserLoggedIn()
    if (activeTabIndex !== 2) {
      setActiveTabIndex(2)
    }
  })
  
  const userStats = {
    posts: 12,
    followers: 234,
    following: 345
  }

  // 使用 useMemo 缓存游记数据
  const travelNotesByTab = useMemo(() => ({
    0: mockTravelNotes,  // 我的游记
    1: [],              // 等待审核
    2: []               // 违规游记
  }), [])

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
        <TravelPane 
          current={current} 
          onClick={setCurrent} 
          tabList={tabList}
        >
          <View className='travel-list'>
            {travelNotesByTab[current]?.map(note => (
              <TravelCard key={note.id} data={note} />
            ))}
          </View>
        </TravelPane>
      </View>
    </View>
  )
}

export default Profile
