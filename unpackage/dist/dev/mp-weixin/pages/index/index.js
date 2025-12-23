"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const api_task = require("../../api/task.js");
const utils_storage = require("../../utils/storage.js");
const _sfc_main = {
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
    };
  },
  onLoad() {
    common_vendor.index.__f__("log", "at pages/index/index.vue:109", "加载完成");
    this.loadUserInfo();
    this.fetchTasks();
  },
  methods: {
    // 加载用户信息
    loadUserInfo() {
      this.userInfo = utils_storage.getUserInfo();
      common_vendor.index.__f__("log", "at pages/index/index.vue:117", "userInfo", this.userInfo);
      if (!this.userInfo) {
        this.fetchUserInfo();
      } else {
        this.statistics.taskCount = this.todayTaskList.length + this.upcomingTaskList.length;
      }
    },
    // 获取任务数据
    async fetchTasks() {
      if (!this.userInfo)
        return;
      this.loading = true;
      try {
        const [todayRes, upcomingRes] = await Promise.all([
          api_task.getTodayTasks({ userId: this.userInfo.uid }),
          api_task.getUpcomingTasks({ userId: this.userInfo.uid })
        ]);
        if (todayRes.code === 200 && todayRes.data) {
          this.todayTaskList = (todayRes.data.records || []).map((task) => ({
            id: task.taskId,
            title: task.taskName || "未命名任务",
            time: this.formatTaskTime(task)
          }));
        }
        if (upcomingRes.code === 200 && upcomingRes.data) {
          this.upcomingTaskList = (upcomingRes.data.records || []).map((task) => ({
            id: task.taskId,
            title: task.taskName || "未命名任务",
            deadline: this.formatDeadline(task.deadline),
            priority: this.formatPriority(task.priority),
            priorityText: this.formatPriorityText(task.priority)
          }));
        }
        this.statistics.taskCount = this.todayTaskList.length;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:162", "获取任务数据失败:", error);
        this.useMockData();
      } finally {
        this.loading = false;
      }
    },
    // 格式化任务时间显示
    formatTaskTime(task) {
      if (!task.subjectName)
        return "";
      const today = /* @__PURE__ */ new Date();
      if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        const timeDiff = deadlineDate - today;
        if (timeDiff <= 0) {
          return `已过期`;
        }
        const hoursLeft = Math.ceil(timeDiff / (1e3 * 60 * 60));
        if (hoursLeft < 24) {
          return `${hoursLeft}小时`;
        } else if (hoursLeft < 24 * 7) {
          const daysLeft = Math.ceil(hoursLeft / 24);
          return `${daysLeft}天`;
        } else {
          const year = deadlineDate.getFullYear();
          const month = (deadlineDate.getMonth() + 1).toString().padStart(2, "0");
          const day = deadlineDate.getDate().toString().padStart(2, "0");
          return `${year}-${month}-${day}`;
        }
      }
      return task.subjectName;
    },
    // 格式化截止时间
    formatDeadline(deadline) {
      if (!deadline)
        return "无截止时间";
      const now = /* @__PURE__ */ new Date();
      const deadDate = new Date(deadline);
      const diffDays = Math.floor((deadDate - now) / (1e3 * 60 * 60 * 24));
      if (diffDays === 0) {
        return "今天截止";
      } else if (diffDays === 1) {
        return "明天截止";
      } else if (diffDays === 2) {
        return "后天截止";
      } else if (diffDays > 0) {
        return `${diffDays}天后截止`;
      } else {
        return "已逾期";
      }
    },
    // 格式化优先级
    formatPriority(priority) {
      switch (priority == null ? void 0 : priority.toLowerCase()) {
        case "high":
        case "高":
          return "high";
        case "medium":
        case "中":
          return "medium";
        case "low":
        case "低":
          return "low";
        default:
          return "low";
      }
    },
    // 格式化优先级文本
    formatPriorityText(priority) {
      switch (priority == null ? void 0 : priority.toLowerCase()) {
        case "high":
        case "高":
          return "高";
        case "medium":
        case "中":
          return "中";
        case "low":
        case "低":
          return "低";
        default:
          return "普通";
      }
    },
    // 使用模拟数据作为后备
    useMockData() {
      this.todayTaskList = [
        {
          id: 1,
          title: "完成数学作业第5章",
          time: "数学 11:00"
        },
        {
          id: 2,
          title: "复习英语单词本",
          time: "英语 14:00"
        },
        {
          id: 3,
          title: "背诵",
          time: "语文 16:00"
        }
      ];
      this.upcomingTaskList = [
        {
          id: 4,
          title: "提交课程论文",
          deadline: "明天截止",
          priority: "high",
          priorityText: "高"
        },
        {
          id: 5,
          title: "历史",
          deadline: "后天截止",
          priority: "medium",
          priorityText: "中"
        },
        {
          id: 6,
          title: "编程项目一阶提交",
          deadline: "后天截止",
          priority: "low",
          priorityText: "低"
        }
      ];
    },
    // 从服务器获取用户信息
    async fetchUserInfo() {
      try {
        const res = await api_index.userAPI.getUserInfo();
        this.userInfo = res.data;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:315", "获取用户信息失败:", error);
      }
    },
    // 退出登录
    async logout() {
      common_vendor.index.showModal({
        title: "退出登录",
        content: "确定要退出登录吗？",
        confirmText: "确定",
        cancelText: "取消",
        success: async (res) => {
          if (res.confirm) {
            try {
              await api_index.userAPI.logout();
              utils_storage.clearUserData();
              common_vendor.index.reLaunch({
                url: "/pages/login/login"
              });
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/index/index.vue:338", "退出登录失败:", error);
              utils_storage.clearUserData();
              common_vendor.index.reLaunch({
                url: "/pages/login/login"
              });
            }
          }
        }
      });
    },
    viewAllTasks(type) {
      common_vendor.index.showToast({
        title: `查看全部${type === "today" ? "今日" : "即将截止"}任务`,
        icon: "none"
      });
    },
    handleTaskComplete(task) {
      common_vendor.index.showToast({
        title: "任务已完成",
        icon: "success"
      });
      const todayIndex = this.todayTaskList.findIndex((t) => t.id === task.id);
      if (todayIndex !== -1) {
        this.todayTaskList.splice(todayIndex, 1);
      }
      const upcomingIndex = this.upcomingTaskList.findIndex((t) => t.id === task.id);
      if (upcomingIndex !== -1) {
        this.upcomingTaskList.splice(upcomingIndex, 1);
      }
      this.statistics.taskCount = this.todayTaskList.length;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a, _b;
  return common_vendor.e({
    a: common_vendor.t($data.userInfo ? ((_b = (_a = $data.userInfo.username) == null ? void 0 : _a[0]) == null ? void 0 : _b.toUpperCase()) || "U" : "U"),
    b: common_vendor.t($data.userInfo ? $data.userInfo.username || "游客" : "游客"),
    c: common_vendor.o((...args) => $options.logout && $options.logout(...args)),
    d: common_vendor.t($data.statistics.taskCount),
    e: common_vendor.t($data.statistics.noteCount),
    f: common_vendor.t($data.statistics.learningStreak),
    g: $data.loading
  }, $data.loading ? {} : {}, {
    h: common_vendor.o(($event) => $options.viewAllTasks("today")),
    i: $data.todayTaskList.length > 0
  }, $data.todayTaskList.length > 0 ? {
    j: common_vendor.f($data.todayTaskList, (task, index, i0) => {
      return {
        a: common_vendor.o(($event) => $options.handleTaskComplete(task), index),
        b: common_vendor.t(task.title),
        c: common_vendor.t(task.time),
        d: index
      };
    })
  } : {}, {
    k: common_vendor.o(($event) => $options.viewAllTasks("upcoming")),
    l: $data.upcomingTaskList.length > 0
  }, $data.upcomingTaskList.length > 0 ? {
    m: common_vendor.f($data.upcomingTaskList, (task, index, i0) => {
      return {
        a: common_vendor.o(($event) => $options.handleTaskComplete(task), index),
        b: common_vendor.t(task.title),
        c: common_vendor.t(task.deadline),
        d: common_vendor.t(task.priorityText),
        e: common_vendor.n(task.priority),
        f: index
      };
    })
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
