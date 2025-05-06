import { View } from '@tarojs/components'
import { useEffect, useState } from 'react'
import SearchBar from '@/components/SearchBar'
import TravelCard from '@/components/TravelCard'
import travel from '@/services/api/travel'
import './index.scss'

const Home = () => {
  const [travelNotes, setTravelNotes] = useState([])
  const [loading, setLoading] = useState(false)

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
