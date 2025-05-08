import { View } from '@tarojs/components'
import { useEffect, useMemo, useState } from 'react'
import SearchBar from '@/components/SearchBar'
import TravelCard from '@/components/TravelCard'
import travel from '@/services/api/travel'
import Taro, { useDidShow } from '@tarojs/taro'
import { useUserStore } from '@/store'
// import CustomTabBar from '@/custom-tab-bar'
import './index.scss'

const Home = () => {
  const setActiveTabIndex = useUserStore(state => state.setActiveTabIndex)
  const [travelNotes, setTravelNotes] = useState([{
    title: '游记标题',
    content: '游记内容',
  }])
  const [loading, setLoading] = useState(false)

  // const page = useMemo(() => Taro.getCurrentInstance().page, [])
  
  useDidShow(() => {
    setActiveTabIndex(0)
  })
  
  useEffect(() => {
    fetchTravelNotes()
  }, [])

  const fetchTravelNotes = async () => {
    try {
      setLoading(true)
      const data = await travel.getTravelList()
      setTravelNotes(data)
    } catch (error) {
      console.error('获取游记列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='home'>
      <SearchBar />
      <View className='travel-list'>
        {travelNotes.map(note => (
          <TravelCard key={note.id} data={note} />
        ))}
      </View>
    </View>
  )
}

export default Home
