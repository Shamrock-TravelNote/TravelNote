import { View, Text } from "@tarojs/components";
import { AtIcon } from "taro-ui";
import Taro from "@tarojs/taro";
import "./index.scss";

const SearchBar = () => {
  const handleSearch = () => {
    // 修改为新的页面路径
    Taro.navigateTo({
      url: "/packageFeature/pages/search/index",
    });
  };

  return (
    <View className="search-bar" onClick={handleSearch}>
      <AtIcon value="search" size="16" color="#999" />
      <Text className="placeholder">搜索目的地/游记</Text>
    </View>
  );
};

export default SearchBar;
