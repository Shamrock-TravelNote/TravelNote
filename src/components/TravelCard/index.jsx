import { View, Text, Image } from '@tarojs/components'
import { useState, useEffect } from 'react'
import { AtIcon } from 'taro-ui'
import './index.scss'

const TravelCard = ({ data }) => {
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(0)

  useEffect(() => {
    setLikes(data.likes)
  }, [data.likes])

  const handleLike = () => {
    setIsLiked(prev => {
      const newIsLiked = !prev
      setLikes(current => newIsLiked ? current + 1 : current - 1)
      return newIsLiked
    })
  }

  return (
    <View className='travel-card'>
      <Image className='card-image' src={data.cover} mode='widthFix' />
      <View className='card-content'>
        <Text className='title'>{data.title}</Text>
        <View className='author-row'>
          <Image className='avatar' src={data.authorAvatar} />
          <Text className='author-name'>{data.author}</Text>
        </View>
        <View className='interaction-row'>
          <View className='like-btn' onClick={handleLike}>
            <AtIcon value={isLiked ? 'heart-2' : 'heart'} size='20' color={isLiked ? '#ff4757' : '#333'} />
            <Text className='like-count'>{likes}</Text>
          </View>
          <Text className='views'>{data.views} 浏览</Text>
        </View>
      </View>
    </View>
  )
}

export default TravelCard
