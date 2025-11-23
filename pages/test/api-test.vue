<template>
  <view class="api-test-container">
    <view class="header">
      <text class="title">API接口测试</text>
    </view>
    
    <view class="test-section">
      <text class="section-title">Token状态</text>
      <view class="status-info">
        <text v-if="tokenStatus.hasToken" class="status-success">✓ 已登录</text>
        <text v-else class="status-error">✗ 未登录</text>
        <text class="token-text">{{ tokenStatus.token || '无' }}</text>
      </view>
    </view>
    
    <view class="test-section">
      <text class="section-title">用户相关测试</text>
      <button class="test-btn" @click="handleLogin">模拟登录</button>
      <button class="test-btn" @click="handleGetUserInfo">获取用户信息</button>
      <button class="test-btn" @click="handleLogout">退出登录</button>
    </view>
    
    <view class="test-section">
      <text class="section-title">任务相关测试</text>
      <button class="test-btn" @click="handleGetTaskList">获取任务列表</button>
      <button class="test-btn" @click="handleGetTaskInfo">获取任务详情</button>
    </view>
    
    <view class="test-section">
      <text class="section-title">综合测试</text>
      <button class="test-btn primary" @click="handleRunAllTests">运行全部测试</button>
    </view>
    
    <view class="log-section">
      <text class="section-title">测试日志</text>
      <scroll-view class="log-content" scroll-y="true">
        <text v-for="(log, index) in logs" :key="index" class="log-item">{{ log }}</text>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { mockAPI, runAPITests } from '../../utils/api.test';

export default {
  data() {
    return {
      tokenStatus: {
        hasToken: false,
        token: ''
      },
      logs: []
    };
  },
  onLoad() {
    this.updateTokenStatus();
    this.log('API测试页面已加载');
  },
  methods: {
    // 更新token状态
    updateTokenStatus() {
      const token = uni.getStorageSync('token');
      this.tokenStatus = {
        hasToken: !!token,
        token: token || ''
      };
    },
    
    // 记录日志
    log(message) {
      const timestamp = new Date().toLocaleTimeString();
      this.logs.push(`[${timestamp}] ${message}`);
      // 保持日志在最新状态
      setTimeout(() => {
        const logContent = this.$refs.logContent;
        if (logContent) {
          logContent.scrollToEnd();
        }
      }, 100);
    },
    
    // 模拟登录
    async handleLogin() {
      this.log('开始模拟登录...');
      try {
        const result = await mockAPI.mockLogin();
        this.log('登录成功:', result.msg);
        this.updateTokenStatus();
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        });
      } catch (error) {
        this.log('登录失败:', error.message);
        uni.showToast({
          title: '登录失败',
          icon: 'none'
        });
      }
    },
    
    // 获取用户信息
    async handleGetUserInfo() {
      this.log('开始获取用户信息...');
      try {
        const result = await mockAPI.mockGetUserInfo();
        if (result.code === 0) {
          this.log('获取用户信息成功:', result.data.username);
          uni.showToast({
            title: '获取成功',
            icon: 'success'
          });
        } else {
          this.log('获取用户信息失败:', result.msg);
          uni.showToast({
            title: result.msg,
            icon: 'none'
          });
        }
      } catch (error) {
        this.log('获取用户信息失败:', error.message);
        uni.showToast({
          title: '获取失败',
          icon: 'none'
        });
      }
    },
    
    // 退出登录
    handleLogout() {
      this.log('开始退出登录...');
      try {
        mockAPI.mockLogout();
        this.log('退出登录成功');
        this.updateTokenStatus();
        uni.showToast({
          title: '退出成功',
          icon: 'success'
        });
      } catch (error) {
        this.log('退出登录失败:', error.message);
        uni.showToast({
          title: '退出失败',
          icon: 'none'
        });
      }
    },
    
    // 获取任务列表
    async handleGetTaskList() {
      this.log('开始获取任务列表...');
      try {
        const result = await mockAPI.mockGetTaskList();
        if (result.code === 0) {
          this.log(`获取任务列表成功，共${result.data.total}条记录`);
          uni.showToast({
            title: '获取成功',
            icon: 'success'
          });
        } else {
          this.log('获取任务列表失败:', result.msg);
          uni.showToast({
            title: result.msg,
            icon: 'none'
          });
        }
      } catch (error) {
        this.log('获取任务列表失败:', error.message);
        uni.showToast({
          title: '获取失败',
          icon: 'none'
        });
      }
    },
    
    // 获取任务详情
    async handleGetTaskInfo() {
      this.log('开始获取任务详情...');
      try {
        const result = await mockAPI.mockGetTaskInfo(1);
        if (result.code === 0) {
          this.log('获取任务详情成功:', result.data.taskName);
          uni.showToast({
            title: '获取成功',
            icon: 'success'
          });
        } else {
          this.log('获取任务详情失败:', result.msg);
          uni.showToast({
            title: result.msg,
            icon: 'none'
          });
        }
      } catch (error) {
        this.log('获取任务详情失败:', error.message);
        uni.showToast({
          title: '获取失败',
          icon: 'none'
        });
      }
    },
    
    // 运行全部测试
    async handleRunAllTests() {
      this.log('开始运行全部API测试...');
      this.log('==================================');
      
      // 清空之前的日志
      this.logs = ['[开始运行全部API测试]'];
      
      try {
        const result = await runAPITests();
        
        if (result.success) {
          this.log('测试完成: 所有测试通过!');
          this.updateTokenStatus();
          uni.showToast({
            title: '测试全部通过',
            icon: 'success'
          });
        } else {
          this.log('测试失败:', result.error);
          uni.showToast({
            title: '测试失败',
            icon: 'none'
          });
        }
      } catch (error) {
        this.log('测试过程中发生错误:', error.message);
        uni.showToast({
          title: '测试异常',
          icon: 'none'
        });
      } finally {
        this.log('==================================');
        this.log('API测试运行结束');
      }
    }
  }
};
</script>

<style scoped>
.api-test-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 30rpx;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
}

.test-section {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.status-info {
  padding: 20rpx;
  background-color: #f0f0f0;
  border-radius: 8rpx;
  margin-bottom: 20rpx;
}

.status-success {
  color: #07c160;
  font-weight: bold;
}

.status-error {
  color: #e64340;
  font-weight: bold;
}

.token-text {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-top: 10rpx;
  word-break: break-all;
}

.test-btn {
  width: 100%;
  margin-bottom: 20rpx;
  background-color: #fff;
  color: #333;
  border: 1rpx solid #ddd;
}

.test-btn.primary {
  background-color: #4a6cf7;
  color: #fff;
  border: none;
}

.log-section {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.log-content {
  height: 400rpx;
  background-color: #f8f8f8;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
}

.log-item {
  display: block;
  margin-bottom: 10rpx;
  color: #666;
  word-break: break-all;
  white-space: pre-wrap;
}
</style>