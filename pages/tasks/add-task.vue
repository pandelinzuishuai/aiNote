<template>
  <view class="add-task-container page-container">
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
        <!-- 学科选择 -->
        <view class="form-item">
          <text class="section-label">所属学科</text>
          <uni-data-select
            v-model="task.subjectId"
            :localdata="subjectList"
            :loading="subjectLoading"
            placeholder="请选择学科"
            mode="none"
            clearable
            @change="
              (e) => {
                // 当学科变更时，更新对应的学科名称
                const selected = this.subjectList.find(
                  (s) => s.value === e.detail.value
                );
                this.task.subjectName = selected ? selected.text : '';
              }
            "
          />
          <text
            v-if="task.subjectId && subjectList.length > 0"
            class="selected-subject-info"
          >
            当前选择: {{ getSelectedSubjectName() }}
          </text>
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
        <view class="form-item">
          <view class="form-label">截止日期</view>
          <uni-datetime-picker
            type="datetime"
            v-model="task.deadline"
            :start="new Date().toISOString().split('T')[0]"
            :end="new Date().getFullYear() + 3 + '-12-31'"
            @change="onDeadlineChange"
            placeholder="选择截止日期和时间"
            border
          />
        </view>

        <!-- 标签选择 -->
        <view class="form-item">
          <text class="section-label">关联标签</text>
          <view class="tags-container">
            <view
              v-for="tag in tags"
              :key="tag.id"
              class="tag-item"
              @click="removeTag(tag.id)"
            >
              {{ tag.tagName }}
              <text class="tag-close">×</text>
            </view>
            <view class="tag-add-btn" @click="openTagSelector">
              + 添加标签
            </view>
          </view>
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
        {{ isEditMode ? "更新任务" : "创建任务" }}
      </button>
    </view>
    <!-- 标签选择器弹窗 -->
    <uni-drawer ref="showRight" mode="right" background-color="#fff">
      <view class="tag-selector-content">
        <view class="tag-selector-header">
          <text class="tag-selector-title">选择标签</text>
          <view class="tag-selector-close" @click="closeTagSelector">
            <text class="close-icon">×</text>
          </view>
        </view>
        <view class="tag-list" @scrolltolower="loadMoreTags">
          <uni-tag
            v-for="tag in tagList"
            :key="tag.id"
            :text="tag.tagName"
            :type="isTagSelected(tag.id) ? 'primary' : 'default'"
            inverted
            @click="toggleTag(tag)"
          />
          <!-- 加载更多提示 -->
          <view v-if="tagLoading" class="loading-more">
            <text>加载中...</text>
          </view>

          <!-- 没有更多数据提示 -->
          <view
            v-else-if="!hasMoreTags && tagList.length > 0"
            class="no-more-data"
          >
            <text>没有更多标签了</text>
          </view>
        </view>
      </view>
    </uni-drawer>
  </view>
</template>

<script>
import { addTask, getTaskInfo, updateTask } from "../../api/task";
import { getUserId, removeUserId } from "../../utils/storage";
// 导入现成的接口函数，而不是直接使用request
import { getSubjectList } from "../../api/subject";
import { getTagList } from "../../api/tag";

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

    return {
      task: {
        taskId: "", // 任务ID，用于编辑模式
        title: "",
        description: "",
        priority: "中", // 默认中等优先级
        deadline: "",
        remindTime: "", // 提醒时间，暂不使用
        tagId: "", // 标签ID，逗号分隔的字符串
        subjectId: "", // 学科ID
        subjectName: "", // 学科名称
      },
      isEditMode: false, // 是否为编辑模式
      tags: [], // 已选标签
      popularTags: ["作业", "复习", "预习", "实验", "报告", "论文", "考试"],
      startDate: startDate,
      isDatePickerVisible: false,
      isTimePickerVisible: false,
      currentPicker: "",
      // 学科选择相关
      subjectList: [],
      subjectLoading: false,
      // 标签选择相关
      tagList: [],
      tagLoading: false,
      currentPage: 1, // 分页相关参数
      pageSize: 20, // 每页加载的标签数量
      hasMoreTags: true,
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
        const cleanedDate = newVal.replace(" ", "T");
        const selectedDate = new Date(cleanedDate);
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
  onLoad(options) {
    // 根据传入参数判断是否为编辑模式
    if (options && options.taskId) {
      this.isEditMode = true;
      this.task.taskId = options.taskId;
      // 设置导航栏标题
      uni.setNavigationBarTitle({
        title: "编辑任务",
      });
    } else {
      // 设置导航栏标题
      uni.setNavigationBarTitle({
        title: "创建任务",
      });
    }

    // 初始化加载学科列表
    this.fetchSubjectList();
    // 预加载标签列表（传入true表示重置并重新加载）
    this.fetchTagList(true);

    // 检查是否为编辑模式并加载任务详情
    if (this.isEditMode) {
      // 加载任务详情
      this.loadTaskDetail();
    } else if (options && options.id && options.edit === "true") {
      // 兼容旧的参数方式
      this.isEditMode = true;
      this.task.taskId = options.id;
      uni.setNavigationBarTitle({
        title: "编辑任务",
      });
      this.loadTaskDetail();
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },

    // 加载任务详情
    async loadTaskDetail() {
      if (!this.task.taskId) {
        console.error("任务ID不存在");
        return;
      }

      try {
        uni.showLoading({
          title: "加载中...",
        });

        const response = await getTaskInfo(this.task.taskId);
        console.log("任务详情:", response);

        if (response && response.code === 200 && response.data) {
          const taskData = response.data;

          // 填充任务数据
          this.task.title = taskData.taskName || "";
          this.task.description = taskData.description || "";
          this.task.priority = taskData.priority || "中";

          // 格式化截止日期，确保生成iOS兼容的格式
          if (taskData.deadline) {
            // 处理日期格式，确保兼容iOS设备
            // 先移除时区信息
            this.task.deadline = taskData.deadline.replace("T", " ");
            console.log("格式化后的截止日期:", this.task.deadline);
          } else {
            this.task.deadline = "";
          }

          this.task.subjectId = taskData.subjectId;
          this.task.subjectName = taskData.subjectName || "";

          // 处理标签数据
          if (taskData.tagId) {
            this.task.tagId = taskData.tagId;

            // 立即处理标签，不再等待nextTick
            const tagIds = taskData.tagId.split(",");
            this.tags = [];

            console.log("标签ID列表:", tagIds);
            console.log("可用标签列表:", this.tagList);

            // 从已加载的标签列表中找出对应的标签并选中
            // 使用String()确保类型匹配
            tagIds.forEach((tagId) => {
              const tag = this.tagList.find(
                (t) => String(t.id) === String(tagId)
              );
              if (tag) {
                this.tags.push(tag);
                console.log("找到并添加标签:", tag.tagName);
              } else {
                console.log("未找到标签:", tagId);
                // 如果找不到，创建一个临时标签对象以显示在UI上
                this.tags.push({ id: tagId, tagName: "标签" + tagId });
              }
            });
          } else {
            this.task.tagId = "";
            this.tags = [];
          }
        } else {
          uni.showToast({
            title: response?.msg || "加载任务详情失败",
            icon: "none",
          });
        }
        console.log(this.task);
      } catch (error) {
        console.error("加载任务详情异常:", error);
        uni.showToast({
          title: "加载任务详情异常，请重试",
          icon: "none",
        });
      } finally {
        uni.hideLoading();
      }
    },

    // 获取选中的学科名称
    getSelectedSubjectName() {
      const subject = this.subjectList.find(
        (s) => s.value === this.task.subjectId
      );
      return subject ? subject.text : "";
    },

    // 获取学科列表
    async fetchSubjectList() {
      try {
        this.subjectLoading = true;

        // 获取科目列表，使用较大的pageSize确保一次性加载所有科目
        const subjectQuery = {
          currentPage: 1,
          pageSize: 100, // 假设不会有超过100个科目
        };

        console.log("获取科目列表，参数:", subjectQuery);
        const result = await getSubjectList(subjectQuery);
        console.log("获取科目列表结果:", result);

        // 根据API返回格式调整数据结构
        if (
          result &&
          result.code === 200 &&
          result.data &&
          Array.isArray(result.data.records)
        ) {
          // 转换records数组为需要的格式，适配uni-data-select组件
          this.subjectList = result.data.records.map((subject) => ({
            value: subject.subjectId, // 使用subjectId作为value
            text: subject.subjectName, // 使用subjectName作为显示文本
          }));

          console.log("转换后的科目列表:", this.subjectList);
        } else {
          // 如果没有数据，提供默认学科选项
          this.subjectList = [
            { value: "1", text: "专业课" },
            { value: "2", text: "公共课" },
            { value: "3", text: "选修课" },
          ];
        }
      } catch (error) {
        console.error("获取学科列表失败", error);
        // 出错时提供默认选项
        this.subjectList = [
          { value: "1", text: "专业课" },
          { value: "2", text: "公共课" },
          { value: "3", text: "选修课" },
        ];
      } finally {
        this.subjectLoading = false;
      }
    },

    // 获取标签列表（支持分页和重置）
    async fetchTagList(reset = false) {
      try {
        // 如果是重置，则重置页码
        if (reset) {
          this.currentPage = 1;
          this.tagList = [];
          this.hasMoreTags = true;

          this.tagLoading = true;
        }

        // 构建分页参数
        const tagQuery = {
          currentPage: this.currentPage,
          pageSize: this.pageSize,
        };

        console.log("获取标签列表，分页参数:", tagQuery);
        const result = await getTagList(tagQuery);
        console.log("获取标签列表结果:", result);

        // 根据API返回格式调整数据结构
        if (result.code === 200) {
          // 转换records数组为需要的格式
          const newTags = result.data.records.map((tag) => ({
            id: tag.tagId, // 注意这里使用tagId而不是id
            tagName: tag.tagName,
          }));

          // 如果是重置则替换数据，否则追加数据
          if (reset) {
            this.tagList = newTags;
          } else {
            this.tagList = [...this.tagList, ...newTags];
          }

          // 判断是否还有更多数据
          const totalRecords = result.data.total || 0;
          this.hasMoreTags = this.tagList.length < totalRecords;

        } else {
          this.hasMoreTags = false;
        }
      } catch (error) {
        console.error("获取标签列表失败:", error);
        this.hasMoreTags = false;
      } finally {
        this.tagLoading = false;
      }
    },

    // 加载更多标签（无限滚动）
    async loadMoreTags() {
      // 如果没有更多数据或者正在加载中，则不重复加载
      if (!this.hasMoreTags || this.tagLoading) {
        return;
      }

      this.tagLoading = true;
      this.currentPage++;
      await this.fetchTagList(false); // 传递false表示追加数据
    },

    // 打开标签选择器
    openTagSelector() {
      this.$refs.showRight.open("right");
    },

    // 关闭标签选择器
    closeTagSelector() {
      this.$refs.showRight.close();
      // 更新任务的标签ID
      this.updateTaskTags();
    },

    // 切换标签选择状态
    toggleTag(tag) {
      const index = this.tags.findIndex((t) => t.id === tag.id);
      if (index > -1) {
        // 取消选择
        this.tags.splice(index, 1);
      } else {
        // 添加选择
        this.tags.push(tag);
      }
      console.log(this.tags);
    },

    // 移除单个标签
    removeTag(tagId) {
      const index = this.tags.findIndex((tag) => tag.id === tagId);
      if (index > -1) {
        this.tags.splice(index, 1);
      }
    },

    // 判断标签是否选中
    isTagSelected(tagId) {
      return this.tags.some((tag) => tag.id === tagId);
    },

    // 兼容旧的selectTag方法
    selectTag(tag) {
      // 如果已有标签，添加空格分隔
      if (this.task.tags) {
        this.task.tags += ",";
      }
      this.task.tags += tag;
    },
    // 处理截止日期变化
    onDeadlineChange(e) {
      this.task.deadline = e;
      console.log(e);
    },
    // 移除不再需要的确认和取消方法，内置API直接处理

    // onDateCancel 方法已移除，内置API会自动处理取消逻辑
    // 表单验证方法
    validateForm() {
      console.log(this.task);
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

      // 验证截止日期非空
      if (!this.task.deadline || !this.task.deadline.trim()) {
        uni.showToast({
          title: "请选择截止日期",
          icon: "none",
        });
        return false;
      }

      // 验证标签选择必选
      if (!this.task.tagId || this.task.tagId.trim() === "") {
        uni.showToast({
          title: "请至少选择一个标签",
          icon: "none",
        });
        return false;
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

    // onStartTimeConfirm、onEndTimeConfirm 和 onTimeCancel 方法已移除，内置API直接处理
    submitTask() {
      // 检查登录状态
      if (!this.checkLogin()) {
        return;
      }
      this.task.tagId = this.tags.map((tag) => tag.id).join(",");
      // 执行详细表单验证
      if (!this.validateForm()) {
        return;
      }
      console.log("更新后的task.tagId:", this.task.tagId);

      // 构建符合API要求的任务对象
      // 按照新的数据结构要求包含所有必要字段
      console.log(this.task);

      // 根据是否为编辑模式构建不同的任务数据
      const taskData = this.isEditMode
        ? {
            // 编辑模式下需要包含taskId
            taskId: parseInt(this.task.taskId),
            subjectId: this.task.subjectId ? parseInt(this.task.subjectId) : 0, // 转换为数字类型，默认0
            tagId: this.task.tagId || "", // 标签ID，逗号分隔的字符串
            taskName: this.task.title.trim(),
            description: this.task.description?.trim() || "", // 只使用原始描述，不添加补充信息
            // 确保日期格式兼容API（使用T分隔符）
            deadline: this.task.deadline
              .replace(/[\s\/]/, "T")
              .replace(/\/([0-9]{2})$/, "-$1"),
            priority: this.task.priority,
          }
        : {
            // 添加模式下的数据结构
            userId: parseInt(getUserId()) || 0, // 确保userId是数字类型，默认0
            subjectId: this.task.subjectId ? parseInt(this.task.subjectId) : 0, // 转换为数字类型，默认0
            tagId: this.task.tagId || "", // 标签ID，逗号分隔的字符串
            taskName: this.task.title.trim(),
            description: this.task.description?.trim() || "", // 只使用原始描述，不添加补充信息
            // 确保日期格式兼容API（使用T分隔符）
            deadline: this.task.deadline
              .replace(/[\s\/]/, "T")
              .replace(/\/([0-9]{2})$/, "-$1"),
            remindTime: "", // 暂不设置提醒时间，使用空字符串
            priority: this.task.priority,
          };

      // 输出日志以便调试
      console.log("提交的任务数据:", taskData);

      // 调用真实的API保存任务
      uni.showLoading({
        title: this.isEditMode ? "更新中..." : "创建中...",
      });

      // 根据模式调用不同的API
      const apiCall = this.isEditMode
        ? updateTask(taskData)
        : addTask(taskData);

      apiCall
        .then((res) => {
          uni.hideLoading();
          console.log("API响应:", res);

          if (res.code === 200) {
            // 根据模式显示不同的成功提示
            uni.showToast({
              title: this.isEditMode ? "任务更新成功" : "任务创建成功",
              icon: "success",
              duration: 1500,
              success: () => {
                // 延迟返回列表页，以便用户看到成功提示
                setTimeout(() => {
                  // 返回任务列表页
                  uni.reLaunch({
                    url: "/pages/tasks/tasks",
                  });
                }, 1500);
              },
            });
          } else {
            // 显示错误提示
            uni.showToast({
              title:
                res.msg || (this.isEditMode ? "更新任务失败" : "创建任务失败"),
              icon: "none",
              duration: 2500,
            });
          }
        })
        .catch((error) => {
          uni.hideLoading();
          console.error(
            this.isEditMode ? "更新任务失败:" : "创建任务失败:",
            error
          );

          // 显示错误提示
          uni.showToast({
            title:
              error.message ||
              (this.isEditMode ? "更新任务失败" : "创建任务失败"),
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
  background-color: #f8faff;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
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
      margin-bottom: 16rpx;

      .tag-item {
        padding: 8rpx 20rpx;
        background-color: #f0f0f0;
        border-radius: 20rpx;
        font-size: 24rpx;
        color: #666666;
        box-sizing: border-box;
        white-space: nowrap;
      }

      .selected-tag {
        background-color: #e6f4ff;
        color: #4a6cf7;
        display: flex;
        align-items: center;
      }

      .tag-close {
        margin-left: 10rpx;
        font-size: 30rpx;
        color: #999;
      }
    }

    .tag-add-container {
      margin-top: 16rpx;
    }

    .tag-add-btn {
      background-color: #f0f0f0;
      color: #666;
      padding: 10rpx 24rpx;
      border-radius: 16rpx;
      font-size: 26rpx;
      display: inline-block;
      border: 1rpx dashed #ccc;
    }

    .subject-selector {
      width: 100%;
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

/* 学科选择器样式 */
:deep(.uni-data-select) {
  width: 100%;
}

:deep(.uni-data-select__selector) {
  border-radius: 30rpx !important;
  border-color: #e6e6e6 !important;
  background-color: #fff !important;
  padding: 0 30rpx !important;
  height: 80rpx;
}

// 样式类，与add-note.vue保持一致
.section-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.subject-selector {
  margin-bottom: 32rpx;
}

.selected-subject-info {
  font-size: 24rpx;
  color: #666;
  margin-top: 12rpx;
  display: block;
}

.tags-section {
  margin-bottom: 32rpx;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 20rpx;
  background-color: #f0f0f0;
  border-radius: 30rpx;
  margin-right: 16rpx;
  margin-bottom: 16rpx;
  font-size: 28rpx;

  .tag-close {
    margin-left: 8rpx;
    color: #999;
    font-size: 32rpx;
    line-height: 1;
  }
}

.tag-add-btn {
  display: inline-block;
  padding: 8rpx 20rpx;
  border: 1px dashed #ccc;
  border-radius: 30rpx;
  color: #666;
  font-size: 28rpx;
  margin-bottom: 16rpx;
}

.tag-selector-content {
  height: 100%;
  display: flex;
  flex-direction: column;

  .tag-selector-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1px solid #eee;

    .tag-selector-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }

    .tag-selector-close {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      .close-icon {
        font-size: 40rpx;
        color: #999;
      }
    }
  }

  .tag-list {
    overflow-y: auto;
    padding: 30rpx;
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }

  .loading-more,
  .no-more-data {
    width: 100%;
    text-align: center;
    color: #999;
    font-size: 24rpx;
    padding: 20rpx 0;
  }
}
</style>
