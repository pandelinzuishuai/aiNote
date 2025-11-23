<template>
  <view class="container">
    <!-- 导航栏 -->
    <view class="header">
      <view class="header-title">笔记</view>
      <view class="header-actions">
        <image class="header-icon" @tap="searchNotes" src="/static/tabbar/search.png"></image>
        <image class="header-icon" @tap="addNote" src="/static/tabbar/add.png"></image>
      </view>
    </view>

    <!-- 笔记列表 -->
    <view class="notes-list">
      <view v-if="notes.length === 0" class="empty-state">
        <image class="empty-icon" src="/static/logo.png"></image>
        <text class="empty-text">暂无笔记</text>
        <text class="empty-subtext">点击右上角添加按钮创建第一条笔记</text>
      </view>
      <view v-else>
        <view v-for="(note, index) in notes" :key="note.id" class="note-item" @tap="viewNoteDetail(note.id)">
          <view class="note-header">
            <text class="note-title">{{ note.title }}</text>
            <text class="note-date">{{ formatDate(note.createdAt) }}</text>
          </view>
          <text class="note-content">{{ truncateText(note.content, 100) }}</text>
          <view class="note-footer">
            <text class="note-tags" v-for="(tag, tagIndex) in note.tags" :key="tagIndex">#{{ tag }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 添加笔记浮动按钮 -->
    <view class="add-btn" @tap="addNote">
      <text class="add-btn-text">+</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      notes: [],
      isLoading: false
    }
  },
  onLoad() {
    this.loadNotes()
  },
  methods: {
    // 加载笔记列表
    loadNotes() {
      this.isLoading = true
      // 模拟加载数据
      setTimeout(() => {
        this.notes = this.generateMockNotes()
        this.isLoading = false
      }, 500)
    },
    
    // 生成模拟笔记数据
    generateMockNotes() {
      return [
        {
          id: '1',
          title: '学习计划',
          content: '今天需要完成AI学习任务，包括阅读论文、编写代码和总结笔记。重点关注神经网络模型的优化方法和应用场景。',
          createdAt: new Date().getTime() - 86400000,
          updatedAt: new Date().getTime() - 3600000,
          tags: ['学习', '计划', 'AI']
        },
        {
          id: '2',
          title: '项目进度记录',
          content: '项目开发进度良好，已完成需求分析和系统设计。下一步需要开始前端开发，重点是用户界面的实现和交互逻辑的设计。',
          createdAt: new Date().getTime() - 172800000,
          updatedAt: new Date().getTime() - 7200000,
          tags: ['项目', '进度', '开发']
        },
        {
          id: '3',
          title: '会议记录',
          content: '团队会议讨论了产品迭代计划，确定了下一版本的功能优先级。需要关注用户反馈，优化核心功能体验。',
          createdAt: new Date().getTime() - 259200000,
          updatedAt: new Date().getTime() - 259200000,
          tags: ['会议', '记录', '团队']
        }
      ]
    },
    
    // 查看笔记详情
    viewNoteDetail(noteId) {
      uni.navigateTo({
        url: `/pages/notes/note-detail?id=${noteId}`
      })
    },
    
    // 添加笔记
    addNote() {
      uni.navigateTo({
        url: '/pages/notes/add-note'
      })
    },
    
    // 搜索笔记
    searchNotes() {
      uni.showToast({
        title: '搜索功能开发中',
        icon: 'none'
      })
    },
    
    // 格式化日期
    formatDate(timestamp) {
      const date = new Date(timestamp)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    // 截断文本
    truncateText(text, maxLength) {
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }
  }
}
</script>

<style>
.container {
  flex: 1;
  background-color: #f8f8f8;
  padding-bottom: 80rpx;
}

/* 导航栏样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #ffffff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
}

.header-actions {
  display: flex;
  align-items: center;
}

.header-icon {
  width: 48rpx;
  height: 48rpx;
  margin-left: 40rpx;
}

/* 笔记列表样式 */
.notes-list {
  padding: 20rpx;
}

.note-item {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.note-item:active {
  transform: scale(0.98);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.note-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  flex: 1;
}

.note-date {
  font-size: 24rpx;
  color: #999999;
  margin-left: 20rpx;
}

.note-content {
  font-size: 28rpx;
  color: #666666;
  line-height: 44rpx;
  margin-bottom: 20rpx;
}

.note-footer {
  display: flex;
  flex-wrap: wrap;
}

.note-tags {
  font-size: 24rpx;
  color: #4a6cf7;
  background-color: #e8efff;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  margin-right: 12rpx;
  margin-bottom: 12rpx;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  opacity: 0.5;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #666666;
  margin-bottom: 16rpx;
}

.empty-subtext {
  font-size: 26rpx;
  color: #999999;
  text-align: center;
  padding: 0 60rpx;
}

/* 添加按钮样式 */
.add-btn {
  position: fixed;
  right: 40rpx;
  bottom: 40rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: #4a6cf7;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(74, 108, 247, 0.4);
}

.add-btn-text {
  font-size: 60rpx;
  color: #ffffff;
  line-height: 1;
  margin-top: -8rpx;
}
</style>