import { View, Text, Textarea } from '@tarojs/components'
import './index.scss'

const Publish = () => {
  return (
    <View className='publish'>
      <View className='publish-form'>
        <Text className='form-title'>发布游记</Text>
        <Textarea className='content-input' placeholder='分享你的旅行故事...' />
      </View>
    </View>
  )
}

export default Publish
