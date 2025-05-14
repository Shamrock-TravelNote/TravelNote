import { AtTabs, AtTabsPane } from 'taro-ui'
import { useMemo } from 'react'

const TravelPane = ({ current, onClick, tabList, children }) => {
  const tabPanes = useMemo(() => {
    return tabList.map((_, index) => (
      <AtTabsPane current={current} index={index} key={index}>
        {current === index && children}
      </AtTabsPane>
    ))
  }, [current, tabList.length, children])

  return (
    <AtTabs current={current} tabList={tabList} onClick={onClick} animated={true} swipeable={true}>
      {tabPanes}
    </AtTabs>
  )
}

export default TravelPane