<template>
  <view class="mine-container">
    <!-- 个人中心头部 -->
    <view class="header">
      <view class="avatar-container">
        <image class="avatar" v-if="userData.avatar" :src="userData.avatar" mode="aspectFill"></image>
        <uni-icons class="avatar" type="contact" size="120" color="#fff" v-else></uni-icons>
      </view>
      <view class="user-info">
        <text class="user-name">{{userData.username}}</text>
      </view>
    </view>

    <!-- 学习数据统计 -->
    <view class="stats-section">
      <text class="section-title">学习数据统计</text>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-value">128</text>
          <text class="stat-label">总学时</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">18</text>
          <text class="stat-label">笔记数</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">15</text>
          <text class="stat-label">任务数</text>
        </view>
      </view>
      
      <!-- 学习趋势图表 -->
      <view class="chart-container">
        <canvas canvas-id="trendChart" class="chart"></canvas>
      </view>
    </view>

    <!-- 个人信息设置 -->
    <view class="settings-section">
      <view class="section-header">
        <text class="section-title">个人信息设置</text>
      </view>
      
      <view class="setting-item" @click="navigateToProfile">
        <view class="setting-left">
          <text class="setting-icon">👤</text>
          <text class="setting-label">个人资料</text>
        </view>
        <view class="setting-right">
          <text class="setting-desc">修改头像、昵称等信息</text>
          <text class="setting-arrow">&gt;</text>
        </view>
      </view>
      
      <view class="setting-item" @click="handleSettingClick('security')">
        <view class="setting-left">
          <text class="setting-icon">🔒</text>
          <text class="setting-label">账户安全</text>
        </view>
        <view class="setting-right">
          <text class="setting-arrow">></text>
        </view>
      </view>
      
      <view class="setting-item">
        <view class="setting-left">
          <text class="setting-icon">🔔</text>
          <text class="setting-label">消息通知</text>
        </view>
        <view class="setting-right">
          <switch :checked="notificationEnabled" @change="toggleNotification"></switch>
        </view>
      </view>
      
      <view class="setting-item" @click="handleSettingClick('language')">
        <view class="setting-left">
          <text class="setting-icon">🌐</text>
          <text class="setting-label">语言设置</text>
        </view>
        <view class="setting-right">
          <text class="setting-desc">简体中文 / English</text>
          <text class="setting-arrow">></text>
        </view>
      </view>
    </view>

    <!-- 界面个性化 -->
    <view class="settings-section">
      <view class="section-header">
        <text class="section-title">界面个性化</text>
      </view>
      
      <view class="setting-item">
        <view class="setting-left">
          <text class="setting-icon">🌙</text>
          <text class="setting-label">深色模式</text>
        </view>
        <view class="setting-right">
          <switch :checked="isDarkMode" @change="toggleDarkMode"></switch>
        </view>
      </view>
      
      <view class="setting-item">
        <view class="setting-left">
          <text class="setting-icon">🎨</text>
          <text class="setting-label">内部主题色</text>
        </view>
        <view class="theme-colors">
          <view 
            v-for="(color, index) in themeColors" 
            :key="index"
            class="theme-color-item" 
            :class="{ active: selectedThemeIndex === index }"
            :style="{ backgroundColor: color }"
            @click="selectTheme(index)"
          ></view>
        </view>
      </view>
    </view>

    <!-- 其他设置 -->
    <view class="settings-section">
      <view class="section-header">
        <text class="section-title">其他设置</text>
      </view>
      
      <view class="setting-item" @click="handleSettingClick('help')">
        <view class="setting-left">
          <text class="setting-icon">💬</text>
          <text class="setting-label">帮助与支持</text>
        </view>
        <view class="setting-right">
          <text class="setting-arrow">></text>
        </view>
      </view>
      
      <view class="setting-item" @click="handleSettingClick('about')">
        <view class="setting-left">
          <text class="setting-icon">ℹ️</text>
          <text class="setting-label">关于应用</text>
        </view>
        <view class="setting-right">
          <text class="setting-arrow">></text>
        </view>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <button class="logout-btn" @click="logout">退出当前账号</button>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        chartInstance: null,
        chartData: {
          labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          values: [3, 4, 5, 4, 6, 3, 4]
        },
        userData: {
          avatar: null,
          username: null
        },
        isDarkMode: false,
        notificationEnabled: true,
        selectedThemeIndex: 0,
        themeColors: ['#5374f7', '#722ED1', '#E73D8D', '#00B42A']
      }
    },
    onLoad() {
      // 页面加载时的初始化逻辑
    },
    onReady() {
      // 页面渲染完成后绘制图表
      this.drawTrendChart();
    },
    methods: {
      drawTrendChart() {
        // 使用uni-app的canvas API绘制图表
        const ctx = uni.createCanvasContext('trendChart', this);
        const width = 300;
        const height = 100;
        
        // 设置背景
        ctx.setFillStyle('#fff');
        ctx.fillRect(0, 0, width, height);
        
        // 设置图表样式
        ctx.setStrokeStyle('#5374f7');
        ctx.setLineWidth(2);
        ctx.setFillStyle('#5374f7');
        
        // 绘制网格线
        ctx.setStrokeStyle('#f0f0f0');
        ctx.setLineWidth(1);
        
        // 横线
        for (let i = 0; i <= 5; i++) {
          const y = 20 + i * 12;
          ctx.beginPath();
          ctx.moveTo(20, y);
          ctx.lineTo(width - 20, y);
          ctx.stroke();
        }
        
        // 绘制折线
        const padding = 20;
        const pointSpacing = (width - 2 * padding) / (this.chartData.labels.length - 1);
        
        ctx.setStrokeStyle('#5374f7');
        ctx.beginPath();
        this.chartData.values.forEach((value, index) => {
          const x = padding + index * pointSpacing;
          const y = height - padding - (value / 10) * (height - 2 * padding);
          
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
        
        // 绘制点
        this.chartData.values.forEach((value, index) => {
          const x = padding + index * pointSpacing;
          const y = height - padding - (value / 10) * (height - 2 * padding);
          
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fill();
        });
        
        // 绘制标签
        ctx.setFontSize(10);
        ctx.setFillStyle('#999');
        this.chartData.labels.forEach((label, index) => {
          const x = padding + index * pointSpacing;
          const y = height - 5;
          ctx.fillText(label, x - 10, y);
        });
        
        ctx.draw();
      },
      // 处理退出登录
      logout() {
        uni.showModal({
          title: '确认退出',
          content: '确定要退出当前账号吗？',
          success: (res) => {
            if (res.confirm) {
              // 清除本地存储的用户数据
              uni.removeStorageSync('userInfo');
              uni.navigateTo({
                url: '/pages/login/login'
              });
            }
          }
        });
      },
      // 处理设置项点击
      handleSettingClick(type) {
        switch (type) {
          case 'profile':
            this.navigateToProfile();
            break;
          case 'security':
            uni.showToast({
              title: '跳转到账户安全',
              icon: 'none'
            });
            break;
          case 'language':
            uni.showToast({
              title: '跳转到语言设置',
              icon: 'none'
            });
            break;
          case 'help':
            uni.showToast({
              title: '跳转到帮助与支持',
              icon: 'none'
            });
            break;
          case 'about':
            uni.showToast({
              title: '跳转到关于应用',
              icon: 'none'
            });
            break;
        }
      },
      
      // 跳转到个人资料页面
      navigateToProfile() {
        uni.navigateTo({
          url: '/pages/mine/profile'
        });
      },
      // 切换深色模式
      toggleDarkMode(e) {
        this.isDarkMode = e.detail.value;
        // 这里可以添加深色模式的具体实现
        uni.setStorageSync('darkMode', this.isDarkMode);
        uni.showToast({
          title: this.isDarkMode ? '已开启深色模式' : '已关闭深色模式',
          icon: 'none'
        });
      },
      // 切换通知设置
      toggleNotification(e) {
        this.notificationEnabled = e.detail.value;
        uni.setStorageSync('notificationEnabled', this.notificationEnabled);
      },
      // 切换主题色
      selectTheme(index) {
        this.selectedThemeIndex = index;
        uni.setStorageSync('themeColor', this.themeColors[index]);
        uni.showToast({
          title: '主题已切换',
          icon: 'none'
        });
      },
      // 加载用户数据
      loadUserData() {
        // 从本地存储加载数据，如果没有则使用默认数据
        const savedUser = uni.getStorageSync('userInfo');
        if (savedUser) {
          this.userData = savedUser;
          console.log(this.userData)
        }
        
        // 加载主题设置
        const savedTheme = uni.getStorageSync('themeColor');
        if (savedTheme) {
          const index = this.themeColors.indexOf(savedTheme);
          if (index !== -1) {
            this.selectedThemeIndex = index;
          }
        }
        
        // 加载深色模式设置
        const darkMode = uni.getStorageSync('darkMode');
        if (darkMode !== null) {
          this.isDarkMode = darkMode;
        }
        
        // 加载通知设置
        const notification = uni.getStorageSync('notificationEnabled');
        if (notification !== null) {
          this.notificationEnabled = notification;
        }
      }
    },
    onLoad() {
      // 加载用户数据
      this.loadUserData();
    }
  }
</script>

<style scoped>
  .mine-container {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding-bottom: 30px;
  }
  
  .header {
    background-color: #5374f7;
    padding: 60px 20px 20px;
    text-align: center;
    position: relative;
  }
  
  .avatar-container {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    margin: 0 auto;
    box-shadow: 0 4px 12px rgba(83, 116, 247, 0.3);
  }
  
  .avatar {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }
  
  .user-info {
    margin-top: 15px;
  }
  
  .user-name {
    font-size: 18px;
    font-weight: bold;
    color: #fff;
    margin-bottom: 5px;
  }
  
  .user-desc {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
  }
  
  .stats-section {
    background-color: #fff;
    margin: 20px 15px 20px;
    border-radius: 12px;
    padding: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-bottom: 15px;
  }
  
  .stats-grid {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .stat-item {
    text-align: center;
  }
  
  .stat-value {
    display: block;
    font-size: 24px;
    font-weight: bold;
    color: #5374f7;
    margin-bottom: 5px;
  }
  
  .stat-label {
    font-size: 12px;
    color: #999;
  }
  
  .chart-container {
    width: 100%;
    height: 120px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
  }
  
  .chart {
    width: 100%;
    height: 100%;
  }
  
  .settings-section {
    background-color: #fff;
    margin: 15px;
    border-radius: 12px;
    padding: 15px 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  .section-header {
    padding: 0 15px 10px;
  }
  
  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 15px;
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.2s;
  }
  
  .setting-item:active {
    background-color: #f8f8f8;
  }
  
  .setting-item:last-child {
    border-bottom: none;
  }
  
  .setting-left {
    display: flex;
    align-items: center;
  }
  
  .setting-icon {
    font-size: 20px;
    margin-right: 12px;
    width: 24px;
    text-align: center;
  }
  
  .setting-label {
    font-size: 15px;
    color: #333;
  }
  
  .setting-right {
    display: flex;
    align-items: center;
  }
  
  .setting-desc {
    font-size: 13px;
    color: #999;
    margin-right: 5px;
  }
  
  .setting-arrow {
    font-size: 18px;
    color: #ccc;
    transform: scale(0.8);
  }
  
  .theme-colors {
    display: flex;
    gap: 10px;
  }
  
  .theme-color-item {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: #5374f7;
    border: 2px solid transparent;
  }
  
  .theme-color-item.active {
    border-color: #333;
  }
  
  .logout-btn {
    margin: 30px 15px 0;
    background-color: #fff;
    color: #ff4d4f;
    border: 1px solid #ff4d4f;
    font-size: 16px;
    height: 45px;
    line-height: 43px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  .logout-btn:active {
    background-color: #fff1f0;
  }
</style>