import { View, Text } from '@tarojs/components'
import { AtIcon } from 'taro-ui'
import TravelCard from '@/components/TravelCard'  // 建议使用别名路径
import './index.scss'

const Home = () => {
  const travelNotes = [
    {
      id: 1,
      title: '杭州西湖三日游',
      cover: 'http://www.citsguilin.com/pic/guonei/hangzhou/xi-hu-02.jpg',
      author: '小明',
      authorAvatar: 'https://example.com/avatar1.jpg',
      likes: 123,
      views: 456
    },
    {
      id: 2,
      title: '北京故宫一日游',
      cover: 'http://www.citsguilin.com/pic/guonei/hangzhou/xi-hu-02.jpg',
      author: '小红',
      likes: 321,
      views: 654
    }
  ]

  return (
    <>
    <View className='home'>
      <View className='search-bar'>
        <AtIcon value='search' size='16' color='#999' />
        <Text className='placeholder'>搜索目的地/游记</Text>
      </View>
      <View className='travel-list'>
        {travelNotes.map(note => (
          <TravelCard key={note.id} data={note} />
        ))}
      </View>
    </View>
    </>
  )
}

export default Home
