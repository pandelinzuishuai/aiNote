"use strict";
const common_vendor = require("../../common/vendor.js");
const api_task = require("../../api/task.js");
const utils_storage = require("../../utils/storage.js");
const _sfc_main = {
  data() {
    return {
      activeTab: "all",
      triggered: false,
      currentSortIndex: 0,
      sortOptions: ["按优先级排序", "按截止时间排序", "按创建时间排序"],
      tasks: [],
      // 初始化为空数组，从服务器获取数据
      loading: false,
      // 添加加载状态
      total: 0,
      // 总任务数
      currentPage: 1,
      // 当前页码
      pageSize: 20
      // 每页大小
    };
  },
  onLoad() {
    this.fetchTasksList();
  },
  methods: {
    // 获取任务列表的方法
    async fetchTasksList() {
      try {
        this.loading = true;
        const query = {
          currentPage: this.currentPage,
          pageSize: this.pageSize,
          status: this.activeTab === "all" ? "" : this.activeTab,
          userId: utils_storage.getUserId()
          // 添加userId参数
        };
        const res = await api_task.getTaskList(query);
        if (res && res.data) {
          this.tasks = res.data.records || [];
          this.total = res.data.total || 0;
        } else {
          this.tasks = [];
          this.total = 0;
          common_vendor.index.__f__("warn", "at pages/tasks/tasks.vue:192", "响应数据结构不符合预期:", res);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/tasks/tasks.vue:195", "获取任务列表失败:", error);
        this.tasks = [];
        this.total = 0;
        common_vendor.index.showToast({
          title: "获取任务列表失败，请稍后重试",
          icon: "none",
          duration: 2e3
        });
      } finally {
        this.loading = false;
      }
    },
    handleSortChange(e) {
      this.currentSortIndex = e.detail.value;
      this.sortTasks();
    },
    // 前端排序方法
    sortTasks() {
      const sortedTasks = [...this.tasks];
      switch (this.currentSortIndex) {
        case 0:
          sortedTasks.sort((a, b) => {
            const priorityOrder = { 高: 0, 中: 1, 低: 2 };
            return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
          });
          break;
        case 1:
          sortedTasks.sort((a, b) => {
            return new Date(a.deadline || 0) - new Date(b.deadline || 0);
          });
          break;
        case 2:
          sortedTasks.sort((a, b) => {
            return new Date(b.createTime || 0) - new Date(a.createTime || 0);
          });
          break;
      }
      this.tasks = sortedTasks;
    },
    // 切换标签页的方法
    changeTab(tab) {
      this.activeTab = tab;
      this.fetchTasksList();
    },
    // 更新任务状态的方法
    async updateTaskStatus(task, status) {
      try {
        if (event)
          event.stopPropagation();
        common_vendor.index.showLoading({
          title: "更新中..."
        });
        await api_task.updateTaskStatus(task.id, status);
        const taskIndex = this.tasks.findIndex((t) => t.id === task.id);
        if (taskIndex !== -1) {
          this.$set(this.tasks[taskIndex], "status", status);
          if (status === "completed") {
            this.$set(
              this.tasks[taskIndex],
              "completedTime",
              (/* @__PURE__ */ new Date()).toISOString()
            );
          }
        }
        common_vendor.index.showToast({
          title: "任务状态已更新",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/tasks/tasks.vue:286", "更新任务状态失败:", error);
        common_vendor.index.showToast({
          title: "更新任务状态失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    getTaskPriorityClass(priority) {
      return {
        "high-priority": priority === "高",
        "medium-priority": priority === "中",
        "low-priority": priority === "低"
      };
    },
    getPriorityText(priority) {
      const texts = {
        high: "高优先级",
        medium: "普通优先级",
        low: "普通优先级"
      };
      return texts[priority] || "";
    },
    getPriorityLabel(priority) {
      const labels = {
        high: "高优先级",
        medium: "中等优先级",
        low: "低优先级"
      };
      return labels[priority] || "";
    },
    navigateToAddTask() {
      common_vendor.index.navigateTo({
        url: "/pages/tasks/add-task"
      });
    },
    toTaskDetail(task) {
      common_vendor.index.navigateTo({
        url: "/pages/tasks/task-detail?id=" + task.taskId
      });
    },
    // 格式化时间的方法
    formatTime(time) {
      if (!time)
        return "暂无截止时间";
      try {
        const date = new Date(time);
        const now = /* @__PURE__ */ new Date();
        const diffTime = Math.abs(date - now);
        const diffDays = Math.floor(diffTime / (1e3 * 60 * 60 * 24));
        if (diffDays === 0) {
          return "今天 " + date.getHours().toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0");
        } else if (diffDays === 1) {
          return "明天 " + date.getHours().toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0");
        } else if (diffDays < 7) {
          return diffDays + "天后";
        } else {
          return date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, "0") + "-" + date.getDate().toString().padStart(2, "0");
        }
      } catch (error) {
        return time;
      }
    },
    // 下拉刷新相关方法
    onPulling() {
      var that = this;
      if (!this.triggered) {
        this.triggered = true;
        setTimeout(() => {
          that.triggered = false;
        }, 1e3);
      }
    },
    onRefresh() {
      this.currentPage = 1;
      this.fetchTasksList().then(() => {
        common_vendor.index.stopPullDownRefresh();
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.activeTab === "all" ? 1 : "",
    b: common_vendor.o(($event) => $options.changeTab("all")),
    c: $data.activeTab === "pending" ? 1 : "",
    d: common_vendor.o(($event) => $options.changeTab("pending")),
    e: $data.activeTab === "in_progress" ? 1 : "",
    f: common_vendor.o(($event) => $options.changeTab("in_progress")),
    g: $data.activeTab === "completed" ? 1 : "",
    h: common_vendor.o(($event) => $options.changeTab("completed")),
    i: $data.activeTab === "overdue" ? 1 : "",
    j: common_vendor.o(($event) => $options.changeTab("overdue")),
    k: common_vendor.t($data.sortOptions[$data.currentSortIndex]),
    l: $data.sortOptions,
    m: $data.currentSortIndex,
    n: common_vendor.o((...args) => $options.handleSortChange && $options.handleSortChange(...args)),
    o: $data.loading
  }, $data.loading ? {} : $data.tasks.length > 0 ? {
    q: common_vendor.f($data.tasks, (task, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t($options.getPriorityText(task.priority)),
        b: common_vendor.n(task.priority),
        c: common_vendor.t($options.formatTime(task.deadline)),
        d: common_vendor.t(task.taskName || "无标题任务"),
        e: common_vendor.t(task.description || "无任务描述"),
        f: common_vendor.t(task.subjectName || "通用课程"),
        g: common_vendor.n(task.priority),
        h: common_vendor.t($options.getPriorityLabel(task.priority)),
        i: task.hasAttachment
      }, task.hasAttachment ? {} : {}, {
        j: task.status === "未完成" ? 1 : "",
        k: common_vendor.o(($event) => $options.updateTaskStatus(task, "pending"), task.id),
        l: task.status === "已完成" ? 1 : "",
        m: common_vendor.o(($event) => $options.updateTaskStatus(task, "completed"), task.id),
        n: task.id,
        o: common_vendor.n($options.getTaskPriorityClass(task.priority)),
        p: common_vendor.o(($event) => $options.toTaskDetail(task), task.id)
      });
    })
  } : {}, {
    p: $data.tasks.length > 0,
    r: $data.triggered,
    s: common_vendor.o((...args) => $options.onPulling && $options.onPulling(...args)),
    t: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args)),
    v: common_vendor.o((...args) => $options.navigateToAddTask && $options.navigateToAddTask(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-027feebf"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/tasks/tasks.js.map
