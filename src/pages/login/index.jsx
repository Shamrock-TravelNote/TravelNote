import { View, Text, Input, Button } from '@tarojs/components'
import { useState } from 'react'
import './index.scss'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  return (
    <View className='auth'>
      <Text className='title'>{isLogin ? '登录' : '注册'}</Text>
      <View className='form'>
        <Input
          className='input'
          placeholder='用户名'
          value={formData.username}
        />
        <Input
          className='input'
          type='password'
          placeholder='密码'
          value={formData.password}
        />
        <Button className='submit-btn'>{isLogin ? '登录' : '注册'}</Button>
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
