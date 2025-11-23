"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const utils_storage = require("../../utils/storage.js");
const _sfc_main = {
  data() {
    return {
      userInfo: null,
      todayTaskList: [
        {
          title: "完成数学作业第5章",
          time: "数学 11:00"
        },
        {
          title: "复习英语单词本",
          time: "英语 14:00"
        },
        {
          title: "背诵",
          time: "语文 16:00"
        }
      ],
      upcomingTaskList: [
        {
          title: "提交课程论文",
          deadline: "明天截止",
          priority: "high",
          priorityText: "论文"
        },
        {
          title: "历史",
          deadline: "后天截止",
          priority: "medium",
          priorityText: "作业"
        },
        {
          title: "编程项目一阶提交",
          deadline: "后天截止",
          priority: "low",
          priorityText: "计划中"
        }
      ]
    };
  },
  onLoad() {
    this.loadUserInfo();
  },
  methods: {
    // 加载用户信息
    loadUserInfo() {
      this.userInfo = utils_storage.getUserInfo();
      common_vendor.index.__f__("log", "at pages/index/index.vue:121", "userInfo", this.userInfo);
      if (!this.userInfo) {
        this.fetchUserInfo();
      }
    },
    // 从服务器获取用户信息
    async fetchUserInfo() {
      try {
        const res = await api_index.userAPI.getUserInfo();
        this.userInfo = res.data;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:134", "获取用户信息失败:", error);
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
              common_vendor.index.__f__("error", "at pages/index/index.vue:157", "退出登录失败:", error);
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
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _a, _b;
  return {
    a: common_vendor.t($data.userInfo ? ((_b = (_a = $data.userInfo.username) == null ? void 0 : _a[0]) == null ? void 0 : _b.toUpperCase()) || "U" : "U"),
    b: common_vendor.t($data.userInfo ? $data.userInfo.username || "游客" : "游客"),
    c: common_vendor.o((...args) => $options.logout && $options.logout(...args)),
    d: common_vendor.o(($event) => $options.viewAllTasks("today")),
    e: common_vendor.f($data.todayTaskList, (task, index, i0) => {
      return {
        a: common_vendor.t(task.title),
        b: common_vendor.t(task.time),
        c: index
      };
    }),
    f: common_vendor.o(($event) => $options.viewAllTasks("upcoming")),
    g: common_vendor.f($data.upcomingTaskList, (task, index, i0) => {
      return {
        a: common_vendor.t(task.title),
        b: common_vendor.t(task.deadline),
        c: common_vendor.t(task.priorityText),
        d: common_vendor.n(task.priority),
        e: index
      };
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
