import { View, Text, Input, Button, Image } from "@tarojs/components";
import { useState, useEffect, useCallback } from "react";
import Taro from "@tarojs/taro";
import { useUserStore } from "../../store/userStore";
import { auth } from "../../services";
import logoImage from "@/assets/Logo.jpeg";
import CryptoJS from "crypto-js";
import "./index.scss";

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
const MIN_PASSWORD_LENGTH = 6;

// DONE: 验证失败时Input样式同步改变
// DONE: 密码密文输出
const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { setToken, setUserInfo } = useUserStore();
  const [isUserFocused, setIsUserFocused] = useState(false);
  const [isPassFocused, setIsPassFocused] = useState(false);

  const validateUsername = useCallback((username) => {
    if (!username) {
      return "用户名不能为空";
    }
    if (!USERNAME_REGEX.test(username)) {
      return "用户名只能包含字母、数字和下划线";
    }
    return "";
  }, []);

  const validatePassword = useCallback((password) => {
    if (!password) {
      return "密码不能为空";
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return `密码长度不能少于 ${MIN_PASSWORD_LENGTH} 位`;
    }
    return "";
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleBlur = useCallback(
    (field) => {
      let errorMsg = "";
      const value = formData[field];

      if (field === "username") {
        setIsUserFocused(false);
        errorMsg = validateUsername(value);
      } else if (field === "password") {
        setIsPassFocused(false);
        errorMsg = validatePassword(value);
      }

      setErrors((prev) => ({ ...prev, [field]: errorMsg }));
    },
    [formData, validateUsername, validatePassword]
  );

  // 用户自行登录/注册
  const handleSubmit = async () => {
    const usernameError = validateUsername(formData.username);
    const passwordError = validatePassword(formData.password);

    setErrors({
      username: usernameError,
      password: passwordError,
    });

    if (usernameError || passwordError) {
      Taro.showToast({ title: "请检查输入项", icon: "none" });
      return;
    }

    setLoading(true);
    Taro.showLoading({ title: isLogin ? "登录中..." : "注册中..." });

    const hashedPassword = CryptoJS.SHA256(formData.password).toString(
      CryptoJS.enc.Hex
    );
    const dataToSend = {
      username: formData.username,
      password: hashedPassword,
    };

    try {
      const authApi = isLogin ? auth.login : auth.register;
      const res = await authApi(dataToSend);

      if (res && res.token) {
        setToken(res.token);
        setUserInfo(res.userInfo);

        // 获取页面栈
        const pages = Taro.getCurrentPages();
        if (pages.length > 1) {
          Taro.navigateBack();
        } else {
          Taro.switchTab({ url: "/pages/home/index" });
        }
      } else {
        Taro.showToast({
          title:
            (isLogin ? "登录失败" : "注册失败") +
            (res && res.message ? `: ${res.message}` : ", 请检查您的凭据"),
          icon: "none",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("登录/注册详细错误:", {
        error,
        isAxiosError: error.isAxiosError,
        response: error.response,
        message: error.message,
      });
      Taro.showToast({
        title: error.data.message || (isLogin ? "登录失败" : "注册失败"),
        icon: "none",
        duration: 2000,
      });
    } finally {
      setLoading(false);
      Taro.hideLoading();
    }
  };

  // 微信登录
  const handleWechatLogin = async () => {
    console.log("开始微信登录");
    setLoading(true);
    Taro.showLoading({ title: "登录中..." });
    try {
      const res = await Taro.login();
      // console.log('微信登录返回的code:', res)
      if (res.code) {
        // 添加请求前日志
        console.log("准备发送微信登录请求");
        const result = await auth.wechatLogin(res.code);
        // 添加响应日志
        console.log("微信登录API响应:", result);
        if (result && result.token) {
          console.log("微信登录成功:", result);
          setToken(result.token);
          setUserInfo(result.userInfo);

          // 获取页面栈
          const pages = Taro.getCurrentPages();
          if (pages.length > 1) {
            // 如果有上一页，则返回上一页
            Taro.navigateBack();
          } else {
            // 否则跳转到首页
            Taro.switchTab({ url: "/pages/home/index" });
          }
        } else {
          console.log("微信登录失败:", result);
          Taro.showToast({
            title: "微信登录失败",
            icon: "none",
          });
        }
      }
    } catch (error) {
      console.error("微信登录详细错误:", {
        error,
        isAxiosError: error.isAxiosError,
        response: error.response,
        message: error.message,
      });
      // 处理错误
      if (error.isAxiosError) {
        console.log("微信登录失败:", error.response?.data);
        Taro.showToast({
          title: error.response.data.message || "微信登录失败",
          icon: "none",
        });
        return;
      }
      Taro.showToast({
        title: error.message || "微信登录失败",
        icon: "none",
      });
    } finally {
      setLoading(false);
      Taro.hideLoading();
    }
  };

  // 移除之前的返回事件处理
  useEffect(() => {
    const pages = Taro.getCurrentPages();
    // 如果是直接打开的登录页，添加返回按钮监听
    if (pages.length <= 1) {
      const handleBackPress = () => {
        Taro.switchTab({
          url: "/pages/home/index",
        });
        return true;
      };

      Taro.eventCenter.on("backPress", handleBackPress);
      return () => {
        Taro.eventCenter.off("backPress", handleBackPress);
      };
    }
  }, []);

  return (
    <View className="auth">
      <Image className="logo" src={logoImage} mode="aspectFit" />
      <Text className="page-title">{isLogin ? "欢迎回来！" : "加入我们"}</Text>
      <View className="form-card">
        <Text className="title">{isLogin ? "登录" : "注册"}</Text>
        <View className="input-group">
          <Input
            className={`input ${isUserFocused ? "focused" : ""} ${
              errors.username ? "error" : ""
            }`}
            placeholder="用户名"
            focus
            value={formData.username}
            onFocus={() => {
              setIsUserFocused(true);
            }}
            onBlur={() => handleBlur("username")}
            onInput={(e) => handleInputChange("username", e.detail.value)}
            maxlength={20}
          />
          {errors.username && (
            <Text className="error-message">{errors.username}</Text>
          )}
        </View>
        <View className="input-group">
          <Input
            className={`input ${isPassFocused ? "focused" : ""} ${
              errors.password ? "error" : ""
            }`}
            type="password"
            password
            placeholder="密码"
            // focus
            onFocus={() => setIsPassFocused(true)}
            onBlur={() => handleBlur("password")}
            value={formData.password}
            onInput={(e) => handleInputChange("password", e.detail.value)}
            onConfirm={handleSubmit}
          />
          {errors.password && (
            <Text className="error-message">{errors.password}</Text>
          )}
        </View>
        <Button className="submit-btn" onClick={handleSubmit}>
          {isLogin ? "登录" : "注册"}
        </Button>
        {Taro.getEnv() === Taro.ENV_TYPE.WEAPP && (
          <View className="wx-login-section">
            <Button
              className="wechat-login-btn"
              onClick={handleWechatLogin}
              loading={loading}
            >
              微信一键登录
            </Button>
          </View>
        )}
        <Text
          className="switch-mode"
          onClick={() => {
            if (loading) return;
            setIsLogin(!isLogin);
            setFormData({ username: "", password: "" });
            setErrors({ username: "", password: "" });
          }}
        >
          {isLogin ? "没有账号？立即注册" : "已有账号？立即登录"}
        </Text>
      </View>
    </View>
  );
};

export default Auth;
