<template>
  <view class="register-container">
    <view class="register-header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon"></text>
      </view>
      <text class="page-title">创建账户</text>
    </view>
    
    <scroll-view scroll-y="true" class="register-content">
      <view class="register-form">
        <view class="form-group">
          <text class="form-label">姓名</text>
          <input 
            class="form-input" 
            type="text" 
            v-model="registerForm.name"
            placeholder="输入您的姓名"
            placeholder-style="color: #999"
          />
        </view>
        <view class="form-group">
          <text class="form-label">电子邮箱</text>
          <input 
            class="form-input" 
            type="text" 
            v-model="registerForm.email"
            placeholder="输入您的邮箱"
            placeholder-style="color: #999"
          />
        </view>
        <view class="form-group">
          <text class="form-label">验证码</text>
          <view class="verification-code-container">
            <input 
              class="form-input verification-input" 
              type="text" 
              v-model="registerForm.code"
              placeholder="输入验证码"
              placeholder-style="color: #999"
            />
            <button 
              class="send-code-btn" 
              @click="sendcode" 
              :disabled="countdown > 0"
            >
              {{ countdown > 0 ? `${countdown}秒后重试` : '发送验证码' }}
            </button>
          </view>
        </view>
        <view class="form-group">
          <text class="form-label">密码</text>
          <input 
            class="form-input" 
            type="password" 
            v-model="registerForm.password"
            placeholder="设置您的密码（至少6位）"
            placeholder-style="color: #999"
          />
          <view v-if="registerForm.password" class="password-strength">
            <view class="strength-item" :class="{ 'strength-weak': getPasswordStrength(registerForm.password) >= 1 }"></view>
            <view class="strength-item" :class="{ 'strength-medium': getPasswordStrength(registerForm.password) >= 3 }"></view>
            <view class="strength-item" :class="{ 'strength-strong': getPasswordStrength(registerForm.password) >= 5 }"></view>
          </view>
        </view>
        <view class="form-group">
          <text class="form-label">确认密码</text>
          <input 
            class="form-input" 
            type="password" 
            v-model="registerForm.confirmPassword"
            placeholder="再次输入密码"
            placeholder-style="color: #999"
          />
        </view>
        <view class="agreement-container">
          <checkbox :checked="isAgreed" class="agreement-checkbox" @change="handleAgreementChange"></checkbox>
          <text class="agreement-text">
            我同意<text class="agreement-link" @click="viewTerms">服务条款</text>和<text class="agreement-link" @click="viewPrivacy">隐私政策</text>
          </text>
        </view>
        <button class="register-btn" @click="handleRegister">注册账号</button>
        <view class="login-link">
          已有账号？<text @click="goToLogin" class="link-text">返回登录</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { userAPI } from '../../api';

export default {
  data() {
    return {
      registerForm: {
        name: '',
        email: '',
        code: '',
        password: '',
        confirmPassword: ''
      },
      countdown: 0,
      timer: null,
      isAgreed: true,
      isLoading: false,
      isSendingCode: false
    }
  },
  onUnload() {
    // 清理定时器
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    
    // 验证邮箱格式
    validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    
    // 发送验证码
    async sendcode() {
      // 验证邮箱
      if (!this.registerForm.email) {
        uni.showToast({
          title: '请输入邮箱地址',
          icon: 'none'
        });
        return;
      }
      
      if (!this.validateEmail(this.registerForm.email)) {
        uni.showToast({
          title: '请输入有效的邮箱地址',
          icon: 'none'
        });
        return;
      }
      
      try {
        this.isSendingCode = true;
        console.log(this.registerForm.email)
        // 调用发送验证码API
        const result = await userAPI.sendEmailCode(this.registerForm.email);
        
        
        if (result.code === 0) {
          // 开始倒计时
          this.startCountdown();
          
          uni.showToast({
            title: result.msg || '验证码已发送',
            icon: 'success'
          });
        } else {
          uni.showToast({
            title: result.msg || '发送验证码失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('发送验证码错误:', error);
        uni.showToast({
          title: error.message || '网络错误，请稍后重试',
          icon: 'none'
        });
      } finally {
        this.isSendingCode = false;
      }
    },
    
    // 开始倒计时
    startCountdown() {
      this.countdown = 60;
      
      if (this.timer) {
        clearInterval(this.timer);
      }
      
      this.timer = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          clearInterval(this.timer);
          this.timer = null;
        }
      }, 1000);
    },
    
    // 密码强度检查
    getPasswordStrength(password) {
      if (!password) return 0;
      let strength = 0;
      // 长度检查
      if (password.length >= 8) strength++;
      // 包含数字
      if (password.match(/[0-9]/)) strength++;
      // 包含小写字母
      if (password.match(/[a-z]/)) strength++;
      // 包含大写字母
      if (password.match(/[A-Z]/)) strength++;
      // 包含特殊字符
      if (password.match(/[!@#$%^&*(),.?":{}|<>]/)) strength++;
      return strength;
    },
    
    // 处理注册
    async handleRegister() {
      // 表单验证
      if (!this.registerForm.name) {
        uni.showToast({
          title: '请输入姓名',
          icon: 'none'
        });
        return;
      }
      
      if (!this.registerForm.email) {
        uni.showToast({
          title: '请输入邮箱',
          icon: 'none'
        });
        return;
      }
      
      if (!this.validateEmail(this.registerForm.email)) {
        uni.showToast({
          title: '请输入有效的邮箱地址',
          icon: 'none'
        });
        return;
      }
      
      if (!this.registerForm.code) {
        uni.showToast({
          title: '请输入验证码',
          icon: 'none'
        });
        return;
      }
      
      if (this.registerForm.code.length < 4) {
        uni.showToast({
          title: '请输入有效的验证码',
          icon: 'none'
        });
        return;
      }
      
      if (!this.registerForm.password) {
        uni.showToast({
          title: '请设置密码',
          icon: 'none'
        });
        return;
      }
      
      if (this.registerForm.password.length < 6) {
        uni.showToast({
          title: '密码长度不能少于6位',
          icon: 'none'
        });
        return;
      }
      
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        uni.showToast({
          title: '两次输入的密码不一致',
          icon: 'none'
        });
        return;
      }
      
      if (!this.isAgreed) {
        uni.showToast({
          title: '请同意服务条款和隐私政策',
          icon: 'none'
        });
        return;
      }
      
      try {
        this.isLoading = true;
        
        // 调用注册API
        const result = await userAPI.register({
          username: this.registerForm.name,
          email: this.registerForm.email,
          code: this.registerForm.code,
          password: this.registerForm.password,
          permId:0
        });
        
        if (result.code === 200) {
          uni.showToast({
            title: result.msg || '注册成功',
            icon: 'success'
          });
          
          setTimeout(() => {
            // 注册成功后跳转到登录页
            uni.navigateTo({
              url: '/pages/login/login'
            });
          }, 1500);
        } else {
          uni.showToast({
            title: result.msg || '注册失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('注册错误:', error);
        uni.showToast({
          title: error.message || '网络错误，请稍后重试',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
      }
    },
    
    // 处理协议勾选变化
    handleAgreementChange(e) {
      this.isAgreed = e.target.checked;
    },
    
    goToLogin() {
      uni.navigateTo({
        url: '/pages/login/login'
      });
    },
    
    // 查看服务条款
    viewTerms() {
      uni.showToast({
        title: '服务条款功能开发中',
        icon: 'none'
      });
    },
    
    // 查看隐私政策
    viewPrivacy() {
      uni.showToast({
        title: '隐私政策功能开发中',
        icon: 'none'
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.register-container {
  min-height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

.register-header {
  display: flex;
  align-items: center;
  padding: 40rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  
  .back-btn {
    width: 80rpx;
    height: 80rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 40rpx;
    
    .back-icon {
      font-size: 40rpx;
      color: #333;
      position: relative;
      &::before {
        content: '';
        position: absolute;
        width: 20rpx;
        height: 20rpx;
        border-left: 3rpx solid #333;
        border-top: 3rpx solid #333;
        transform: rotate(-45deg);
      }
    }
  }
  
  .page-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333333;
    flex: 1;
  }
}

.register-content {
  flex: 1;
  padding: 40rpx 30rpx;
  overflow-y: auto;
}

.register-form {
  
  .form-group {
    margin-bottom: 36rpx;
    
    .form-label {
      display: block;
      font-size: 28rpx;
      color: #333333;
      margin-bottom: 12rpx;
      font-weight: 500;
    }
    
    .form-input {
      width: 100%;
      height: 88rpx;
      border: 2rpx solid #e0e0e0;
      border-radius: 16rpx;
      padding: 0 30rpx;
      font-size: 30rpx;
      color: #333;
      background: #ffffff;
      box-sizing: border-box;
      
      &:focus {
        border-color: #5374f7;
      }
    }
  }
  
  .verification-code-container {
    display: flex;
    gap: 20rpx;
    
    .verification-input {
      flex: 1;
    }
    
    .send-code-btn {
      width: 220rpx;
      height: 88rpx;
      background-color: #5374f7;
      color: #ffffff;
      border: none;
      border-radius: 16rpx;
      font-size: 26rpx;
      
      &:disabled {
        background-color: #aabaf7;
      }
    }
  }
  
  .agreement-container {
    display: flex;
    align-items: center;
    margin-bottom: 40rpx;
    
    .agreement-checkbox {
      transform: scale(0.8);
      margin-right: 8rpx;
    }
    
    .agreement-text {
      font-size: 26rpx;
      color: #666;
      
      .agreement-link {
        color: #5374f7;
      }
    }
  }
  
  .register-btn {
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
      
      .password-strength {
        display: flex;
        gap: 8rpx;
        margin-top: 10rpx;
        
        .strength-item {
          flex: 1;
          height: 6rpx;
          background-color: #e0e0e0;
          border-radius: 3rpx;
        }
        
        .strength-weak {
          background-color: #ff6b6b;
        }
        
        .strength-medium {
          background-color: #ffd93d;
        }
        
        .strength-strong {
          background-color: #6bcb77;
        }
      }
  
  .login-link {
    text-align: center;
    font-size: 28rpx;
    color: #666;
    
    .link-text {
      color: #5374f7;
    }
  }
}
</style>