import { View, Text, Input } from "@tarojs/components";
import { useState, useEffect } from "react";
import { AtIcon } from "taro-ui";
import Taro, { useDidShow } from "@tarojs/taro"; // 引入 Taro
import WaterFall from "@/components/WaterFall"; // 引入 WaterFall 组件
import { useUserStore, checkUserLoggedIn } from "@/store";
import "./index.scss";

// DONE：实现搜索逻辑
// DONE：搜索用户名、昵称、内容，配合后端API
// TODO：搜索历史记录（搭配后端新增数据字段）
// TODO：语义化搜索（待定）
// TODO：搜索推荐词（待定）
const SearchPage = () => {
  const [keyword, setKeyword] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(0); // 用于触发搜索的key
  const [currentSearchKeyword, setCurrentSearchKeyword] = useState(""); // 当前正在用于搜索的关键词

  useDidShow(() => {
    checkUserLoggedIn();
  });

  const handleInput = (e) => {
    setKeyword(e.detail.value);
  };

  // 当用户点击键盘上的完成/搜索按钮时触发
  const handleConfirmSearch = () => {
    console.log("Search confirmed with keyword:", keyword);
    // 更新当前搜索关键词，并触发WaterFall组件的重新渲染和数据加载
    if (keyword.trim() !== currentSearchKeyword) {
      setCurrentSearchKeyword(keyword.trim());
      setSearchTrigger((prev) => prev + 1); // 改变key以强制WaterFall刷新
    } else if (keyword.trim() === "" && currentSearchKeyword !== "") {
      // 如果清空了搜索词，也应该刷新以显示空状态或默认推荐（如果实现的话）
      setCurrentSearchKeyword("");
      setSearchTrigger((prev) => prev + 1);
    }
  };

  return (
    <View className="search-page">
      <View className="search-header">
        <View className="search-input-wrap">
          <AtIcon value="search" size="16" color="#999" />
          <Input
            className="search-input"
            placeholder="搜索目的地/游记"
            value={keyword}
            onInput={handleInput}
            onConfirm={handleConfirmSearch}
            confirmType="search"
          />
        </View>
      </View>
      <View className="search-content">
        {currentSearchKeyword ? (
          <WaterFall
            key={`search-${currentSearchKeyword}-${searchTrigger}`}
            keyword={currentSearchKeyword}
            itemNavigationSource="search"
          />
        ) : (
          <View className="empty-search-tip">
            <Text>请输入关键词进行搜索</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default SearchPage;
