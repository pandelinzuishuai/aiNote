<template>
  <view class="tasks-container page-container">
    <view class="filter-tabs">
      <view
        class="tab"
        :class="{ active: activeTab === 'all' }"
        @click="changeTab('all')"
      >
        <text class="tab-text">全部任务</text>
      </view>
      <view
        class="tab"
        :class="{ active: activeTab === 'pending' }"
        @click="changeTab('pending')"
      >
        <text class="tab-text">未开始</text>
      </view>
      <view
        class="tab"
        :class="{ active: activeTab === 'in_progress' }"
        @click="changeTab('in_progress')"
      >
        <text class="tab-text">进行中</text>
      </view>
      <view
        class="tab"
        :class="{ active: activeTab === 'completed' }"
        @click="changeTab('completed')"
      >
        <text class="tab-text">已完成</text>
      </view>
      <view
        class="tab"
        :class="{ active: activeTab === 'overdue' }"
        @click="changeTab('overdue')"
      >
        <text class="tab-text">已过期</text>
      </view>
    </view>

    <view class="sort-container">
      <picker
        class="sort-picker"
        :range="sortOptions"
        :value="currentSortIndex"
        @change="handleSortChange"
      >
        <view class="sort-text">
          {{ sortOptions[currentSortIndex] }}
          <text class="sort-icon">▼</text>
        </view>
      </picker>
    </view>

    <scroll-view
      scroll-y="true"
      :refresher-triggered="triggered"
      class="tasks-list"
      refresher-enabled="true"
      @refresherpulling="onPulling"
      @refresherrefresh="onRefresh"
    >
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 任务列表 -->
      <view v-else-if="tasks.length > 0">
        <view
          class="task-card"
          v-for="(task, index) in tasks"
          :key="task.id"
          :class="getTaskPriorityClass(task.priority)"
          @click="toTaskDetail(task)"
        >
          <view class="task-header">
            <view class="priority-badge" :class="task.priority">
              <text class="priority-text">{{
                getPriorityText(task.priority)
              }}</text>
            </view>
            <text class="deadline-time">{{ formatTime(task.deadline) }}</text>
          </view>

          <view class="task-content">
            <text class="task-title">{{ task.taskName || "无标题任务" }}</text>
            <text class="task-description">{{
              task.description || "无任务描述"
            }}</text>
            <text class="task-course">{{
              task.subjectName || "通用课程"
            }}</text>
          </view>

          <view class="task-footer">
            <view class="priority-info">
              <text class="priority-dot" :class="task.priority"></text>
              <text class="priority-label">{{
                getPriorityLabel(task.priority)
              }}</text>
            </view>

            <view class="task-actions">
              <view v-if="task.hasAttachment" class="attachment-icon">
                <text>📎</text>
              </view>

              <view class="status-buttons">
                <view
                  class="status-btn"
                  :class="{ active: task.status === '未完成' }"
                  @click="updateTaskStatus(task, 'pending')"
                >
                  未完成
                </view>
                <view
                  class="status-btn"
                  :class="{ active: task.status === '已完成' }"
                  @click="updateTaskStatus(task, 'completed')"
                >
                  已完成
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-container">
        <view class="empty-icon">📝</view>
        <text class="empty-text">暂无任务</text>
        <text class="empty-subtext">点击右下角按钮添加新任务</text>
      </view>
    </scroll-view>

    <view class="add-task-btn" @click="navigateToAddTask">
      <text class="add-task-icon">+</text>
    </view>
  </view>
</template>

<script>
import { getTaskList, updateTaskStatus } from "../../api/task";

export default {
  data() {
    return {
      activeTab: "all",
      triggered: false,
      currentSortIndex: 0,
      sortOptions: ["按优先级排序", "按截止时间排序", "按创建时间排序"],
      tasks: [], // 初始化为空数组，从服务器获取数据
      loading: false, // 添加加载状态
      total: 0, // 总任务数
      currentPage: 1, // 当前页码
      pageSize: 20, // 每页大小
    };
  },

  onLoad() {
    // 页面加载时获取任务列表
    this.fetchTasksList();
  },

  methods: {
    // 获取任务列表的方法
    async fetchTasksList() {
      try {
        // 设置加载状态
        this.loading = true;

        const query = {
          currentPage: this.currentPage,
          pageSize: this.pageSize,
          status: this.activeTab === "all" ? "" : this.activeTab,
        };

        const res = await getTaskList(query);

        // 检查响应数据结构
        if (res && res.data) {
          this.tasks = res.data.records || [];
          this.total = res.data.total || 0;
        } else {
          this.tasks = [];
          this.total = 0;
          console.warn("响应数据结构不符合预期:", res);
        }
      } catch (error) {
        console.error("获取任务列表失败:", error);
        this.tasks = [];
        this.total = 0;

        // 提供更友好的错误提示
        uni.showToast({
          title: "获取任务列表失败，请稍后重试",
          icon: "none",
          duration: 2000,
        });
      } finally {
        // 无论成功失败都关闭加载状态
        this.loading = false;
      }
    },
    handleSortChange(e) {
      this.currentSortIndex = e.detail.value;
      
      // 排序后不需要重新请求，直接在前端排序
      this.sortTasks();
    },
    // 前端排序方法
    sortTasks() {
      const sortedTasks = [...this.tasks];

      switch (this.currentSortIndex) {
        case 0: // 按优先级排序
          // 优先级排序：高 > 中 > 低
          sortedTasks.sort((a, b) => {
            // 使用中文键名匹配数据
            const priorityOrder = { 高: 0, 中: 1, 低: 2 };
            return (
              (priorityOrder[a.priority] || 3) -
              (priorityOrder[b.priority] || 3)
            );
          });
          break;
        case 1: // 按截止时间排序
          // 截止时间排序
          sortedTasks.sort((a, b) => {
            return new Date(a.deadline || 0) - new Date(b.deadline || 0);
          });
          break;
        case 2: // 按创建时间排序
          // 创建时间排序（假设字段名）
          sortedTasks.sort((a, b) => {
            return new Date(b.createTime || 0) - new Date(a.createTime || 0); // 最新的在前
          });
          break;
      }

      this.tasks = sortedTasks;
    },
    // 切换标签页的方法
    changeTab(tab) {
      this.activeTab = tab;
      this.fetchTasksList(); // 切换标签后重新获取任务列表
    },
    // 更新任务状态的方法
    async updateTaskStatus(task, status) {
      try {
        // 阻止事件冒泡，避免触发卡片点击事件
        if (event) event.stopPropagation();

        // 显示加载提示
        uni.showLoading({
          title: "更新中...",
        });

        // 调用API更新任务状态
        await updateTaskStatus(task.id, status);

        // 更新本地数据
        const taskIndex = this.tasks.findIndex((t) => t.id === task.id);
        if (taskIndex !== -1) {
          this.$set(this.tasks[taskIndex], "status", status);
          // 如果是切换到已完成状态，设置完成时间
          if (status === "completed") {
            this.$set(
              this.tasks[taskIndex],
              "completedTime",
              new Date().toISOString()
            );
          }
        }

        uni.showToast({
          title: "任务状态已更新",
          icon: "success",
        });
      } catch (error) {
        console.error("更新任务状态失败:", error);
        uni.showToast({
          title: "更新任务状态失败",
          icon: "none",
        });
      } finally {
        // 隐藏加载提示
        uni.hideLoading();
      }
    },
    getTaskPriorityClass(priority) {
      return {
        "high-priority": priority === "高",
        "medium-priority": priority === "中",
        "low-priority": priority === "低",
      };
    },
    getPriorityText(priority) {
      const texts = {
        high: "高优先级",
        medium: "普通优先级",
        low: "普通优先级",
      };
      return texts[priority] || "";
    },
    getPriorityLabel(priority) {
      const labels = {
        high: "高优先级",
        medium: "中等优先级",
        low: "低优先级",
      };
      return labels[priority] || "";
    },
    navigateToAddTask() {
      uni.navigateTo({
        url: "/pages/tasks/add-task",
      });
    },
    toTaskDetail(task) {
      uni.navigateTo({
        url: "/pages/tasks/task-detail?id=" + task.taskId,
      });
    },
    // 格式化时间的方法
    formatTime(time) {
      if (!time) return "暂无截止时间";
      try {
        const date = new Date(time);
        const now = new Date();
        const diffTime = Math.abs(date - now);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          return (
            "今天 " +
            date.getHours().toString().padStart(2, "0") +
            ":" +
            date.getMinutes().toString().padStart(2, "0")
          );
        } else if (diffDays === 1) {
          return (
            "明天 " +
            date.getHours().toString().padStart(2, "0") +
            ":" +
            date.getMinutes().toString().padStart(2, "0")
          );
        } else if (diffDays < 7) {
          return diffDays + "天后";
        } else {
          return (
            date.getFullYear() +
            "-" +
            (date.getMonth() + 1).toString().padStart(2, "0") +
            "-" +
            date.getDate().toString().padStart(2, "0")
          );
        }
      } catch (error) {
        return time;
      }
    },

    // 下拉刷新相关方法
    onPulling() {
      var that = this;
      if (!this.triggered) {
        //下拉加载，先让其变true再变false才能关闭
        this.triggered = true;
        //关闭加载状态 (转动的圈)，需要一点延时才能关闭
        setTimeout(() => {
          that.triggered = false;
        }, 1000);
      }
    },

    onRefresh() {
      // 重置页码为第一页
      this.currentPage = 1;
      // 重新获取数据
      this.fetchTasksList().then(() => {
        // 数据加载完成后，停止下拉刷新动画
        uni.stopPullDownRefresh();
      });
    },
  },
};
</script>

<style lang="scss" scoped>
/* 确保页面容器不会溢出 */
.page-container {
  width: 100%;
  overflow-x: hidden;
}

.tasks-container {
  min-height: 100vh;
  background-color: #f8faff;
  padding-bottom: 120rpx;
  box-sizing: border-box;
}

.header {
  padding: 30rpx 20rpx;
  background-color: #ffffff;
  width: 100%;
  box-sizing: border-box;

  .page-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333333;
  }
}

.filter-tabs {
  display: flex;
  background-color: #ffffff;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
  overflow-x: auto;
  white-space: nowrap;
  width: 100%;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }

  .tab {
    padding: 10rpx 30rpx;
    margin: 0 10rpx;
    border-radius: 20rpx;
    box-sizing: border-box;

    &.active {
      background-color: #5374f7;

      .tab-text {
        color: #fff;
      }
    }

    .tab-text {
      font-size: 28rpx;
      color: #666666;

      .tab.active & {
        color: #ffffff;
      }
    }
  }
}

.sort-container {
  background-color: #ffffff;
  padding: 20rpx;
  margin-bottom: 20rpx;
  width: 100%;
  box-sizing: border-box;

  .sort-picker {
    .sort-text {
      font-size: 28rpx;
      color: #333333;
      display: flex;
      align-items: center;

      .sort-icon {
        margin-left: 8rpx;
        font-size: 24rpx;
      }
    }
  }
}

.tasks-list {
  padding: 0 20rpx;
  min-height: 600rpx;
  width: 100%;
  box-sizing: border-box;
  flex: 1;
}

.task-card {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  border-left: 8rpx solid transparent;
  width: 100%;
  box-sizing: border-box;
  word-break: break-word;

  &.high-priority {
    border-left-color: #ff4d4f;
    background-color: #fff1f0;
  }

  &.medium-priority {
    border-left-color: #faad14;
    background-color: #fff7e6;
  }

  &.low-priority {
    border-left-color: #1890ff;
    background-color: #e6f7ff;
  }

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
    width: 100%;

    .priority-badge {
      padding: 4rpx 16rpx;
      border-radius: 12rpx;
      font-size: 20rpx;
      max-width: 60%;

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

    .deadline-time {
      font-size: 24rpx;
      color: #666666;
      max-width: 40%;
      text-align: right;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .task-content {
    margin-bottom: 20rpx;
    width: 100%;

    .task-title {
      display: block;
      font-size: 32rpx;
      font-weight: 600;
      color: #333333;
      margin-bottom: 8rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }

    .task-description {
      display: block;
      font-size: 26rpx;
      color: #666666;
      margin-bottom: 8rpx;
      line-height: 1.5;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .task-course {
      font-size: 24rpx;
      color: #999999;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .task-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .priority-info {
      display: flex;
      align-items: center;
      max-width: 40%;

      .priority-dot {
        width: 12rpx;
        height: 12rpx;
        border-radius: 50%;
        margin-right: 8rpx;

        &.high {
          background-color: #ff4d4f;
        }

        &.medium {
          background-color: #faad14;
        }

        &.low {
          background-color: #1890ff;
        }
      }

      .priority-label {
        font-size: 24rpx;
        color: #666666;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .task-actions {
      display: flex;
      align-items: center;
      max-width: 60%;

      .attachment-icon {
        margin-right: 20rpx;
        font-size: 28rpx;
      }

      .status-buttons {
        display: flex;
        gap: 12rpx;

        .status-btn {
          padding: 6rpx 20rpx;
          border-radius: 16rpx;
          font-size: 22rpx;
          color: #999999;
          border: 2rpx solid #e0e0e0;
          box-sizing: border-box;

          &.active {
            color: #5374f7;
            border-color: #5374f7;
            background-color: #f0f4ff;
          }
        }
      }
    }
  }
}

.add-task-btn {
  position: fixed;
  bottom: 100rpx;
  right: 40rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: #5374f7;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(83, 116, 247, 0.3);
  z-index: 999;

  .add-task-icon {
    font-size: 56rpx;
    color: #ffffff;
    line-height: 1;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  width: 100%;
  box-sizing: border-box;

  .loading-spinner {
    width: 60rpx;
    height: 60rpx;
    border: 6rpx solid #e0e0e0;
    border-top-color: #5374f7;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20rpx;
  }

  .loading-text {
    font-size: 28rpx;
    color: #666666;
  }
}

.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  width: 100%;
  box-sizing: border-box;

  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 40rpx;
  }

  .empty-text {
    font-size: 32rpx;
    color: #666666;
    margin-bottom: 20rpx;
  }

  .empty-subtext {
    font-size: 26rpx;
    color: #999999;
    text-align: center;
    padding: 0 40rpx;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
