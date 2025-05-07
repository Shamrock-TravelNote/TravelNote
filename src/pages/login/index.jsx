import { View, Text, Input, Button } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { useUserStore } from '../../store/userStore'
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

  const handleSubmit = async () => {
    try {
      const service = isLogin ? services.auth.login : services.auth.register
      const res = await service(formData)
      if (res.data) {
        setToken(res.data.token)
        setUserInfo(res.data.userInfo)
        Taro.showToast({
          title: isLogin ? '登录成功' : '注册成功',
          icon: 'success',
          duration: 2000,
          success: () => {
            Taro.switchTab({ url: '/pages/index/index' })
          }
        })
      }
    } catch (error) {
      Taro.showToast({
        title: error.message || '操作失败',
        icon: 'none'
      })
    }
  }

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
