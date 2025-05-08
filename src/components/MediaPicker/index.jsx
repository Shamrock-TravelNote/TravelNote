import React, { useState } from 'react';
import { View, Image, Video, Button, CoverView, CoverImage } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

const MediaPicker = ({ value = [], maxCount = 9, onChange }) => {
  const [files, setFiles] = useState(value);

  const triggerChange = list => {
    setFiles(list);
    onChange && onChange(list);
  };

  const handleAdd = () => {
    const remain = maxCount - files.length;
    if (remain <= 0) return;

    Taro.chooseMedia({
      count: remain,
      mediaType: ['image', 'video'],
      sourceType: ['album', 'camera'],
      maxDuration: 60,
    }).then(res => {
      const chosen = res.tempFiles.map(f => ({
        url: f.tempFilePath,
        type: f.fileType,
        width: f.width,
        height: f.height,
        mediaType: f.width > f.height ? 'horizontal' : 'vertical',
        duration: f.duration
      }));
      triggerChange([...files, ...chosen]);
    });
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
      {files.length < maxCount && (
        <View className="media-item add-btn" onClick={handleAdd}>
          <CoverView className="plus">+</CoverView>
        </View>
      )}
    </View>
  );
};

export default MediaPicker;
