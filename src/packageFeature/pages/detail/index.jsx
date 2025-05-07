import { View, Text, Image } from '@tarojs/components'
import { useDidShow } from '@tarojs/taro'
import { useUserStore, checkUserLoggedIn } from '@/store'
import './index.scss'

const TravelDetail = () => {

  useDidShow(() => {
    checkUserLoggedIn()
  }
  )

  return (
    <View className='travel-detail'>
      <View className='detail-header'>
        <Text className='title'>游记标题</Text>
        <View className='author-info'>
          <Text className='author'>作者名称</Text>
          <Text className='date'>发布时间</Text>
        </View>
      </View>
      <View className='detail-content'>
        <Image className='cover-image' src='' mode='aspectFill' />
        <Text className='content'>游记内容</Text>
      </View>
      <View className='detail-footer'>
        <View className='action-bar'>
          <Text className='like'>点赞</Text>
          <Text className='comment'>评论</Text>
          <Text className='share'>分享</Text>
        </View>
      </View>
    </View>
  )
}

export default TravelDetail
