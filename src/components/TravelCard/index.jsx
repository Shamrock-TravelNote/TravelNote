import { View, Text, Image } from '@tarojs/components'
import { useState, useEffect } from 'react'
import { AtIcon } from 'taro-ui'
import Taro from '@tarojs/taro'
import travel from '@/services/api/travel'
import './index.scss'

const TravelCard = ({ data }) => {
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [imageType, setImageType] = useState('horizontal')
  console.log('TravelCard data:', data)

  useEffect(() => {
    setLikes(data.likes)
    checkImageOrientation()
    checkLikeStatus()
  }, [data])

  const checkImageOrientation = () => {
    Taro.getImageInfo({
      src: data.cover,
      success: (res) => {
        const { width, height } = res
        setImageType(height > width ? 'vertical' : 'horizontal')
      }
    })
  }

  // 检查点赞状态
  const checkLikeStatus = async () => {
    try {
      const res = await travel.checkLikeStatus(data.id)
      setIsLiked(res.isLiked)
      setLikes(res.likes)
    } catch (error) {
      console.error('获取点赞状态失败:', error)
    }
  }

  const handleLike = async (e) => {
    e.stopPropagation() // 阻止事件冒泡
    try {
      const res = await travel.toggleLike(data.id)
      setIsLiked(prev => !prev)
      setLikes(res.likes)
    } catch (error) {
      Taro.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  }

  const handleCardClick = () => {
    Taro.navigateTo({
      url: `/pages/travel-detail/index?id=${data.id}`
    })
  }

  return (
    <View className={`travel-card ${imageType}`} onClick={handleCardClick}>
      <Image 
        className='card-image' 
        src={data.cover} 
        mode='aspectFill'
      />
      <View className='card-content'>
        <Text className='title'>{data.title}</Text>
        <View className='bottom-row'>
          <View className='author-info'>
            <Image className='avatar' src={data.author.avatar} />
            <Text className='author-name'>{data.author.nickname}</Text>
          </View>
          <View className='like-btn' onClick={handleLike}>
            <AtIcon value={isLiked ? 'heart-2' : 'heart'} size='20' color={isLiked ? '#ff4757' : '#333'} />
            <Text className='like-count'>{likes}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default TravelCard
