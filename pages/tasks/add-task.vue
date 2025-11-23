<template>
  <view class="add-task-container page-container">
    <view class="header">
      <view class="back-button" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="page-title">创建新任务</text>
    </view>

    <scroll-view scroll-y="true" class="form-scroll">
      <view class="form-container">
        <view class="form-item">
          <view class="form-label">任务标题</view>
          <input
            class="form-input"
            v-model="task.title"
            placeholder="请简要描述您的任务"
            maxlength="100"
          />
        </view>

        <view class="form-item">
          <view class="form-label">描述（可选）</view>
          <textarea
            class="form-textarea"
            v-model="task.description"
            placeholder="关于该任务的详细描述..."
            maxlength="500"
            rows="4"
          />
        </view>

        <view class="form-item">
          <view class="form-label">优先级</view>
          <view class="priority-options">
            <view
              class="priority-option high"
              :class="{ active: task.priority === '高' }"
              @click="task.priority = '高'"
            >
              <text class="priority-icon">⚠️</text>
              <text class="priority-text">高优先级</text>
            </view>

            <view
              class="priority-option medium"
              :class="{ active: task.priority === '中' }"
              @click="task.priority = '中'"
            >
              <text class="priority-icon">⚠️</text>
              <text class="priority-text">中等</text>
            </view>

            <view
              class="priority-option low"
              :class="{ active: task.priority === '低' }"
              @click="task.priority = '低'"
            >
              <text class="priority-icon">▼</text>
              <text class="priority-text">低</text>
            </view>
          </view>
        </view>
        1111
        <view class="form-item">
          <view class="form-label">截止日期</view>
          <uni-datetime-picker
            type="datetime"
            :value="task.deadline"
            :start="new Date().toISOString().split('T')[0]"
            :end="new Date().getFullYear() + 3 + '-12-31'"
            @change="onDeadlineChange"
            placeholder="选择截止日期和时间"
            border
          />
        </view>

        <view class="form-item">
          <view class="form-label">估计时间</view>
          <view class="time-picker-container">
            <view class="picker-item">
              <view class="picker-label">开始时间</view>
              <uni-datetime-picker
                type="time"
                :value="task.estimatedStartTime"
                @change="onStartTimeChange"
                placeholder="选择开始时间"
                border
              />
            </view>
            <view class="picker-item">
              <view class="picker-label">结束时间</view>
              <uni-datetime-picker
                type="time"
                :value="task.estimatedEndTime"
                @change="onEndTimeChange"
                placeholder="选择结束时间"
                border
              />
            </view>
          </view>
        </view>
        <view class="form-item">
          <view class="form-label">关联标签</view>
          <input
            class="form-input"
            v-model="task.tags"
            placeholder="输入标签或选择已有标签"
            maxlength="50"
          />
          <view class="tags-container">
            <view
              v-for="(tag, index) in popularTags"
              :key="index"
              class="tag-item"
              @click="selectTag(tag)"
            >
              <text># {{ tag }}</text>
            </view>
          </view>
        </view>
        <view class="form-item">
          <view class="form-label">所属课程/项目</view>
          <input
            class="form-input"
            v-model="task.course"
            placeholder="例如：数学分析"
            maxlength="50"
          />
        </view>
      </view>
    </scroll-view>

    <view class="footer">
      <button
        class="submit-button"
        type="primary"
        @click="submitTask"
        :disabled="!isFormValid"
      >
        创建任务
      </button>
    </view>
  </view>
</template>

<script>
import { addTask } from "../../api/task";
import { getUserId, removeUserId } from "../../utils/storage";

export default {
  data() {
    // 设置默认开始日期为今天
    const today = new Date();
    const startDate =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");

    // 设置默认结束日期为明天
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDeadline =
      tomorrow.getFullYear() +
      "-" +
      String(tomorrow.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(tomorrow.getDate()).padStart(2, "0") +
      " 18:00";

    return {
      task: {
        title: "",
        description: "",
        priority: "medium", // 默认中等优先级
        deadline: defaultDeadline,
        estimatedStartTime: "",
        estimatedEndTime: "",
        tags: "",
        course: "",
      },
      popularTags: ["作业", "复习", "预习", "实验", "报告", "论文", "考试"],
      startDate: startDate,
      isDatePickerVisible: false,
      isTimePickerVisible: false,
      currentPicker: "",
      // 开发测试模式

      defaultDeadline: defaultDeadline,
    };
  },
  computed: {
    isFormValid() {
      // 基本表单验证：任务标题不能为空
      return (
        this.task.title.trim().length > 0 &&
        this.task.title.trim().length <= 100
      );
    },
  },
  watch: {
    // 监听截止日期变化，检查是否选择了过去的日期
    "task.deadline"(newVal) {
      if (newVal) {
        const selectedDate = new Date(newVal);
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (selectedDate < now) {
          uni.showToast({
            title: "截止日期不能早于今天",
            icon: "none",
            duration: 2000,
          });
        }
      }
    },
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    selectTag(tag) {
      // 如果已有标签，添加空格分隔
      if (this.task.tags) {
        this.task.tags += " ";
      }
      this.task.tags += tag;
    },
    // 处理截止日期变化
    onDeadlineChange(e) {
      this.task.deadline = e;
    },
    // 移除不再需要的确认和取消方法，内置API直接处理

    // onDateCancel 方法已移除，内置API会自动处理取消逻辑
    // 表单验证方法
    validateForm() {
      // 验证任务标题
      if (!this.task.title.trim()) {
        uni.showToast({
          title: "请输入任务标题",
          icon: "none",
        });
        return false;
      }

      if (this.task.title.trim().length > 100) {
        uni.showToast({
          title: "任务标题不能超过100个字符",
          icon: "none",
        });
        return false;
      }

      // 验证描述长度
      if (this.task.description && this.task.description.length > 500) {
        uni.showToast({
          title: "任务描述不能超过500个字符",
          icon: "none",
        });
        return false;
      }

      // 验证时间范围
      if (this.task.estimatedStartTime && this.task.estimatedEndTime) {
        const startTime = new Date(
          `2000-01-01 ${this.task.estimatedStartTime}`
        );
        const endTime = new Date(`2000-01-01 ${this.task.estimatedEndTime}`);

        if (startTime >= endTime) {
          uni.showToast({
            title: "开始时间不能晚于结束时间",
            icon: "none",
          });
          return false;
        }
      }

      return true;
    },
    // 检查用户是否登录
    checkLogin() {
      const userId = getUserId();
      if (!userId) {
        uni.showModal({
          title: "提示",
          content: "请先登录",
          showCancel: false,
          success: () => {
            uni.navigateTo({
              url: "/pages/login/login",
            });
          },
        });
        return false;
      }
      return true;
    },
    // 处理开始时间变化
    onStartTimeChange(e) {
      this.task.estimatedStartTime = e;
    },

    // 处理结束时间变化
    onEndTimeChange(e) {
      this.task.estimatedEndTime = e;
    },

    // 构建完整描述，包含原始描述和额外信息
    buildFullDescription() {
      let fullDescription = this.task.description?.trim() || "";

      // 如果有额外信息，添加到描述中
      const additionalInfo = [];

      if (this.task.estimatedStartTime && this.task.estimatedEndTime) {
        additionalInfo.push(
          `预计时间: ${this.task.estimatedStartTime} - ${this.task.estimatedEndTime}`
        );
      } else if (this.task.estimatedStartTime) {
        additionalInfo.push(`预计开始时间: ${this.task.estimatedStartTime}`);
      } else if (this.task.estimatedEndTime) {
        additionalInfo.push(`预计结束时间: ${this.task.estimatedEndTime}`);
      }

      if (this.task.tags?.trim()) {
        additionalInfo.push(`标签: ${this.task.tags.trim()}`);
      }

      if (this.task.course?.trim()) {
        additionalInfo.push(`课程/项目: ${this.task.course.trim()}`);
      }

      // 如果有额外信息，添加到描述中
      if (additionalInfo.length > 0) {
        if (fullDescription) {
          fullDescription += "\n\n";
        }
        fullDescription += "--- 补充信息 ---\n" + additionalInfo.join("\n");
      }

      return fullDescription;
    },
    // onStartTimeConfirm、onEndTimeConfirm 和 onTimeCancel 方法已移除，内置API直接处理
    submitTask() {
      // 检查登录状态
      if (!this.checkLogin()) {
        return;
      }

      // 执行详细表单验证
      if (!this.validateForm()) {
        return;
      }

      // 构建符合API要求的任务对象
      // 只包含API接口明确支持的字段
      console.log(this.task)
      const taskData = {
        userId: parseInt(getUserId()), // 确保userId是数字类型
        taskName: this.task.title.trim(),
        description: this.buildFullDescription(), // 合并原始描述和额外信息
        deadline: this.task.deadline.replace(" ", "T"),
        priority: this.task.priority,
        // 注意：API接口目前不支持estimatedStartTime、estimatedEndTime、tags、course等字段
        // 这些信息已合并到description中
      };

      // 输出日志以便调试
      console.log("提交的任务数据:", taskData);

      // 调用真实的API保存任务
      uni.showLoading({
        title: "创建中...",
      });

      // 调用真实的API保存任务
      addTask(taskData).then((res) => {
        uni.hideLoading();

        if (res.code === 200) {
          // 成功提示
          uni.showToast({
            title: "任务创建成功",
            icon: "success",
          });

          // 返回上一页并携带新任务数据
          uni.navigateBack({
            delta: 1,
          });
        }
      });

      // 非测试模式下调用真实API
      addTask(taskData)
        .then((res) => {
          uni.hideLoading();
          console.log("API响应:", res);

          if (res.code === 200) {
            // 返回上一页并携带新任务数据
            uni.navigateTo('/pages/tasks/tasks');
          } else {

            // 显示错误提示
            uni.showToast({
              title: error.title,
              icon: "none",
              duration: 2500,
            });
          }
        })
        .catch((error) => {
          uni.hideLoading();
          console.error("创建任务失败:", error);

          // 显示错误提示
          uni.showToast({
            title: error,
            icon: "none",
            duration: 2500,
          });
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

.add-task-container {
  min-height: 100vh;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 20rpx;
  background-color: #ffffff;
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  box-sizing: border-box;

  .back-button {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .back-icon {
      font-size: 36rpx;
      color: #333333;
    }
  }

  .page-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333333;
  }

  .header-right {
    width: 60rpx;

    .test-button {
      padding: 8rpx 16rpx;
      background-color: #e6f7ff;
      border-radius: 16rpx;
      font-size: 20rpx;

      .test-text {
        color: #1890ff;
      }
    }
  }
}

.form-scroll {
  flex: 1;
  padding-bottom: 30rpx;
  width: 100%;
  box-sizing: border-box;
}

.form-container {
  padding: 20rpx;
  width: 100%;
  box-sizing: border-box;

  .form-item {
    background-color: #ffffff;
    border-radius: 20rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
    width: 100%;
    box-sizing: border-box;

    .form-label {
      font-size: 28rpx;
      color: #333333;
      font-weight: 500;
      margin-bottom: 16rpx;
    }

    .form-input {
      width: 100%;
      font-size: 28rpx;
      color: #333333;
      border: none;
      padding: 8rpx 0;
      box-sizing: border-box;
    }

    .form-textarea {
      width: 100%;
      font-size: 28rpx;
      color: #333333;
      border: none;
      padding: 8rpx 0;
      min-height: 160rpx;
      resize: none;
      line-height: 1.5;
      box-sizing: border-box;
      word-break: break-word;
    }

    .date-container {
      display: flex;
      flex-direction: column;
      gap: 10rpx;
    }

    .date-value {
      font-size: 28rpx;
      color: #333;
      padding: 10rpx 0;
    }

    .date-placeholder {
      font-size: 28rpx;
      color: #999;
      padding: 10rpx 0;
    }

    .picker-button {
      background-color: #f0f4ff;
      color: #5374f7;
      border: 1rpx solid #e0e8ff;
      border-radius: 10rpx;
      font-size: 28rpx;
      padding: 15rpx 0;
      width: 100%;
    }

    .picker-button:active {
      background-color: #e0e8ff;
    }

    .time-picker-container {
      display: flex;
      flex-direction: column;
      gap: 20rpx;
    }

    .picker-item {
      width: 100%;
    }

    .picker-label {
      font-size: 24rpx;
      color: #666;
      margin-bottom: 8rpx;
    }

    .picker-content {
      font-size: 28rpx;
      color: #333;
      padding: 15rpx 0;
      border-bottom: 1rpx solid #e0e0e0;
    }

    .picker-content:active {
      background-color: #f5f5f5;
    }

    .priority-options {
      display: flex;
      gap: 20rpx;
      width: 100%;
      box-sizing: border-box;

      .priority-option {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        padding: 20rpx 0;
        border-radius: 16rpx;
        border: 2rpx solid #e0e0e0;
        transition: all 0.3s;
        box-sizing: border-box;

        &.active {
          border-color: #5374f7;
          background-color: #f0f4ff;
        }

        &.high {
          &.active {
            border-color: #ff4d4f;
            background-color: #fff1f0;
          }
        }

        &.medium {
          &.active {
            border-color: #faad14;
            background-color: #fff7e6;
          }
        }

        &.low {
          &.active {
            border-color: #1890ff;
            background-color: #e6f7ff;
          }
        }

        .priority-icon {
          font-size: 36rpx;
          margin-bottom: 8rpx;
        }

        .priority-text {
          font-size: 24rpx;
          color: #666666;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;

          .priority-option.active & {
            color: #5374f7;
          }

          .priority-option.high.active & {
            color: #ff4d4f;
          }

          .priority-option.medium.active & {
            color: #faad14;
          }

          .priority-option.low.active & {
            color: #1890ff;
          }
        }
      }
    }

    .date-container {
      display: flex;
      align-items: center;
      width: 100%;
      box-sizing: border-box;

      .date-input {
        flex: 1;
        font-size: 28rpx;
        color: #333333;
        border: none;
        padding: 8rpx 0;
        box-sizing: border-box;
        background-color: transparent;
      }

      .calendar-icon {
        margin-left: 20rpx;
        font-size: 32rpx;
        cursor: pointer;
      }
    }

    .time-range-container {
      display: flex;
      align-items: center;
      width: 100%;
      box-sizing: border-box;

      .time-input {
        flex: 1;
        font-size: 28rpx;
        color: #333333;
        border: none;
        padding: 8rpx 0;
        text-align: center;
        box-sizing: border-box;
        background-color: transparent;
        cursor: pointer;
      }

      .time-separator {
        font-size: 28rpx;
        color: #666666;
        margin: 0 20rpx;
      }
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      margin-top: 16rpx;
      gap: 12rpx;
      width: 100%;
      box-sizing: border-box;

      .tag-item {
        padding: 8rpx 20rpx;
        background-color: #f0f0f0;
        border-radius: 20rpx;
        font-size: 24rpx;
        color: #666666;
        box-sizing: border-box;
        white-space: nowrap;
      }
    }
  }
}

.footer {
  padding: 20rpx;
  background-color: #ffffff;
  border-top: 2rpx solid #f0f0f0;
  position: sticky;
  bottom: 0;
  width: 100%;
  box-sizing: border-box;

  .submit-button {
    width: 100%;
    height: 96rpx;
    font-size: 32rpx;
    font-weight: 600;
    color: #ffffff;
    background-color: #5374f7;
    border-radius: 48rpx;
    border: none;
    line-height: 96rpx;
    box-sizing: border-box;
  }
}

// 为禁用状态添加样式
button[disabled] {
  background-color: #a0a0a0 !important;
  color: #ffffff !important;
}

// 输入框聚焦样式
input:focus,
textarea:focus {
  outline: none;
}
</style>
