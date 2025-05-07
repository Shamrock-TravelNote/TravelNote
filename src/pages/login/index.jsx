import { View, Text, Input, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { checkUserLoggedIn, useUserStore } from '../../store/userStore'
import services from '../../services'
import './index.scss'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const { setToken, setUserInfo } = useUserStore()

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 修改 handleSubmit 中的跳转逻辑
  const handleSubmit = async () => {
    try {
      const service = isLogin ? services.auth.login : services.auth.register
      const res = await service(formData)
      if (res.data) {
        setToken(res.data.token)
        setUserInfo(res.data.userInfo)
        
        // 获取页面栈
        const pages = Taro.getCurrentPages()
        if (pages.length > 1) {
          // 如果有上一页，则返回上一页
          Taro.navigateBack()
        } else {
          // 否则跳转到首页
          Taro.switchTab({ url: '/pages/index/index' })
        }
      }
    } catch (error) {
      Taro.showToast({
        title: error.message || '操作失败',
        icon: 'none'
      })
    }
  }

  // 移除之前的返回事件处理
  useEffect(() => {
    const pages = Taro.getCurrentPages()
    // 如果是直接打开的登录页，添加返回按钮监听
    if (pages.length <= 1) {
      const handleBackPress = () => {
        Taro.switchTab({
          url: '/pages/home/index'
        })
        return true
      }
      
      Taro.eventCenter.on('backPress', handleBackPress)
      return () => {
        Taro.eventCenter.off('backPress', handleBackPress)
      }
    }
  }, [])

  return (
    <View className='auth'>
      <Text className='title'>{isLogin ? '登录' : '注册'}</Text>
      <View className='form'>
        <Input
          className='input'
          placeholder='用户名'
          value={formData.username}
          onInput={e => handleInputChange('username', e.detail.value)}
        />
        <Input
          className='input'
          type='password'
          placeholder='密码'
          value={formData.password}
          onInput={e => handleInputChange('password', e.detail.value)}
        />
        <Button className='submit-btn' onClick={handleSubmit}>
          {isLogin ? '登录' : '注册'}
        </Button>
        <Text 
          className='switch-mode'
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? '没有账号？立即注册' : '已有账号？立即登录'}
        </Text>
      </View>
    </View>
  )
}

export default Auth
