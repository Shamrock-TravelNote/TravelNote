import { View, Text, Textarea } from '@tarojs/components'
import { useState } from 'react'
import { AtImagePicker, AtButton } from 'taro-ui'
import Taro from '@tarojs/taro'
import uploadApi from '@/services/api/upload'
// import withAuth from '@/hoc/withAuth'
import { useUserStore, checkLogin } from '@/store'
// import CustomTabBar from '@/custom-tab-bar'
import './index.scss'

// TODO: 封装上传组件，支持图片和视频上传，保证两者互斥，最好不用系统原生照片库，实现类似抖音、小红书的
const Publish = () => {
  const { setActiveTabIndex } = useUserStore(state => ({
    setActiveTabIndex: state.setActiveTabIndex
  }))
  const { userInfo } = useUserStore()
  const [files, setFiles] = useState([])
  const [content, setContent] = useState('')
  const [uploading, setUploading] = useState(false)

  onDidShow(() => {
    setActiveTabIndex(1)
  })
  
  if(!userInfo) {
    return <view>请先登录</view>
  }

  // 处理图片选择
  const handleImageChange = (newFiles) => {
    setFiles(newFiles)
  }

  // 处理图片删除
  const handleImageRemove = (index) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
  }

  // 处理内容输入
  const handleContentChange = (e) => {
    setContent(e.detail.value)
  }

  // 处理单个图片上传
  const uploadImage = async (tempFilePath) => {
    try {
      const fileUrl = await uploadApi.uploadTempFile(tempFilePath)
      return fileUrl
    } catch (error) {
      console.error('图片上传失败:', error)
      throw error
    }
  }

  // 发布游记
  const handlePublish = async () => {
    if (!content.trim()) {
      Taro.showToast({ title: '请输入游记内容', icon: 'none' })
      return
    }

    if (files.length === 0) {
      Taro.showToast({ title: '请至少上传一张图片', icon: 'none' })
      return
    }

    try {
      setUploading(true)
      const uploadedFiles = await Promise.all(
        files.map(file => uploadImage(file.url))
      )

      // 这里可以调用创建游记的 API
      await createTravel({
        content,
        images: uploadedFiles
      })

      Taro.showToast({ title: '发布成功', icon: 'success' })
      setFiles([])
      setContent('')
    } catch (error) {
      console.error('发布失败:', error)
      Taro.showToast({ title: '发布失败', icon: 'none' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <View className='publish'>
      <View className='publish-form'>
        <Text className='form-title'>发布游记</Text>
        <AtImagePicker
          files={files}
          onChange={handleImageChange}
          onRemove={handleImageRemove}
          showAddBtn={files.length < 9}
          multiple
          count={9}
        />
        <Textarea
          className='content-input'
          placeholder='分享你的旅行故事...'
          value={content}
          onInput={handleContentChange}
        />
        <AtButton
          className='publish-btn'
          type='primary'
          loading={uploading}
          onClick={handlePublish}
        >
          发布
        </AtButton>
      </View>
    </View>
  )
}

export default Publish
