<template>
  <view class="main-container">
    <view class="header">
      <text class="page-title">学习助手</text>
      <view class="user-info" @click="logout">
        <view class="avatar">
          <text class="avatar-text">{{ userInfo ? userInfo.username?.[0]?.toUpperCase() || 'U' : 'U' }}</text>
        </view>
        <view class="user-details">
          <text class="user-name">{{ userInfo ? userInfo.username || '游客' : '游客' }}</text>
          <text class="logout-text">点击退出</text>
        </view>
      </view>
    </view>
    
    <view class="stats-container">
      <view class="stat-card">
        <text class="stat-number">3</text>
        <text class="stat-label">待办任务</text>
      </view>
      <view class="stat-card">
        <text class="stat-number">12</text>
        <text class="stat-label">累计笔记</text>
      </view>
      <view class="stat-card">
        <text class="stat-number">7</text>
        <text class="stat-label">连续学习</text>
      </view>
    </view>
    
    <view class="today-tasks">
      <view class="section-header">
        <text class="section-title">今日待办</text>
        <text class="section-more" @click="viewAllTasks('today')">查看全部</text>
      </view>
      <view class="task-list">
        <view class="task-item" v-for="(task, index) in todayTaskList" :key="index">
          <checkbox class="task-checkbox"></checkbox>
          <view class="task-content">
            <text class="task-title">{{ task.title }}</text>
            <text class="task-time">{{ task.time }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="upcoming-tasks">
      <view class="section-header">
        <text class="section-title">即将截止(3天内)</text>
        <text class="section-more" @click="viewAllTasks('upcoming')">查看全部</text>
      </view>
      <view class="task-list">
        <view class="task-item" v-for="(task, index) in upcomingTaskList" :key="index">
          <checkbox class="task-checkbox"></checkbox>
          <view class="task-content">
            <text class="task-title">{{ task.title }}</text>
            <view class="task-deadline">
              <text class="deadline-label">{{ task.deadline }}</text>
              <view class="priority-tag" :class="task.priority">{{ task.priorityText }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
// 导入用户API和存储工具
import { userAPI } from '../../api';
import { getUserInfo, clearUserData } from '../../utils/storage';

export default {
  data() {
    return {
      userInfo: null,
      todayTaskList: [
        {
          title: '完成数学作业第5章',
          time: '数学 11:00'
        },
        {
          title: '复习英语单词本',
          time: '英语 14:00'
        },
        {
          title: '背诵',
          time: '语文 16:00'
        }
      ],
      upcomingTaskList: [
        {
          title: '提交课程论文',
          deadline: '明天截止',
          priority: 'high',
          priorityText: '论文'
        },
        {
          title: '历史',
          deadline: '后天截止',
          priority: 'medium',
          priorityText: '作业'
        },
        {
          title: '编程项目一阶提交',
          deadline: '后天截止',
          priority: 'low',
          priorityText: '计划中'
        }
      ]
    }
  },
  onLoad() {
    // 页面加载时获取用户信息
    this.loadUserInfo();
  },
  methods: {
    // 加载用户信息
    loadUserInfo() {
      this.userInfo = getUserInfo();
      console.log('userInfo', this.userInfo)
      if (!this.userInfo) {
        // 如果本地没有用户信息，尝试从服务器获取
        this.fetchUserInfo();
      }
    },
    
    // 从服务器获取用户信息
    async fetchUserInfo() {
      try {
        const res = await userAPI.getUserInfo();
        this.userInfo = res.data;
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    },
    
    // 退出登录
    async logout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出登录吗？',
        confirmText: '确定',
        cancelText: '取消',
        success: async (res) => {
          if (res.confirm) {
            try {
              // 调用退出登录API
              await userAPI.logout();
              // 清除本地数据
              clearUserData();
              // 跳转到登录页面
              uni.reLaunch({
                    url: '/pages/login/login'
              });
            } catch (error) {
              console.error('退出登录失败:', error);
              // 即使API调用失败，也要清除本地数据并跳转到登录页
              clearUserData();
              uni.reLaunch({
                    url: '/pages/login/login'
              });
            }
          }
        }
      });
    },
    
    viewAllTasks(type) {
      uni.showToast({
        title: `查看全部${type === 'today' ? '今日' : '即将截止'}任务`,
        icon: 'none'
      })
    },
    
    handleTaskComplete(task) {
      // 处理任务完成逻辑
      uni.showToast({
        title: '任务已完成',
        icon: 'success'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.main-container {
  min-height: 100vh;
  background-color: #f8f8f8;
  padding: 30rpx 20rpx 120rpx;
}

.header {
    padding: 20rpx;
    margin-bottom: 30rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .page-title {
      font-size: 36rpx;
      font-weight: 600;
      color: #333333;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      padding: 10rpx;
      border-radius: 12rpx;
      background-color: #f5f5f5;
    }
    
    .avatar {
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      background-color: #5374f7;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16rpx;
    }
    
    .avatar-text {
      color: #ffffff;
      font-size: 28rpx;
      font-weight: 600;
    }
    
    .user-details {
      display: flex;
      flex-direction: column;
    }
    
    .user-name {
      font-size: 28rpx;
      font-weight: 500;
      color: #333333;
    }
    
    .logout-text {
      font-size: 22rpx;
      color: #999999;
      margin-top: 2rpx;
    }
  }

.stats-container {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 30rpx;
  
  .stat-card {
    flex: 1;
    background-color: #ffffff;
    border-radius: 20rpx;
    padding: 28rpx 0;
    text-align: center;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
    
    .stat-number {
      display: block;
      font-size: 48rpx;
      font-weight: 600;
      color: #5374f7;
      margin-bottom: 8rpx;
    }
    
    .stat-label {
      font-size: 24rpx;
      color: #666666;
    }
  }
}

.today-tasks,
.upcoming-tasks {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333333;
    }
    
    .section-more {
      font-size: 26rpx;
      color: #5374f7;
    }
  }
  
  .task-list {
    
    .task-item {
      display: flex;
      align-items: flex-start;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .task-checkbox {
        transform: scale(0.8);
        margin-right: 16rpx;
        margin-top: 8rpx;
      }
      
      .task-content {
        flex: 1;
        
        .task-title {
          display: block;
          font-size: 30rpx;
          color: #333333;
          margin-bottom: 8rpx;
        }
        
        .task-time {
          font-size: 24rpx;
          color: #999999;
        }
        
        .task-deadline {
          display: flex;
          align-items: center;
          
          .deadline-label {
            font-size: 24rpx;
            color: #999999;
            margin-right: 12rpx;
          }
          
          .priority-tag {
            padding: 4rpx 16rpx;
            border-radius: 12rpx;
            font-size: 20rpx;
            
            &.high {
              background-color: #ffe6e6;
              color: #ff4d4f;
            }
            
            &.medium {
              background-color: #fff7e6;
              color: #faad14;
            }
            
            &.low {
              background-color: #e6f7ff;
              color: #1890ff;
            }
          }
        }
      }
    }
  }
}
</style>
