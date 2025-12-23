"use strict";
const common_vendor = require("../../common/vendor.js");
const api_task = require("../../api/task.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      task: {
        taskId: "",
        userId: "",
        subjectId: "",
        subjectName: "",
        taskName: "",
        deadline: "",
        description: "",
        priority: "中",
        // 高、中、低
        status: "待处理",
        // 待处理、进行中、已完成
        createTime: "",
        finishTime: "",
        tagId: "",
        tagNames: ""
      },
      isLoading: true,
      errorMsg: "",
      refreshing: false
      // 添加下拉刷新状态
    };
  },
  onLoad(options) {
    if (options.id) {
      this.task.taskId = options.id;
      this.loadTaskData();
    } else {
      this.isLoading = false;
      this.errorMsg = "任务ID不存在";
    }
  },
  computed: {
    // 计算是否过期
    isOverdue() {
      if (!this.task.deadline || this.task.status === "已完成")
        return false;
      const now = /* @__PURE__ */ new Date();
      const dueTime = new Date(this.task.deadline);
      return now > dueTime;
    },
    // 计算剩余天数
    daysRemaining() {
      if (!this.task.deadline || this.task.status === "已完成")
        return "";
      const now = /* @__PURE__ */ new Date();
      const dueTime = new Date(this.task.deadline);
      const diffTime = dueTime - now;
      const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
      if (diffDays < 0)
        return "已过期";
      if (diffDays === 0)
        return "今天到期";
      if (diffDays === 1)
        return "明天到期";
      return `${diffDays}天后到期`;
    },
    // 添加loading和error计算属性用于模板
    loading() {
      return this.isLoading;
    },
    error() {
      return this.errorMsg;
    }
  },
  methods: {
    // 显示删除确认对话框
    showDeleteConfirm() {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除此任务吗？此操作不可撤销。",
        cancelText: "取消",
        confirmText: "删除",
        confirmColor: "#ff4d4f",
        success: (res) => {
          if (res.confirm) {
            this.deleteTask();
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/tasks/task-detail.vue:249", "删除确认对话框失败:", err);
        }
      });
    },
    // 加载任务数据
    async loadTaskData() {
      try {
        this.isLoading = true;
        this.errorMsg = "";
        if (!this.task.taskId) {
          throw new Error("任务ID不存在");
        }
        const response = await api_task.getTaskInfo(this.task.taskId);
        if (response && response.code === 200 && response.data) {
          this.task = this.normalizeTaskData(response.data);
        } else {
          throw new Error((response == null ? void 0 : response.msg) || "获取任务详情失败");
        }
        this.isLoading = false;
        this.refreshing = false;
      } catch (error) {
        this.isLoading = false;
        this.refreshing = false;
        this.errorMsg = error.message || "加载任务失败，请重试";
        common_vendor.index.__f__("error", "at pages/tasks/task-detail.vue:282", "Failed to load task:", error);
        if (!this.task.taskId) {
          this.task = this.normalizeTaskData({});
        }
      }
    },
    // 数据标准化处理
    normalizeTaskData(data) {
      return {
        taskId: data.taskId || "",
        userId: data.userId || "",
        subjectId: data.subjectId || "",
        subjectName: data.subjectName || "",
        taskName: data.taskName || "无标题任务",
        deadline: data.deadline || "",
        description: data.description || "暂无描述",
        priority: data.priority || "中",
        status: data.status || "待处理",
        createTime: data.createTime || "",
        finishTime: data.finishTime || "",
        tagId: data.tagId || "",
        tagNames: data.tagNames || ""
      };
    },
    // 获取标签列表
    getTagList() {
      if (this.task.tagNames) {
        return typeof this.task.tagNames === "string" ? this.task.tagNames.split(",") : Array.isArray(this.task.tagNames) ? this.task.tagNames : [];
      }
      return [];
    },
    // 映射中文状态到英文
    mapStatusToEnglish(status) {
      const statusMap = {
        已完成: "completed",
        进行中: "in-progress",
        待处理: "pending"
      };
      return statusMap[status] || status;
    },
    // 更新任务状态
    async updateTaskStatus(newStatus) {
      try {
        common_vendor.index.showLoading({
          title: "更新中...",
          mask: true
        });
        if (!this.task.taskId) {
          throw new Error("任务ID不存在");
        }
        const response = await api_task.updateTaskStatus(this.task.taskId, newStatus);
        if (response && response.code === 200) {
          this.task.status = newStatus;
          if (newStatus === "已完成") {
            this.task.finishTime = (/* @__PURE__ */ new Date()).toISOString();
          } else {
            this.task.finishTime = "";
          }
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: newStatus === "已完成" ? "任务已完成" : "任务已重新开始",
            icon: "success"
          });
        } else {
          throw new Error((response == null ? void 0 : response.msg) || "状态更新失败");
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: error.message || "状态更新失败，请重试",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/tasks/task-detail.vue:372", "Failed to update task status:", error);
      }
    },
    // 下拉刷新处理
    onRefresh() {
      if (this.refreshing)
        return;
      this.refreshing = true;
      this.loadTaskData();
    },
    // 编辑任务
    editTask() {
      try {
        common_vendor.index.navigateTo({
          url: `/pages/tasks/add-task?id=${this.task.taskId}&edit=true`,
          success: () => {
            common_vendor.index.__f__("log", "at pages/tasks/task-detail.vue:392", "Navigate to edit task page");
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/tasks/task-detail.vue:395", "Failed to navigate:", err);
            common_vendor.index.showToast({
              title: "页面跳转失败",
              icon: "none"
            });
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/tasks/task-detail.vue:403", "Navigation error:", error);
        common_vendor.index.showToast({
          title: "操作失败，请重试",
          icon: "none"
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
        common_vendor.index.showLoading({
          title: "删除中...",
          mask: true
        });
        if (!this.task.taskId) {
          throw new Error("任务ID不存在");
        }
        const response = await api_task.deleteTask(this.task.taskId);
        if (response && response.code === 200) {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "任务删除成功",
            icon: "success",
            duration: 1500,
            success: () => {
              common_vendor.index.reLaunch({
                url: "/pages/tasks/tasks"
              });
            }
          });
        } else {
          throw new Error((response == null ? void 0 : response.msg) || "删除任务失败");
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: error.message || "删除失败，请重试",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/tasks/task-detail.vue:458", "删除任务失败:", error);
      }
    },
    // 格式化时间显示
    formatTime(timeStr) {
      if (!timeStr)
        return "--";
      try {
        const date = new Date(timeStr);
        if (isNaN(date.getTime()))
          return "--";
        const now = /* @__PURE__ */ new Date();
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
        const diffDays = Math.floor((taskDate - today) / (1e3 * 60 * 60 * 24));
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const time = `${hours}:${minutes}`;
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
        common_vendor.index.__f__("error", "at pages/tasks/task-detail.vue:506", "Time format error:", error);
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
    }
  },
  // 监听页面显示，可用于刷新数据
  onShow() {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    if (currentPage.needRefresh) {
      currentPage.needRefresh = false;
      this.loadTaskData();
    }
  },
  // 监听页面隐藏
  onHide() {
  }
};
if (!Array) {
  const _easycom_uni_tag2 = common_vendor.resolveComponent("uni-tag");
  _easycom_uni_tag2();
}
const _easycom_uni_tag = () => "../../uni_modules/uni-tag/components/uni-tag/uni-tag.js";
if (!Math) {
  _easycom_uni_tag();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $options.loading
  }, $options.loading ? {} : $options.error ? {
    c: common_assets._imports_0$2,
    d: common_vendor.t($options.error),
    e: common_vendor.o((...args) => $options.reloadTask && $options.reloadTask(...args))
  } : common_vendor.e({
    f: common_vendor.t($data.task.taskName || "无标题任务"),
    g: common_vendor.t($data.task.status || "未开始"),
    h: common_vendor.n($options.mapStatusToEnglish($data.task.status)),
    i: common_vendor.t($data.task.description || "暂无描述"),
    j: common_assets._imports_1,
    k: common_vendor.t($data.task.priority || "中"),
    l: common_vendor.n(`priority-${$options.getPriorityLevel($data.task.priority)}`),
    m: common_assets._imports_2,
    n: common_vendor.t($data.task.deadline.replace("T", " ") || "未设置"),
    o: $options.isOverdue && $data.task.status !== "已完成" ? 1 : "",
    p: $options.daysRemaining
  }, $options.daysRemaining ? {
    q: common_vendor.t($options.daysRemaining),
    r: $options.isOverdue ? 1 : ""
  } : {}, {
    s: common_assets._imports_2,
    t: common_vendor.t($data.task.createTime.replace("T", " ")),
    v: $data.task.status === "已完成"
  }, $data.task.status === "已完成" ? {
    w: common_assets._imports_2,
    x: common_vendor.t($data.task.finishTime.replace("T", " "))
  } : {}, {
    y: common_assets._imports_3,
    z: common_vendor.t($data.task.subjectName || ($data.task.subjectId ? "未命名学科" : "未分配")),
    A: $data.task.tagNames || $data.task.tagId
  }, $data.task.tagNames || $data.task.tagId ? {
    B: common_assets._imports_3,
    C: common_vendor.f($options.getTagList(), (tag, index, i0) => {
      return {
        a: index,
        b: "ea666fbd-0-" + i0,
        c: common_vendor.p({
          circle: true,
          customStyle: "background-color: #e6eaff;color:#4A6CF7;border:none",
          text: tag,
          type: "primary"
        })
      };
    })
  } : {}, {
    D: $data.task.status !== "已完成"
  }, $data.task.status !== "已完成" ? {
    E: common_vendor.o(($event) => $options.updateTaskStatus("已完成"))
  } : {
    F: common_vendor.o(($event) => $options.updateTaskStatus("未完成"))
  }, {
    G: common_vendor.o((...args) => $options.editTask && $options.editTask(...args)),
    H: common_vendor.o((...args) => $options.showDeleteConfirm && $options.showDeleteConfirm(...args)),
    I: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args))
  }), {
    b: $options.error
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-ea666fbd"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/tasks/task-detail.js.map
