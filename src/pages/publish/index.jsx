import { View, Text, Textarea, Input } from '@tarojs/components'
import { useState, useCallback } from 'react'
import { useDidShow } from '@tarojs/taro'
import { AtImagePicker, AtButton } from 'taro-ui'
import Taro from '@tarojs/taro'
// import uploadApi from '@/services/api/upload'
import { useUserStore, checkUserLoggedIn } from '@/store'
import MediaPicker from '@/components/MediaPicker'
import { upload, travel } from '@/services'
import './index.scss'

const Publish = () => {
  // 使用 useCallback 来缓存选择器
  const setActiveTabIndex = useUserStore(useCallback(state => state.setActiveTabIndex, []))
  const userInfo = useUserStore(useCallback(state => state.userInfo, []))
  
  const [files, setFiles] = useState([])
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [uploading, setUploading] = useState(false)

  useDidShow(() => {
    console.log('Publish 页面显示')
    checkUserLoggedIn()
    setActiveTabIndex(1)
  })

  // 处理图片选择
  const handleMediaChange = (newFiles) => {
    console.log('选择的文件:', newFiles)
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
      const fileUrl = await upload.uploadTempFile(tempFilePath)
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
      Taro.showToast({ title: '请至少上传一张图片或视频', icon: 'none' })
      return
    }

    try {
      setUploading(true)
      console.log('files:', files)
      // const uploadedFiles = await Promise.all(
      //   files.map(file => uploadImage(file.url))
      // )

      // 这里可以调用创建游记的 API
      // await travel.createTravel({
      //   title,
      //   content,
      //   images: uploadedFiles
      // })

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
        {/* <AtImagePicker
          files={files}
          onChange={handleMediaChange}
          onRemove={handleImageRemove}
          showAddBtn={files.length < 9}
          multiple
          count={9}
        /> */}
        <MediaPicker
          value={files}
          maxCount={9}
          onChange={handleMediaChange}
          // onRemove={handleImageRemove}
        />
        <Input
          className='title-input'
          placeholder='添加标题'
          value={title}
          onInput={(e) => setTitle(e.detail.value)}
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
