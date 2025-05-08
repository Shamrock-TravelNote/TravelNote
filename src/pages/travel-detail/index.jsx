import { View, Text } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import * as travelApi from '@/services/api/travel'

const TravelDetail = () => {
  const [detail, setDetail] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const { id } = router.params
    if (id) {
      fetchTravelDetail(id)
    }
  }, [router.params])

  const fetchTravelDetail = async (id) => {
    try {
      const data = await travelApi.getTravelDetail(id)
      setDetail(data)
    } catch (error) {
      console.error('获取游记详情失败:', error)
      Taro.showToast({
        title: '获取详情失败',
        icon: 'none'
      })
    }
  }

  return (
    <View className='travel-detail'>
      {detail && (
        <>
          <View className='stats'>
            <Text className='views'>{detail.views} 浏览</Text>
            <Text className='likes'>{detail.likes} 赞</Text>
          </View>
          {/* ...remaining detail content... */}
        </>
      )}
    </View>
  )
}

export default TravelDetail
