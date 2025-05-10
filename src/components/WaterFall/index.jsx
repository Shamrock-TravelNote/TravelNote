import { View, ScrollView, GridView } from '@tarojs/components'
import { AtLoadMore } from 'taro-ui'
import { useEffect, useRef, useState } from 'react'
import TravelCard from '@/components/TravelCard'
import travel from '@/services/api/travel'
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro'
import { useUserStore } from '@/store'
import './index.scss'

const PAGE_LIMIT = 10
const SCROLL_THRESHOLD = 400

// TODO：支持用户下拉界面更新整体数据
const WaterFall = ({keyword='', isProfile=false}) => {
  const scrollViewRef = useRef(null)
  const [scrollViewHeight, setScrollViewHeight] = useState('100vh')

  const [travelNotes, setTravelNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // 计算单项高度逻辑，与原 Grid 计算保持一致
  const getItemSize = index => {
    const note = travelNotes[index]
    return note.mediaType === 'video'
      ? (note.detailType === 'vertical' ? 540 : 380)
      : (note.detailType === 'vertical' ? 520 : 360)
  }
  
  useEffect(() => {
    fetchTravelNotes(1, true)
    Taro.nextTick(() => {
      const query = Taro.createSelectorQuery();
      query.select('.scroll-view').boundingClientRect(rect => {
        if (rect) {
          console.log('height:', rect.height)
          setScrollViewHeight(rect.height);
        }
      }).exec();
    });
  }, [])


  const fetchTravelNotes = async (pageToFetch, isRefresh = false) => {
    if (loading || (!isRefresh && !hasMore)) {
      return
    }

    setLoading(true)
    try {
      let response
      // 获取游记列表
      if (!isProfile) {
        console.log('normal')
        response = await travel.getTravelList({ page: pageToFetch, limit: PAGE_LIMIT })
        console.log(response)
      } else {
        console.log('profile')
        response = await travel.getMyTravelList({ page: pageToFetch, limit: PAGE_LIMIT })
      }
      

      const newTravelNotes = response.data || []
      const totalNotes = response.total || 0

      // console.log(`获取第 ${pageToFetch} 页游记列表`, newTravelNotes)

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
      // TODO: 防止切换页面时产生界面闪烁，设置合适的Loading界面
      if (!isProfile) {
        setLoading(false)
      } else {
        setTimeout(() => {
          setLoading(false)
        }, 1800);
      }
    }
  }

  const handleScroll = (event) => {
    if (!hasMore || loading || !scrollViewHeight) return;

    const { scrollTop, scrollHeight } = event.detail;
    // console.log(scrollTop, scrollHeight, scrollViewHeight);

    if (scrollTop + scrollViewHeight >= scrollHeight - SCROLL_THRESHOLD) {
      console.log('滚动接近底部，提前加载更多');
      fetchTravelNotes(currentPage + 1);
    }
  };

  usePullDownRefresh(async() => {
    console.log('下拉刷新')
    setCurrentPage(1)
    setHasMore(true)
    await fetchTravelNotes(1, true)
    Taro.stopPullDownRefresh()
  })

  return (
    <View className='home'>
      <View className='content'>
        <ScrollView
          ref={scrollViewRef}
          className='scroll-view'
          scrollY
          scrollWithAnimation
          enableBackToTop
          onScroll={handleScroll} // 使用 onScroll 监听
          // lowerThreshold={SCROLL_THRESHOLD} 
        >
          <GridView
            type='masonry'
            crossAxisCount={2}
            mainAxisGap={10}
            crossAxisGap={10}
            // style={{ height: '100vh' }}
            // onScrollToLower={handleScrollToLower}
            // onScroll={e => {
            //   console.log('Scroll event:', e)
            // }}
            onItemSize={getItemSize}
          >
            {travelNotes.map(note => {
              return (
                <TravelCard
                  key={note.id}
                  data={{...note}}
                />
              )
            })}
          </GridView>
          <AtLoadMore
            status={loading ? 'loading' : hasMore ? 'more' : 'noMore'}
            noMoreText='没有更多了'
            moreBtnText='加载更多'
            loadingText='加载中...'
          />
        </ScrollView>
      </View>
    </View>
  )
}

export default WaterFall
