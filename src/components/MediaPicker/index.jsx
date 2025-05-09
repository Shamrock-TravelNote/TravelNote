import React, { useState } from 'react';
import { View, Image, Video, Button, CoverView, CoverImage } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';
import { all } from 'axios';

const MediaPicker = ({ value = [], maxCount = 9, onChange }) => {
  const [files, setFiles] = useState(value);

  const triggerChange = list => {
    setFiles(list);
    onChange && onChange(list);
    console.log('触发onChange:', list);
  };

  // 映射文件属性
  const getMediaInfo = async (f) => {
    if (f.fileType === 'image') {
      const info = await Taro.getImageInfo({ src: f.tempFilePath });
      return {
        url: f.tempFilePath,
        type: 'image',
        width: info.width,
        height: info.height,
        orientation: info.width > info.height ? 'horizontal' : 'vertical'
      };
    } else {
      return {
        url: f.tempFilePath,
        type: 'video',
        width: f.width,
        height: f.height,
        duration: f.duration,
        orientation: f.width > f.height ? 'horizontal' : 'vertical',
      };
    }
  };

  const validateChosenType = chosen => {
    const types = new Set(chosen.map(f => f.type));
    console.log('校验文件类型:', types);
    return types.size > 1 ? '请一次只选择图片或只选择视频' : null;
  };

  // 校验与已有列表类型一致性
  const validateAgainstExisting = (existing = [], newType = []) =>
    existing.length > 0 && existing[0].type !== newType
      ? `只能上传${existing[0].type}文件`
      : null;

  // 校验视频数量
  const validateVideoCount = (existing = [], chosen = []) => {
    const ev = existing.filter(f => f.type === 'video').length;
    const nv = chosen.filter(f => f.type === 'video').length;
    return ev + nv > 1 ? '只能上传一条视频' : null;
  };

  // 处理添加文件
  const handleAdd = async () => {
    const remain = maxCount - files.length;
    if (remain <= 0) {
      Taro.showToast({
        title: `最多选择${maxCount}个文件`,
        icon: 'none',
        duration: 2000,
      });
      return;
    }

    try {
      const res = await Taro.chooseMedia({
        count: remain,
        mediaType: ['image', 'video'],
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        maxDuration: 60,
      });
      console.log('res选择的文件:', res.tempFiles);

      // 1. 映射文件并计算 orientation
      const chosen = await Promise.all(res.tempFiles.map(getMediaInfo));
      console.log('chosen选择的文件:', chosen);

      // 2. 校验
      let err = null;
      err = validateChosenType(chosen);
      if (err) throw new Error(err);

      err = validateAgainstExisting(files, chosen[0]?.type);
      if (err) throw new Error(err);

      err = validateVideoCount(files, chosen);
      if (err) throw new Error(err);

      // 3. 全部通过，更新列表
      triggerChange([...files, ...chosen]);
    } catch (e) {
      console.error('选择文件失败:', e);
      Taro.showToast({
        title: e.message || '选择文件失败',
        icon: 'none',
        duration: 2000,
      });
    }
  };

  const handlePreview = (file, index) => {
    if (file.type === 'image') {
      console.log('Previewing image:', file.url);
      Taro.previewImage({
        current: file.url,
        urls: files.filter(f => f.type === 'image').map(f => f.url),
      });
    } else {
      console.log('Previewing video:', file.url);
      Taro.showModal({ title: '视频预览', content: '', showCancel: false });
      // Taro.navigateTo({ url: `/pages/videoPlayer/index?src=${encodeURIComponent(file.url)}` });
    }
  };

  const handleDelete = index => {
    const newList = files.filter((_, i) => i !== index);
    triggerChange(newList);
  };

  return (
    <View className="media-picker">
      {files.map((file, idx) => (
        <View
          key={idx}
          className={
          file.type === 'image'
            ? 'media-item'
            : `media-item video-item ${file.mediaType || ''}`
          }
        >
          {file.type == 'image' ? (
            <CoverImage
              className="thumb"
              src={file.url}
              onClick={() => handlePreview(file, idx)}
            />
          ) : (
            <View className={`video-thumb ${file.mediaType||''}`} >
              <Video
                src={file.url}
                className="thumb"
                muted
                autoplay={false}
                initialTime={0}
                objectFit="cover"
                showPlayBtn={false}
              />
              {/* <CoverView className="play-icon">▶</CoverView> */}
            </View>
          )}
          <Button
            className="delete-btn"
            onClick={() => handleDelete(idx)}
            size="mini"
            type="warn"
          >删除</Button>
        </View>
      ))}
      {(
        (files.length === 0) ||
        (files[0]?.type === 'image' && files.length < 9)
      ) && (
        <View className="media-item add-btn" onClick={handleAdd}>
          <CoverView className="plus">+</CoverView>
        </View>
      )}
    </View>
  );
};

export default MediaPicker;
