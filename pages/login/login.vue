<template>
  <view class="login-container">
    <view class="login-header">
      <view class="logo-container">
        <view class="brain-logo">
          <image src="/static/logo.png" mode="aspectFit"></image>
        </view>
      </view>
      <text class="app-title">智能学习助手</text>
    </view>

    <view class="login-form">
      <view class="form-item">
        <input
          class="form-input"
          type="text"
          v-model="loginForm.username"
          placeholder="输入您的用户名"
          placeholder-style="color: #999"
        />
      </view>

      <view class="form-item">
        <input
          class="form-input"
          type="password"
          v-model="loginForm.password"
          placeholder="输入您的密码"
          placeholder-style="color: #999"
        />
      </view>

      <view class="form-options">
        <view class="remember-container">
          <checkbox checked="true" class="remember-checkbox"></checkbox>
          <text class="remember-text">记住我</text>
        </view>
        <text class="forgot-password" @click="handleForgotPassword"
          >忘记密码？</text
        >
      </view>

      <button class="login-btn" @click="handleLogin">登录账号</button>

      <view class="register-link">
        还没有账号？<text @click="goToRegister" class="link-text"
          >立即注册</text
        >
      </view>

      <view class="divider">
        <text>或使用以下方式登录</text>
      </view>

      <view class="social-login">
        <view class="social-btn" @click="handleSocialLogin('facebook')">
          <text class="social-icon">f</text>
        </view>
        <view class="social-btn" @click="handleSocialLogin('google')">
          <text class="social-icon">G</text>
        </view>
        <view class="social-btn" @click="handleSocialLogin('apple')">
          <text class="social-icon">A</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { userAPI } from "../../api";
import { setToken } from "../../utils/request";

export default {
  data() {
    return {
      loginForm: {
        username: "",
        password: "",
      },
      isRememberMe: true,
      isLoading: false,
    };
  },
  onLoad() {
    // 检查是否有记住的用户信息
    this.checkRememberedUser();
  },
  methods: {
    // 检查是否有记住的用户信息
    checkRememberedUser() {
      const rememberedUser = uni.getStorageSync("rememberedUser");
      if (rememberedUser) {
        this.loginForm.username = rememberedUser.username || "";
      }
    },

    // 验证用户名格式
    validateusername(username) {
      // 用户名规则：4-20个字符，支持字母、数字、下划线
      const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
      return usernameRegex.test(username);
    },

    // 处理登录
    async handleLogin() {
      // 表单验证
      if (!this.loginForm.username) {
        uni.showToast({
          title: "请输入用户名",
          icon: "none",
        });
        return;
      }

      if (!this.validateusername(this.loginForm.username)) {
        uni.showToast({
          title: "用户名格式不正确，需4-20个字符，支持字母、数字、下划线",
          icon: "none",
        });
        return;
      }

      if (!this.loginForm.password) {
        uni.showToast({
          title: "请输入密码",
          icon: "none",
        });
        return;
      }

      if (this.loginForm.password.length < 6) {
        uni.showToast({
          title: "密码长度不能少于6位",
          icon: "none",
        });
        return;
      }

      try {
        this.isLoading = true;
        // 调用登录API
        const result = await userAPI.login({
          username: this.loginForm.username,
          password: this.loginForm.password,
        });

        // 保存token到本地存储
        if (result.data) {
          setToken(result.data);
          
          // JWT token解析：从token中提取用户名
          const token = result.data;
          let username = this.loginForm.username; // 默认使用登录时的用户名
          
          try {
            // 解析JWT token (格式: header.payload.signature)
            const payload = token.split('.')[1];
            if (payload) {
              // Base64解码payload部分
              const decodedPayload = JSON.parse(decodeURIComponent(escape(atob(payload))));
              // 从payload中提取用户名（根据token结构调整字段名）
              if (decodedPayload.key) {
                username = decodedPayload.key.replace('user_', ''); // 移除'user_'前缀
              }
            }
          } catch (parseError) {
            console.warn('解析token失败，使用登录时的用户名:', parseError);
          }
          
          // 调用用户信息接口获取详细信息
          try {
            await userAPI.getUserInfo(username);
          } catch (infoError) {
            console.error('获取用户信息失败:', infoError);
            // 即使获取用户信息失败，也继续登录流程，避免影响用户体验
          }
        }

        // 记住用户信息
        if (this.isRememberMe) {
          uni.setStorageSync("rememberedUser", {
            username: this.loginForm.username,
          });
        } else {
          uni.removeStorageSync("rememberedUser");
        }

        uni.showToast({
          title: result.msg || "登录成功",
          icon: "success",
        });

        setTimeout(() => {
          // 登录成功后跳转到首页
          uni.reLaunch({
            url: "/pages/index/index",
          });
        }, 1000);
      } catch (error) {
        console.error("登录错误:", error);
        uni.showToast({
          title: error.message || "网络错误，请稍后重试",
          icon: "none",
        });
      } finally {
        this.isLoading = false;
      }
    },

    // 处理记住我选项变化
    handleRememberChange(e) {
      this.isRememberMe = e.target.checked;
    },

    handleForgotPassword() {
      uni.showToast({
        title: "功能开发中",
        icon: "none",
      });
    },

    goToRegister() {
      uni.navigateTo({
        url: "/pages/register/register",
      });
    },

    handleSocialLogin(type) {
      uni.showToast({
        title: `${type}登录功能开发中`,
        icon: "none",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 60rpx 0;
}

.login-header {
  text-align: center;
  margin-bottom: 80rpx;

  .logo-container {
    display: flex;
    justify-content: center;
    margin-bottom: 20rpx;

    .brain-logo {
      width: 160rpx;
      height: 160rpx;
      background-color: #f0f4ff;
      border-radius: 32rpx;
      display: flex;
      justify-content: center;
      align-items: center;

      image {
        width: 80rpx;
        height: 80rpx;
      }
    }
  }

  .app-title {
    font-size: 42rpx;
    color: #333333;
    font-weight: 600;
  }
}

.login-form {
  width: 100%;

  .form-item {
    margin-bottom: 32rpx;

    .form-input {
      width: 100%;
      height: 88rpx;
      border: 2rpx solid #e0e0e0;
      border-radius: 16rpx;
      padding: 0 40rpx;
      font-size: 30rpx;
      color: #333;
      background: #ffffff;
      box-sizing: border-box;

      &:focus {
        border-color: #5374f7;
      }
    }
  }

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40rpx;

    .remember-container {
      display: flex;
      align-items: center;

      .remember-checkbox {
        transform: scale(0.8);
        margin-right: 8rpx;
      }

      .remember-text {
        font-size: 28rpx;
        color: #666;
      }
    }

    .forgot-password {
      font-size: 28rpx;
      color: #5374f7;
    }
  }

  .login-btn {
    width: 100%;
    height: 88rpx;
    background-color: #5374f7;
    color: #ffffff;
    border: none;
    border-radius: 16rpx;
    font-size: 32rpx;
    font-weight: 600;
    margin-bottom: 30rpx;
  }

  .register-link {
    text-align: center;
    font-size: 28rpx;
    color: #666;
    margin-bottom: 40rpx;

    .link-text {
      color: #5374f7;
    }
  }

  .divider {
    text-align: center;
    font-size: 26rpx;
    color: #999;
    margin-bottom: 30rpx;

    text {
      position: relative;
      padding: 0 20rpx;

      &::before,
      &::after {
        content: "";
        position: absolute;
        top: 50%;
        width: 120rpx;
        height: 1rpx;
        background-color: #e0e0e0;
      }

      &::before {
        left: -120rpx;
      }

      &::after {
        right: -120rpx;
      }
    }
  }

  .social-login {
    display: flex;
    justify-content: center;
    gap: 40rpx;

    .social-btn {
      width: 80rpx;
      height: 80rpx;
      border: 2rpx solid #e0e0e0;
      border-radius: 16rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 36rpx;

      &:nth-child(1) {
        color: #3b5998;
      }

      &:nth-child(2) {
        color: #db4437;
      }

      &:nth-child(3) {
        color: #000;
      }
    }
  }
}
</style>
