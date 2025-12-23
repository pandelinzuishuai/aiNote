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
        <text class="stat-number">{{ statistics.taskCount }}</text>
        <text class="stat-label">待办任务</text>
      </view>
      <view class="stat-card">
        <text class="stat-number">{{ statistics.noteCount }}</text>
        <text class="stat-label">累计笔记</text>
      </view>
      <view class="stat-card">
        <text class="stat-number">{{ statistics.learningStreak }}</text>
        <text class="stat-label">连续学习</text>
      </view>
    </view>
    
    <!-- 加载指示器 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>
    
    <view class="today-tasks">
      <view class="section-header">
        <text class="section-title">今日待办</text>
        <text class="section-more" @click="viewAllTasks('today')">查看全部</text>
      </view>
      <view class="task-list">
        <view v-if="todayTaskList.length > 0">
          <view class="task-item" v-for="(task, index) in todayTaskList" :key="index">
            <checkbox class="task-checkbox" :checked="false" @change="handleTaskComplete(task)"></checkbox>
            <view class="task-content">
              <text class="task-title">{{ task.title }}</text>
              <text class="task-time">还有{{ task.time }}截止</text>
            </view>
          </view>
        </view>
        <view v-else class="empty-state">
          <view class="empty-icon">📝</view>
          <text class="empty-text">暂无今日待办任务</text>
          <text class="empty-tip">点击查看全部创建新任务</text>
        </view>
      </view>
    </view>
    
    <view class="upcoming-tasks">
      <view class="section-header">
        <text class="section-title">即将截止(3天内)</text>
        <text class="section-more" @click="viewAllTasks('upcoming')">查看全部</text>
      </view>
      <view class="task-list">
        <view v-if="upcomingTaskList.length > 0">
          <view class="task-item" v-for="(task, index) in upcomingTaskList" :key="index">
            <checkbox class="task-checkbox" :checked="false" @change="handleTaskComplete(task)"></checkbox>
            <view class="task-content">
              <text class="task-title">{{ task.title }}</text>
              <view class="task-deadline">
                <text class="deadline-label">{{ task.deadline }}</text>
                <view class="priority-tag" :class="task.priority">{{ task.priorityText }}</view>
              </view>
            </view>
          </view>
        </view>
        <view v-else class="empty-state">
          <view class="empty-icon">⏰</view>
          <text class="empty-text">暂无即将截止任务</text>
          <text class="empty-tip">3天内的任务将显示在这里</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
// 导入用户API、任务API和存储工具
import { userAPI } from '../../api';
import { getTodayTasks, getUpcomingTasks } from '../../api/task';
import { getUserInfo, clearUserData } from '../../utils/storage';

export default {
  data() {
    return {
      userInfo: null,
      todayTaskList: [],
      upcomingTaskList: [],
      loading: false,
      statistics: {
        taskCount: 0,
        noteCount: 12,
        learningStreak: 7
      }
    }
  },
  onLoad() {
    // 页面加载时获取用户信息和任务数据
    console.log('加载完成')
    this.loadUserInfo();
    this.fetchTasks();
  },
  methods: {
    // 加载用户信息
    loadUserInfo() {
      this.userInfo = getUserInfo();
      console.log('userInfo', this.userInfo)
      if (!this.userInfo) {
        // 如果本地没有用户信息，尝试从服务器获取
        this.fetchUserInfo();
      } else {
        // 如果有用户信息，更新任务统计中的任务数量
        this.statistics.taskCount = this.todayTaskList.length + this.upcomingTaskList.length;
      }
    },
    
    // 获取任务数据
    async fetchTasks() {
      if (!this.userInfo) return;
      
      this.loading = true;
      try {
        // 并行获取今日待办和即将截止任务
        const [todayRes, upcomingRes] = await Promise.all([
          getTodayTasks({ userId: this.userInfo.uid }),
          getUpcomingTasks({ userId: this.userInfo.uid })
        ]);
        
        // 处理今日待办任务数据
        if (todayRes.code === 200 && todayRes.data) {
          this.todayTaskList = (todayRes.data.records || []).map(task => ({
            id: task.taskId,
            title: task.taskName || '未命名任务',
            time: this.formatTaskTime(task)
          }));
        }
        
        // 处理即将截止任务数据
        if (upcomingRes.code === 200 && upcomingRes.data) {
          this.upcomingTaskList = (upcomingRes.data.records || []).map(task => ({
            id: task.taskId,
            title: task.taskName || '未命名任务',
            deadline: this.formatDeadline(task.deadline),
            priority: this.formatPriority(task.priority),
            priorityText: this.formatPriorityText(task.priority)
          }));
        }
        
        // 更新任务统计
        this.statistics.taskCount = this.todayTaskList.length;
      } catch (error) {
        console.error('获取任务数据失败:', error);
        // 失败时使用模拟数据作为后备
        this.useMockData();
      } finally {
        this.loading = false;
      }
    },
    
    // 格式化任务时间显示
    formatTaskTime(task) {
      if (!task.subjectName) return '';
      
      // 处理任务时间
      const today = new Date();
      if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        
        // 计算时间差（毫秒）
        const timeDiff = deadlineDate - today;
        
        // 如果时间已过期
        if (timeDiff <= 0) {
          return `已过期`;
        }
        
        // 转换为小时数
        const hoursLeft = Math.ceil(timeDiff / (1000 * 60 * 60));
        
        if (hoursLeft < 24) {
          // 24小时内显示小时数
          return `${hoursLeft}小时`;
        } else if (hoursLeft < 24 * 7) {
          // 7天内显示天数
          const daysLeft = Math.ceil(hoursLeft / 24);
          return `${daysLeft}天`;
        } else {
          // 超过7天显示具体日期
          const year = deadlineDate.getFullYear();
          const month = (deadlineDate.getMonth() + 1).toString().padStart(2, '0');
          const day = deadlineDate.getDate().toString().padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
      }
      
      return task.subjectName;
    },
    
    // 格式化截止时间
    formatDeadline(deadline) {
      if (!deadline) return '无截止时间';
      
      const now = new Date();
      const deadDate = new Date(deadline);
      const diffDays = Math.floor((deadDate - now) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return '今天截止';
      } else if (diffDays === 1) {
        return '明天截止';
      } else if (diffDays === 2) {
        return '后天截止';
      } else if (diffDays > 0) {
        return `${diffDays}天后截止`;
      } else {
        return '已逾期';
      }
    },
    
    // 格式化优先级
    formatPriority(priority) {
      switch (priority?.toLowerCase()) {
        case 'high':
        case '高':
          return 'high';
        case 'medium':
        case '中':
          return 'medium';
        case 'low':
        case '低':
          return 'low';
        default:
          return 'low';
      }
    },
    
    // 格式化优先级文本
    formatPriorityText(priority) {
      switch (priority?.toLowerCase()) {
        case 'high':
        case '高':
          return '高';
        case 'medium':
        case '中':
          return '中';
        case 'low':
        case '低':
          return '低';
        default:
          return '普通';
      }
    },
    
    // 使用模拟数据作为后备
    useMockData() {
      this.todayTaskList = [
        {
          id: 1,
          title: '完成数学作业第5章',
          time: '数学 11:00'
        },
        {
          id: 2,
          title: '复习英语单词本',
          time: '英语 14:00'
        },
        {
          id: 3,
          title: '背诵',
          time: '语文 16:00'
        }
      ];
      
      this.upcomingTaskList = [
        {
          id: 4,
          title: '提交课程论文',
          deadline: '明天截止',
          priority: 'high',
          priorityText: '高'
        },
        {
          id: 5,
          title: '历史',
          deadline: '后天截止',
          priority: 'medium',
          priorityText: '中'
        },
        {
          id: 6,
          title: '编程项目一阶提交',
          deadline: '后天截止',
          priority: 'low',
          priorityText: '低'
        }
      ];
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
      // 这里可以实现跳转到任务列表页面
      uni.showToast({
        title: `查看全部${type === 'today' ? '今日' : '即将截止'}任务`,
        icon: 'none'
      })
      // 示例：uni.navigateTo({ url: `/pages/task/list?type=${type}` });
    },
    
    handleTaskComplete(task) {
      // 处理任务完成逻辑
      // 这里应该调用API更新任务状态
      uni.showToast({
        title: '任务已完成',
        icon: 'success'
      })
      
      // 从列表中移除已完成的任务
      const todayIndex = this.todayTaskList.findIndex(t => t.id === task.id);
      if (todayIndex !== -1) {
        this.todayTaskList.splice(todayIndex, 1);
      }
      
      const upcomingIndex = this.upcomingTaskList.findIndex(t => t.id === task.id);
      if (upcomingIndex !== -1) {
        this.upcomingTaskList.splice(upcomingIndex, 1);
      }
      
      // 更新统计
      this.statistics.taskCount = this.todayTaskList.length;
    }
  }
}
</script>

<style lang="scss" scoped>
.main-container {
  min-height: 100vh;
  background-color: #F8FAFF;
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
        
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60rpx 0;
          text-align: center;
          
          .empty-icon {
            font-size: 80rpx;
            margin-bottom: 20rpx;
          }
          
          .empty-text {
            font-size: 28rpx;
            color: #333333;
            margin-bottom: 10rpx;
          }
          
          .empty-tip {
            font-size: 24rpx;
            color: #999999;
          }
        }
        
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
