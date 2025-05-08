import { View, Text, Input, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { checkUserLoggedIn, useUserStore } from '../../store/userStore'
import { auth } from '../../services'
import './index.scss'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const { setToken, setUserInfo } = useUserStore()

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 用户自行登录/注册
  const handleSubmit = async () => {
    setLoading(true)
    Taro.showLoading({ title: isLogin ? '登录中...' : '注册中...' })
    try {
      const authApi = isLogin ? auth.login : auth.register
      const res = await authApi(formData)
      console.log('登录/注册API响应:', res)

      if (res && res.token) {
        console.log('登录/注册成功:', res)
        setToken(res.token)
        setUserInfo(res.userInfo)
        
        // 获取页面栈
        const pages = Taro.getCurrentPages()
        if (pages.length > 1) {
          // 如果有上一页，则返回上一页
          Taro.navigateBack()
        } else {
          // 否则跳转到首页
          Taro.switchTab({ url: '/pages/home/index' })
        }
      }
    } catch (error) {
      console.error('登录/注册详细错误:', {
        error,
        isAxiosError: error.isAxiosError,
        response: error.response,
        message: error.message
      })
      Taro.showToast({
        title: error.message || (isLogin ? '登录失败' : '注册失败'),
        icon: 'none'
      })
    } finally {
      setLoading(false)
      Taro.hideLoading()
    }
  }

  // 微信登录
  const handleWechatLogin = async () => {
    console.log('开始微信登录')
    setLoading(true)
    Taro.showLoading({ title: '登录中...' })
    try {
      const res = await Taro.login()
      console.log('微信登录返回的code:', res)
      if (res.code) {
        // 添加请求前日志
        console.log('准备发送微信登录请求')
        const result = await auth.wechatLogin(res.code)
        // 添加响应日志
        console.log('微信登录API响应:', result) 
        if (result && result.token) {
          console.log('微信登录成功:', result)
          setToken(result.token)
          setUserInfo(result.userInfo)

          // 获取页面栈
          const pages = Taro.getCurrentPages()
          if (pages.length > 1) {
            // 如果有上一页，则返回上一页
            Taro.navigateBack()
          } else {
            // 否则跳转到首页
            Taro.switchTab({ url: '/pages/home/index' })
          }
        } else {
          console.log('微信登录失败:', result)
          Taro.showToast({
            title: '微信登录失败',
            icon: 'none'
          })
        }
      }
    } catch (error) {
      console.error('微信登录详细错误:', {
        error,
        isAxiosError: error.isAxiosError,
        response: error.response,
        message: error.message
      })
      // 处理错误
      if (error.isAxiosError) {
        console.log('微信登录失败:', error.response?.data)
        Taro.showToast({
          title: error.response.data.message || '微信登录失败',
          icon: 'none'
        })
        return
      }
      Taro.showToast({
        title: error.message || '微信登录失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
      Taro.hideLoading()
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
        {Taro.getEnv() === Taro.ENV_TYPE.WEAPP && (
          <View className='wx-login-section'>
            <Button className='wechat-login-btn' onClick={handleWechatLogin} loading={loading}>
              微信一键登录
            </Button>
          </View>
        ) }
      </View>
    </View>
  )
}

export default Auth
