"use strict";
const common_vendor = require("../../common/vendor.js");
const api_task = require("../../api/task.js");
const utils_storage = require("../../utils/storage.js");
const _sfc_main = {
  data() {
    const today = /* @__PURE__ */ new Date();
    const startDate = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDeadline = tomorrow.getFullYear() + "-" + String(tomorrow.getMonth() + 1).padStart(2, "0") + "-" + String(tomorrow.getDate()).padStart(2, "0") + " 18:00";
    return {
      task: {
        title: "",
        description: "",
        priority: "medium",
        // 默认中等优先级
        deadline: defaultDeadline,
        estimatedStartTime: "",
        estimatedEndTime: "",
        tags: "",
        course: ""
      },
      popularTags: ["作业", "复习", "预习", "实验", "报告", "论文", "考试"],
      startDate,
      isDatePickerVisible: false,
      isTimePickerVisible: false,
      currentPicker: "",
      // 开发测试模式
      defaultDeadline
    };
  },
  computed: {
    isFormValid() {
      return this.task.title.trim().length > 0 && this.task.title.trim().length <= 100;
    }
  },
  watch: {
    // 监听截止日期变化，检查是否选择了过去的日期
    "task.deadline"(newVal) {
      if (newVal) {
        const selectedDate = new Date(newVal);
        const now = /* @__PURE__ */ new Date();
        now.setHours(0, 0, 0, 0);
        if (selectedDate < now) {
          common_vendor.index.showToast({
            title: "截止日期不能早于今天",
            icon: "none",
            duration: 2e3
          });
        }
      }
    }
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    selectTag(tag) {
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
      if (!this.task.title.trim()) {
        common_vendor.index.showToast({
          title: "请输入任务标题",
          icon: "none"
        });
        return false;
      }
      if (this.task.title.trim().length > 100) {
        common_vendor.index.showToast({
          title: "任务标题不能超过100个字符",
          icon: "none"
        });
        return false;
      }
      if (this.task.description && this.task.description.length > 500) {
        common_vendor.index.showToast({
          title: "任务描述不能超过500个字符",
          icon: "none"
        });
        return false;
      }
      if (this.task.estimatedStartTime && this.task.estimatedEndTime) {
        const startTime = /* @__PURE__ */ new Date(
          `2000-01-01 ${this.task.estimatedStartTime}`
        );
        const endTime = /* @__PURE__ */ new Date(`2000-01-01 ${this.task.estimatedEndTime}`);
        if (startTime >= endTime) {
          common_vendor.index.showToast({
            title: "开始时间不能晚于结束时间",
            icon: "none"
          });
          return false;
        }
      }
      return true;
    },
    // 检查用户是否登录
    checkLogin() {
      const userId = utils_storage.getUserId();
      if (!userId) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先登录",
          showCancel: false,
          success: () => {
            common_vendor.index.navigateTo({
              url: "/pages/login/login"
            });
          }
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
      var _a, _b, _c;
      let fullDescription = ((_a = this.task.description) == null ? void 0 : _a.trim()) || "";
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
      if ((_b = this.task.tags) == null ? void 0 : _b.trim()) {
        additionalInfo.push(`标签: ${this.task.tags.trim()}`);
      }
      if ((_c = this.task.course) == null ? void 0 : _c.trim()) {
        additionalInfo.push(`课程/项目: ${this.task.course.trim()}`);
      }
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
      if (!this.checkLogin()) {
        return;
      }
      if (!this.validateForm()) {
        return;
      }
      common_vendor.index.__f__("log", "at pages/tasks/add-task.vue:362", this.task);
      const taskData = {
        userId: parseInt(utils_storage.getUserId()),
        // 确保userId是数字类型
        taskName: this.task.title.trim(),
        description: this.buildFullDescription(),
        // 合并原始描述和额外信息
        deadline: this.task.deadline.replace(" ", "T"),
        priority: this.task.priority
        // 注意：API接口目前不支持estimatedStartTime、estimatedEndTime、tags、course等字段
        // 这些信息已合并到description中
      };
      common_vendor.index.__f__("log", "at pages/tasks/add-task.vue:374", "提交的任务数据:", taskData);
      common_vendor.index.showLoading({
        title: "创建中..."
      });
      api_task.addTask(taskData).then((res) => {
        common_vendor.index.hideLoading();
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "任务创建成功",
            icon: "success"
          });
          common_vendor.index.navigateBack({
            delta: 1
          });
        }
      });
      api_task.addTask(taskData).then((res) => {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("log", "at pages/tasks/add-task.vue:403", "API响应:", res);
        if (res.code === 200) {
          common_vendor.index.navigateTo("/pages/tasks/tasks");
        } else {
          common_vendor.index.showToast({
            title: error.title,
            icon: "none",
            duration: 2500
          });
        }
      }).catch((error2) => {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/tasks/add-task.vue:420", "创建任务失败:", error2);
        common_vendor.index.showToast({
          title: error2,
          icon: "none",
          duration: 2500
        });
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_datetime_picker2 = common_vendor.resolveComponent("uni-datetime-picker");
  _easycom_uni_datetime_picker2();
}
const _easycom_uni_datetime_picker = () => "../../uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.js";
if (!Math) {
  _easycom_uni_datetime_picker();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: $data.task.title,
    c: common_vendor.o(($event) => $data.task.title = $event.detail.value),
    d: $data.task.description,
    e: common_vendor.o(($event) => $data.task.description = $event.detail.value),
    f: $data.task.priority === "高" ? 1 : "",
    g: common_vendor.o(($event) => $data.task.priority = "高"),
    h: $data.task.priority === "中" ? 1 : "",
    i: common_vendor.o(($event) => $data.task.priority = "中"),
    j: $data.task.priority === "低" ? 1 : "",
    k: common_vendor.o(($event) => $data.task.priority = "低"),
    l: common_vendor.o($options.onDeadlineChange),
    m: common_vendor.p({
      type: "datetime",
      value: $data.task.deadline,
      start: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      end: (/* @__PURE__ */ new Date()).getFullYear() + 3 + "-12-31",
      placeholder: "选择截止日期和时间",
      border: true
    }),
    n: common_vendor.o($options.onStartTimeChange),
    o: common_vendor.p({
      type: "time",
      value: $data.task.estimatedStartTime,
      placeholder: "选择开始时间",
      border: true
    }),
    p: common_vendor.o($options.onEndTimeChange),
    q: common_vendor.p({
      type: "time",
      value: $data.task.estimatedEndTime,
      placeholder: "选择结束时间",
      border: true
    }),
    r: $data.task.tags,
    s: common_vendor.o(($event) => $data.task.tags = $event.detail.value),
    t: common_vendor.f($data.popularTags, (tag, index, i0) => {
      return {
        a: common_vendor.t(tag),
        b: index,
        c: common_vendor.o(($event) => $options.selectTag(tag), index)
      };
    }),
    v: $data.task.course,
    w: common_vendor.o(($event) => $data.task.course = $event.detail.value),
    x: common_vendor.o((...args) => $options.submitTask && $options.submitTask(...args)),
    y: !$options.isFormValid
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-00aa9757"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/tasks/add-task.js.map
