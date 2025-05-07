import { View, Input } from '@tarojs/components'
import { useState } from 'react'
import { AtIcon } from 'taro-ui'
import TravelCard from '@/components/TravelCard'
import { useDidShow } from '@tarojs/taro'
import { useUserStore, checkUserLoggedIn } from '@/store'
import './index.scss'

const SearchPage = () => {
  const [keyword, setKeyword] = useState('')
  const [searchResults, setSearchResults] = useState([])

  useDidShow(() => {
    checkUserLoggedIn()
  }
  )

  const handleInput = (e) => {
    setKeyword(e.detail.value)
  }

  const handleSearch = () => {
    // TODO: 实现搜索逻辑
    const mockResults = [
      {
        id: 1,
        title: `搜索结果: ${keyword}`,
        cover: 'http://temp.image.url',
        author: '作者1',
        likes: 100,
        views: 200
      }
    ]
    setSearchResults(mockResults)
  }

  return (
    <View className='search-page'>
      <View className='search-header'>
        <View className='search-input-wrap'>
          <AtIcon value='search' size='16' color='#999' />
          <Input
            className='search-input'
            placeholder='搜索目的地/游记'
            value={keyword}
            onInput={handleInput}
            onConfirm={handleSearch}
          />
        </View>
      </View>
      <View className='search-content'>
        {searchResults.map(result => (
          <TravelCard key={result.id} data={result} />
        ))}
      </View>
    </View>
  )
}

export default SearchPage