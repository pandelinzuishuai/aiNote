<template>
  <view class="container page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <image src="/static/icons/back.png" mode="aspectFit"></image>
      </view>
      <view class="nav-title">任务详情</view>
      <view class="nav-right"></view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="error" class="error-container">
      <image src="/static/icons/error.png" mode="aspectFit"></image>
      <text class="error-text">{{ error }}</text>
      <button class="retry-btn" @tap="reloadTask">重试</button>
    </view>

    <!-- 任务内容 -->
    <scroll-view
      v-else
      class="task-content"
      scroll-y
      enable-back-to-top
      refresher-enabled="true"
      refresher-triggered="{{refreshing}}"
      @refresherrefresh="onRefresh"
    >
      <!-- 任务基本信息卡片 -->
      <view class="task-card">
        <!-- 任务标题和状态 -->
        <view class="task-header">
          <text class="task-title">{{ task.taskName || "无标题任务" }}</text>
          <view :class="['task-status', mapStatusToEnglish(task.status)]">
            {{ task.status || "未开始" }}
          </view>
        </view>

        <!-- 任务描述 -->
        <view class="task-description">
          <text class="description-label">描述：</text>
          <text class="description-content">{{
            task.description || "暂无描述"
          }}</text>
        </view>

        <!-- 任务信息列表 -->
        <view class="task-info">
          <!-- 优先级 -->
          <view class="info-item">
            <image
              class="info-icon"
              src="/static/icons/priority.svg"
              mode="aspectFit"
            ></image>
            <text class="info-label">优先级</text>
            <view
              :class="[
                'priority-badge',
                `priority-${getPriorityLevel(task.priority)}`,
              ]"
            >
              {{ task.priority || "中" }}
            </view>
          </view>

          <!-- 截止时间 -->
          <view class="info-item">
            <image
              class="info-icon"
              src="/static/icons/date.svg"
              mode="aspectFit"
            ></image>
            <text class="info-label">截止时间</text>
            <text
              class="info-value"
              :class="{ overdue: isOverdue && task.status !== '已完成' }"
            >
              {{ task.deadline ? formatTime(task.deadline) : "未设置" }}
            </text>
            <view
              v-if="daysRemaining"
              class="days-remaining"
              :class="{ overdue: isOverdue }"
            >
              {{ daysRemaining }}
            </view>
          </view>

          <!-- 创建时间 -->
          <view class="info-item">
            <image
              class="info-icon"
              src="/static/icons/date.svg"
              mode="aspectFit"
            ></image>
            <text class="info-label">创建时间</text>
            <text class="info-value">{{
              task.createTime ? formatTime(task.createTime) : "未知"
            }}</text>
          </view>

          <!-- 完成时间 -->
          <view v-if="task.status === '已完成'" class="info-item">
            <image
              class="info-icon"
              src="/static/icons/date.svg"
              mode="aspectFit"
            ></image>
            <text class="info-label">完成时间</text>
            <text class="info-value">{{
              task.finishTime ? formatTime(task.finishTime) : "未知"
            }}</text>
          </view>

          <!-- 用户ID -->
          <view class="info-item">
            <image
              class="info-icon"
              src="/static/icons/user.svg"
              mode="aspectFit"
            ></image>
            <text class="info-label">用户ID</text>
            <text class="info-value">{{ task.userId || "未知" }}</text>
          </view>

          <!-- 学科ID -->
          <view class="info-item">
            <image
              class="info-icon"
              src="/static/icons/category.svg"
              mode="aspectFit"
            ></image>
            <text class="info-label">学科ID</text>
            <text class="info-value">{{ task.subjectId || "未分配" }}</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮区域 -->
      <view class="action-buttons">
        <button
          v-if="task.status !== '已完成'"
          class="primary-btn"
          @tap="updateTaskStatus('已完成')"
        >
          标记为完成
        </button>
        <button v-else class="secondary-btn" @tap="updateTaskStatus('未完成')">
          重新开始
        </button>
        <button class="edit-btn" @tap="editTask">编辑任务</button>
        <button class="delete-btn" @tap="showDeleteConfirm">删除任务</button>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getTaskInfo, deleteTask, updateTaskStatus } from "../../api/task";

export default {
  data() {
    return {
      task: {
        taskId: "",
        userId: "",
        subjectId: "",
        taskName: "",
        deadline: "",
        description: "",
        priority: "中", // 高、中、低
        status: "待处理", // 待处理、进行中、已完成
        createTime: "",
        finishTime: "",
      },
      isLoading: true,
      errorMsg: "",
      refreshing: false, // 添加下拉刷新状态
    };
  },
  onLoad(options) {
    // 获取任务ID
    if (options.id) {
      this.task.taskId = options.id;
      // 加载任务详情
      this.loadTaskData();
    } else {
      // 如果没有ID参数，显示错误信息
      this.isLoading = false;
      this.errorMsg = "任务ID不存在";
    }
  },
  computed: {
    // 计算是否过期
    isOverdue() {
      if (!this.task.deadline || this.task.status === "已完成") return false;
      const now = new Date();
      const dueTime = new Date(this.task.deadline);
      return now > dueTime;
    },
    // 计算剩余天数
    daysRemaining() {
      if (!this.task.deadline || this.task.status === "已完成") return "";
      const now = new Date();
      const dueTime = new Date(this.task.deadline);
      const diffTime = dueTime - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return "已过期";
      if (diffDays === 0) return "今天到期";
      if (diffDays === 1) return "明天到期";
      return `${diffDays}天后到期`;
    },
    // 添加loading和error计算属性用于模板
    loading() {
      return this.isLoading;
    },
    error() {
      return this.errorMsg;
    },
  },
  methods: {
    // 显示删除确认对话框
    showDeleteConfirm() {
      uni.showModal({
        title: "确认删除",
        content: "确定要删除此任务吗？此操作不可撤销。",
        cancelText: "取消",
        confirmText: "删除",
        confirmColor: "#ff4d4f",
        success: (res) => {
          if (res.confirm) {
            // 用户确认删除，执行删除操作
            this.deleteTask();
          }
        },
        fail: (err) => {
          console.error("删除确认对话框失败:", err);
        },
      });
    },

    // 加载任务数据
    async loadTaskData() {
      try {
        this.isLoading = true;
        this.errorMsg = "";

        // 确保taskId存在
        if (!this.task.taskId) {
          throw new Error("任务ID不存在");
        }

        // 使用实际的API调用获取任务详情
        const response = await getTaskInfo(this.task.taskId);

        // 检查响应格式和状态
        if (response && response.code === 200 && response.data) {
          // 数据验证和处理
          this.task = this.normalizeTaskData(response.data);
        } else {
          throw new Error(response?.msg || "获取任务详情失败");
        }

        this.isLoading = false;
        this.refreshing = false;
      } catch (error) {
        this.isLoading = false;
        this.refreshing = false;
        this.errorMsg = error.message || "加载任务失败，请重试";
        console.error("Failed to load task:", error);

        // 当API调用失败时，使用基础的兜底数据确保页面不崩溃
        if (!this.task.taskId) {
          this.task = this.normalizeTaskData({});
        }
      }
    },

    // 数据标准化处理
    normalizeTaskData(data) {
      // 确保返回的数据结构完整，避免undefined值
      return {
        taskId: data.taskId || "",
        userId: data.userId || "",
        subjectId: data.subjectId || "",
        taskName: data.taskName || "无标题任务",
        deadline: data.deadline || "",
        description: data.description || "暂无描述",
        priority: data.priority || "中",
        status: data.status || "待处理",
        createTime: data.createTime || "",
        finishTime: data.finishTime || "",
      };
    },

    // 映射中文状态到英文
    mapStatusToEnglish(status) {
      const statusMap = {
        已完成: "completed",
        进行中: "in-progress",
        待处理: "pending",
      };
      return statusMap[status] || status;
    },

    // 更新任务状态
    async updateTaskStatus(newStatus) {
      try {
        // 显示加载提示
        uni.showLoading({
          title: "更新中...",
          mask: true,
        });

        // 确保taskId存在
        if (!this.task.taskId) {
          throw new Error("任务ID不存在");
        }

        // 调用真实API更新任务状态
        const response = await updateTaskStatus(this.task.taskId, newStatus);

        // 检查响应格式和状态
        if (response && response.code === 200) {
          // 更新本地状态
          this.task.status = newStatus;
          if (newStatus === "已完成") {
            this.task.finishTime = new Date().toISOString();
          } else {
            this.task.finishTime = "";
          }

          uni.hideLoading();
          uni.showToast({
            title: newStatus === "已完成" ? "任务已完成" : "任务已重新开始",
            icon: "success",
          });
        } else {
          throw new Error(response?.msg || "状态更新失败");
        }
      } catch (error) {
        uni.hideLoading();
        uni.showToast({
          title: error.message || "状态更新失败，请重试",
          icon: "none",
        });
        console.error("Failed to update task status:", error);
      }
    },

    // 返回上一页
    goBack() {
      console.log("返回")
      uni.navigateBack({
        delta: 1,
        success: function () {
          const pages = getCurrentPages(); //获取当前页面栈
          const prevPage = pages[pages.length - 2]; //获取上一个页面实例对象
          console.log(prevPage)
          prevPage.onLoad(); //调用上一个页面的onLoad方法
        },
      });
    },

    // 下拉刷新处理
    onRefresh() {
      if (this.refreshing) return;

      this.refreshing = true;
      this.loadTaskData();
    },

    // 编辑任务
    editTask() {
      try {
        uni.navigateTo({
          url: `/pages/tasks/add-task?id=${this.task.taskId}&edit=true`,
          success: () => {
            console.log("Navigate to edit task page");
          },
          fail: (err) => {
            console.error("Failed to navigate:", err);
            uni.showToast({
              title: "页面跳转失败",
              icon: "none",
            });
          },
        });
      } catch (error) {
        console.error("Navigation error:", error);
        uni.showToast({
          title: "操作失败，请重试",
          icon: "none",
        });
      }
    },

    // 重新加载任务
    reloadTask() {
      if (!this.isLoading) {
        this.loadTaskData();
      }
    },

    // 删除任务
    async deleteTask() {
      try {
        // 显示加载提示
        uni.showLoading({
          title: "删除中...",
          mask: true,
        });

        // 确保taskId存在
        if (!this.task.taskId) {
          throw new Error("任务ID不存在");
        }

        // 调用API删除任务
        const response = await deleteTask(this.task.taskId);

        // 检查响应格式和状态
        if (response && response.code === 200) {
          uni.hideLoading();
          uni.showToast({
            title: "任务删除成功",
            icon: "success",
            duration: 1500,
            success: () => {
              // 删除成功后返回上一页
              setTimeout(() => {
                uni.navigateTo("/pages/tasks/tasks");
              }, 1000);
            },
          });
        } else {
          throw new Error(response?.msg || "删除任务失败");
        }
      } catch (error) {
        uni.hideLoading();
        uni.showToast({
          title: error.message || "删除失败，请重试",
          icon: "none",
        });
        console.error("删除任务失败:", error);
      }
    },

    // 格式化时间显示
    formatTime(timeStr) {
      if (!timeStr) return "--";

      try {
        const date = new Date(timeStr);
        if (isNaN(date.getTime())) return "--";

        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const taskDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );

        // 计算日期差值
        const diffDays = Math.floor((taskDate - today) / (1000 * 60 * 60 * 24));

        // 时间格式化
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const time = `${hours}:${minutes}`;

        // 根据日期差返回不同的显示格式
        if (diffDays === 0) {
          return `今天 ${time}`;
        } else if (diffDays === 1) {
          return `明天 ${time}`;
        } else if (diffDays > 1 && diffDays <= 7) {
          return `${diffDays}天后 ${time}`;
        } else {
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const day = date.getDate().toString().padStart(2, "0");
          return `${year}-${month}-${day} ${time}`;
        }
      } catch (error) {
        console.error("Time format error:", error);
        return "--";
      }
    },

    // 获取优先级级别用于样式
    getPriorityLevel(priority) {
      switch (priority) {
        case "高":
          return "high";
        case "中":
          return "medium";
        case "低":
          return "low";
        default:
          return "normal";
      }
    },
  },

  // 监听页面显示，可用于刷新数据
  onShow() {
    // 可以在这里添加逻辑，比如检查是否从编辑页面返回需要刷新
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];

    // 如果页面被标记为需要刷新
    if (currentPage.needRefresh) {
      currentPage.needRefresh = false;
      this.loadTaskData();
    }
  },

  // 监听页面隐藏
  onHide() {
    // 清理定时器等资源
  },
};
</script>

<style scoped>
/* 确保页面容器不会溢出 */
.page-container {
  width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}

/* 基本布局样式 */
.container {
  position: relative;
  min-height: 100vh;
  background-color: #f5f5f5;
  width: 100%;
  box-sizing: border-box;
}

/* 导航栏样式 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  background-color: #fff;
  padding: 0 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
}

.nav-left,
.nav-right {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-left image {
  width: 20px;
  height: 20px;
}

.nav-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: calc(100% - 80px);
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  width: 100%;
  box-sizing: border-box;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

.loading-text {
  font-size: 14px;
  color: #666;
}

/* 错误状态样式 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}

.error-container image {
  width: 60px;
  height: 60px;
  margin-bottom: 15px;
}

.error-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.retry-btn {
  background-color: #007aff;
  color: #fff;
  border-radius: 6px;
  font-size: 14px;
}

/* 任务内容滚动区域 */
.task-content {
  padding: 15px;
  /* 确保有足够的高度来触发下拉刷新 */
  min-height: calc(100vh - 44px);
  width: 100%;
  box-sizing: border-box;
}

/* 任务卡片样式 */
.task-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  width: 100%;
  box-sizing: border-box;
}

/* 任务头部样式 */
.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  width: 100%;
  box-sizing: border-box;
  flex-wrap: wrap;
}

.task-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  flex: 1;
  margin-right: 10px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  min-width: 0;
}

.task-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-status.completed {
  background-color: #e6f7f2;
  color: #36cfc9;
}

.task-status.in-progress {
  background-color: #e6f4ff;
  color: #4096ff;
}

.task-status.pending {
  background-color: #f5f5f5;
  color: #999;
}

/* 任务描述样式 */
.task-description {
  padding: 15px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 15px;
  width: 100%;
  box-sizing: border-box;
}

.description-label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin-right: 5px;
}

.description-content {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  word-break: break-word;
}

/* 任务信息列表样式 */
.task-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  box-sizing: border-box;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  width: 100%;
  box-sizing: border-box;
  flex-wrap: wrap;
}

.info-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.info-label {
  font-size: 14px;
  color: #666;
  min-width: 70px;
}

.info-value {
  font-size: 14px;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

/* 优先级标签样式 */
.priority-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.priority-high {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.priority-medium {
  background-color: #fff7e6;
  color: #fa8c16;
}

.priority-low {
  background-color: #f0f9ff;
  color: #1890ff;
}

.priority-normal {
  background-color: #f0f0f0;
  color: #999;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
  margin-bottom: 30px;
  width: 100%;
  box-sizing: border-box;
}

.primary-btn {
  background-color: #007aff;
  color: #fff;
  border-radius: 8px;
  font-size: 16px;
  height: 44px;
  line-height: 44px;
  width: 100%;
  box-sizing: border-box;
}

.secondary-btn {
  background-color: #5856d6;
  color: #fff;
  border-radius: 8px;
  font-size: 16px;
  height: 44px;
  line-height: 44px;
  width: 100%;
  box-sizing: border-box;
}

.edit-btn {
  background-color: #fff;
  color: #000;
  border-radius: 8px;
  font-size: 16px;
  height: 44px;
  line-height: 44px;
  width: 100%;
  box-sizing: border-box;
}

.delete-btn {
  background-color: #fff1f0;
  color: #ff4d4f;
  border-radius: 8px;
  font-size: 16px;
  height: 44px;
  line-height: 44px;
  width: 100%;
  box-sizing: border-box;
}

/* 动画效果 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 响应式适配 */
@media (max-width: 375px) {
  .task-card {
    padding: 15px;
  }

  .task-title {
    font-size: 16px;
  }

  .info-label {
    min-width: 60px;
    font-size: 13px;
  }

  .info-value {
    font-size: 13px;
  }
}
/* 新增样式 */
.days-remaining {
  font-size: 12px;
  margin-left: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}

.days-remaining:not(.overdue) {
  background-color: #f0f9ff;
  color: #1890ff;
}

.days-remaining.overdue {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.info-value.overdue {
  color: #ff4d4f;
  font-weight: 500;
}
</style>
