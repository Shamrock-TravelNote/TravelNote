import { View } from '@tarojs/components'
import { useEffect, useMemo, useState } from 'react'
import SearchBar from '@/components/SearchBar'
import TravelCard from '@/components/TravelCard'
import travel from '@/services/api/travel'
import Taro, { useDidShow, useReachBottom, usePullDownRefresh } from '@tarojs/taro'
import { useUserStore } from '@/store'
import './index.scss'

const PAGE_LIMIT = 10

const Home = () => {
  const setActiveTabIndex = useUserStore(state => state.setActiveTabIndex)
  const [travelNotes, setTravelNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  
  useDidShow(() => {
    setActiveTabIndex(0)
  })
  
  useEffect(() => {
    fetchTravelNotes(1, true)
  }, [])

  const fetchTravelNotes = async (pageToFetch, isRefresh = false) => {
    if (loading || (!isRefresh && !hasMore)) {
      return
    }

    setLoading(true)
    try {
      // 获取游记列表
      const response = await travel.getTravelList({ page: pageToFetch, limit: PAGE_LIMIT })

      const newTravelNotes = response.data || []
      const totalNotes = response.total || 0

      console.log(`获取第 ${pageToFetch} 页游记列表`, newTravelNotes)

      setTravelNotes(prevNotes => {
        return isRefresh ? newTravelNotes : [...prevNotes, ...newTravelNotes]
      })

      // 更新是否有更多数据
      const currentTotalLength = isRefresh ? newTravelNotes.length : (travelNotes.length + newTravelNotes.length);
      setHasMore(currentTotalLength < totalNotes);

      // 如果是刷新操作，重置当前页码
      if (newTravelNotes.length > 0 || isRefresh) {
        setCurrentPage(isRefresh ? 1 : pageToFetch);
      }

    } catch (error) {
      console.error(`获取游记列表第 ${pageToFetch} 页失败`, error)
    } finally {
      setLoading(false)
    }
  }

  useReachBottom(() => {
    console.log('触底加载更多')
    if (hasMore && !loading) {
      fetchTravelNotes(currentPage + 1)
    }
  })

  usePullDownRefresh(async() => {
    console.log('下拉刷新')
    setCurrentPage(1)
    setHasMore(true)
    await fetchTravelNotes(1, true)
    Taro.stopPullDownRefresh()
  })

  return (
    <View className='home'>
      <SearchBar />
      <View className='content'>
        <View className='travel-list'>
          {travelNotes.map(note => (
            <TravelCard key={note.id} data={note} />
          ))}
          {loading && <View className='loading'>加载中...</View>}
          {!hasMore && travelNotes.length > 0 && (
            <View className='no-more'>没有更多数据了</View>
          )}
          {!loading && travelNotes.length === 0 && (
            <View className='no-data'>暂无游记数据</View>
          )}
        </View>
      </View>
    </View>
  )
}

export default Home
