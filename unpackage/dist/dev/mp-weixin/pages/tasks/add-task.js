"use strict";
const common_vendor = require("../../common/vendor.js");
const api_task = require("../../api/task.js");
const utils_storage = require("../../utils/storage.js");
const api_subject = require("../../api/subject.js");
const api_tag = require("../../api/tag.js");
const _sfc_main = {
  data() {
    const today = /* @__PURE__ */ new Date();
    const startDate = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      task: {
        taskId: "",
        // 任务ID，用于编辑模式
        title: "",
        description: "",
        priority: "中",
        // 默认中等优先级
        deadline: "",
        remindTime: "",
        // 提醒时间，暂不使用
        tagId: "",
        // 标签ID，逗号分隔的字符串
        subjectId: "",
        // 学科ID
        subjectName: ""
        // 学科名称
      },
      isEditMode: false,
      // 是否为编辑模式
      tags: [],
      // 已选标签
      popularTags: ["作业", "复习", "预习", "实验", "报告", "论文", "考试"],
      startDate,
      isDatePickerVisible: false,
      isTimePickerVisible: false,
      currentPicker: "",
      // 学科选择相关
      subjectList: [],
      subjectLoading: false,
      // 标签选择相关
      tagList: [],
      tagLoading: false,
      currentPage: 1,
      // 分页相关参数
      pageSize: 20,
      // 每页加载的标签数量
      hasMoreTags: true
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
        const cleanedDate = newVal.replace(" ", "T");
        const selectedDate = new Date(cleanedDate);
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
  onLoad(options) {
    if (options && options.taskId) {
      this.isEditMode = true;
      this.task.taskId = options.taskId;
      common_vendor.index.setNavigationBarTitle({
        title: "编辑任务"
      });
    } else {
      common_vendor.index.setNavigationBarTitle({
        title: "创建任务"
      });
    }
    this.fetchSubjectList();
    this.fetchTagList(true);
    if (this.isEditMode) {
      this.loadTaskDetail();
    } else if (options && options.id && options.edit === "true") {
      this.isEditMode = true;
      this.task.taskId = options.id;
      common_vendor.index.setNavigationBarTitle({
        title: "编辑任务"
      });
      this.loadTaskDetail();
    }
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    // 加载任务详情
    async loadTaskDetail() {
      if (!this.task.taskId) {
        common_vendor.index.__f__("error", "at pages/tasks/add-task.vue:287", "任务ID不存在");
        return;
      }
      try {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        const response = await api_task.getTaskInfo(this.task.taskId);
        common_vendor.index.__f__("log", "at pages/tasks/add-task.vue:297", "任务详情:", response);
        if (response && response.code === 200 && response.data) {
          const taskData = response.data;
          this.task.title = taskData.taskName || "";
          this.task.description = taskData.description || "";
          this.task.priority = taskData.priority || "中";
          if (taskData.deadline) {
            this.task.deadline = taskData.deadline.replace("T", " ");
            common_vendor.index.__f__("log", "at pages/tasks/add-task.vue:312", "格式化后的截止日期:", this.task.deadline);
          } else {
            this.task.deadline = "";
          }
          this.task.subjectId = taskData.subjectId;
          this.task.subjectName = taskData.subjectName || "";
          if (taskData.tagId) {
            this.task.tagId = taskData.tagId;
            const tagIds = taskData.tagId.split(",");
            this.tags = [];
            common_vendor.index.__f__("log", "at pages/tasks/add-task.vue:328", "标签ID列表:", tagIds);
            common_vendor.index.__f__("log", "at pages/tasks/add-task.vue:329", "可用标签列表:", this.tagList);
            tagIds.forEach((tagId) => {
              const tag = this.tagList.find(
                (t) => String(t.id) === String(tagId)
              );
              if (tag) {
                this.tags.push(tag);
                common_vendor.index.__f__("log", "at pages/tasks/add-task.vue:339", "找到并添加标签:", tag.tagName);
              } else {
                common_vendor.index.__f__("log", "at pages/tasks/add-task.vue:341", "未找到标签:", tagId);
                this.tags.push({ id: tagId, tagName: "标签" + tagId });
              }
            });
          } else {
            this.task.tagId = "";
            this.tags = [];
          }
        } else {
          common_vendor.index.showToast({
            title: (response == null ? void 0 : response.msg) || "加载任务详情失败",
            icon: "none"
          });
        }
        common_vendor.index.__f__("log", "at pages/tasks/add-task.vue:356", this.task);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/tasks/add-task.vue:358", "加载任务详情异常:", error);
        common_vendor.index.showToast({
          title: "加载任务详情异常，请重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
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
        const subjectQuery = {
          currentPage: 1,
          pageSize: 100
          // 假设不会有超过100个科目
        };
        common_vendor.index.__f__("log", "at pages/tasks/add-task.vue:387", "获取科目列表，参数:", subjectQuery);
        const result = await api_subject.getSubjectList(subjectQuery);
        common_vendor.index.__f__("log", "at pages/tasks/add-task.vue:389", "获取科目列表结果:", result);
        if (result && result.code === 200 && result.data && Array.isArray(result.data.records)) {
          this.subjectList = result.data.records.map((subject) => ({
            value: subject.subjectId,
            // 使用subjectId作为value
            text: subject.subjectName
            // 使用subjectName作为显示文本
          }));
          common_vendor.index.__f__("log", "at pages/tasks/add-task.vue:404", "转换后的科目列表:", this.subjectList);
        } else {
          this.subjectList = [
            { value: "1", text: "专业课" },
            { value: "2", text: "公共课" },
            { value: "3", text: "选修课" }
          ];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/tasks/add-task.vue:414", "获取学科列表失败", error);
        this.subjectList = [
          { value: "1", text: "专业课" },
          { value: "2", text: "公共课" },
          { value: "3", text: "选修课" }
        ];
      } finally {
        this.subjectLoading = false;
      }
    },
    // 获取标签列表（支持分页和重置）
    async fetchTagList(reset = false) {
      try {
        if (reset) {
          this.currentPage = 1;
          this.tagList = [];
          this.hasMoreTags = true;
          this.tagLoading = true;
        }
        const tagQuery = {
          currentPage: this.currentPage,
          pageSize: this.pageSize
        };
        common_vendor.index.__f__("log", "at pages/tasks/add-task.vue:444", "获取标签列表，分页参数:", tagQuery);
        const result = await api_tag.getTagList(tagQuery);
        common_vendor.index.__f__("log", "at pages/tasks/add-task.vue:446", "获取标签列表结果:", result);
        if (result.code === 200) {
          const newTags = result.data.records.map((tag) => ({
            id: tag.tagId,
            // 注意这里使用tagId而不是id
            tagName: tag.tagName
          }));
          if (reset) {
            this.tagList = newTags;
          } else {
            this.tagList = [...this.tagList, ...newTags];
          }
          const totalRecords = result.data.total || 0;
          this.hasMoreTags = this.tagList.length < totalRecords;
        } else {
          this.hasMoreTags = false;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/tasks/add-task.vue:471", "获取标签列表失败:", error);
        this.hasMoreTags = false;
      } finally {
        this.tagLoading = false;
      }
    },
    // 加载更多标签（无限滚动）
    async loadMoreTags() {
      if (!this.hasMoreTags || this.tagLoading) {
        return;
      }
      this.tagLoading = true;
      this.currentPage++;
      await this.fetchTagList(false);
    },
    // 打开标签选择器
    openTagSelector() {
      this.$refs.showRight.open("right");
    },
    // 关闭标签选择器
    closeTagSelector() {
      this.$refs.showRight.close();
      this.updateTaskTags();
    },
    // 切换标签选择状态
    toggleTag(tag) {
      const index = this.tags.findIndex((t) => t.id === tag.id);
      if (index > -1) {
        this.tags.splice(index, 1);
      } else {
        this.tags.push(tag);
      }
      common_vendor.index.__f__("log", "at pages/tasks/add-task.vue:512", this.tags);
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
      if (this.task.tags) {
        this.task.tags += ",";
      }
      this.task.tags += tag;
    },
    // 处理截止日期变化
    onDeadlineChange(e) {
      this.task.deadline = e;
      common_vendor.index.__f__("log", "at pages/tasks/add-task.vue:539", e);
    },
    // 移除不再需要的确认和取消方法，内置API直接处理
    // onDateCancel 方法已移除，内置API会自动处理取消逻辑
    // 表单验证方法
    validateForm() {
      common_vendor.index.__f__("log", "at pages/tasks/add-task.vue:546", this.task);
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
      if (!this.task.deadline || !this.task.deadline.trim()) {
        common_vendor.index.showToast({
          title: "请选择截止日期",
          icon: "none"
        });
        return false;
      }
      if (!this.task.tagId || this.task.tagId.trim() === "") {
        common_vendor.index.showToast({
          title: "请至少选择一个标签",
          icon: "none"
        });
        return false;
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
    // onStartTimeConfirm、onEndTimeConfirm 和 onTimeCancel 方法已移除，内置API直接处理
    submitTask() {
      var _a, _b;
      if (!this.checkLogin()) {
        return;
      }
      this.task.tagId = this.tags.map((tag) => tag.id).join(",");
      if (!this.validateForm()) {
        return;
      }
      common_vendor.index.__f__("log", "at pages/tasks/add-task.vue:623", "更新后的task.tagId:", this.task.tagId);
      common_vendor.index.__f__("log", "at pages/tasks/add-task.vue:627", this.task);
      const taskData = this.isEditMode ? {
        // 编辑模式下需要包含taskId
        taskId: parseInt(this.task.taskId),
        subjectId: this.task.subjectId ? parseInt(this.task.subjectId) : 0,
        // 转换为数字类型，默认0
        tagId: this.task.tagId || "",
        // 标签ID，逗号分隔的字符串
        taskName: this.task.title.trim(),
        description: ((_a = this.task.description) == null ? void 0 : _a.trim()) || "",
        // 只使用原始描述，不添加补充信息
        // 确保日期格式兼容API（使用T分隔符）
        deadline: this.task.deadline.replace(/[\s\/]/, "T").replace(/\/([0-9]{2})$/, "-$1"),
        priority: this.task.priority
      } : {
        // 添加模式下的数据结构
        userId: parseInt(utils_storage.getUserId()) || 0,
        // 确保userId是数字类型，默认0
        subjectId: this.task.subjectId ? parseInt(this.task.subjectId) : 0,
        // 转换为数字类型，默认0
        tagId: this.task.tagId || "",
        // 标签ID，逗号分隔的字符串
        taskName: this.task.title.trim(),
        description: ((_b = this.task.description) == null ? void 0 : _b.trim()) || "",
        // 只使用原始描述，不添加补充信息
        // 确保日期格式兼容API（使用T分隔符）
        deadline: this.task.deadline.replace(/[\s\/]/, "T").replace(/\/([0-9]{2})$/, "-$1"),
        remindTime: "",
        // 暂不设置提醒时间，使用空字符串
        priority: this.task.priority
      };
      common_vendor.index.__f__("log", "at pages/tasks/add-task.vue:660", "提交的任务数据:", taskData);
      common_vendor.index.showLoading({
        title: this.isEditMode ? "更新中..." : "创建中..."
      });
      const apiCall = this.isEditMode ? api_task.updateTask(taskData) : api_task.addTask(taskData);
      apiCall.then((res) => {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("log", "at pages/tasks/add-task.vue:675", "API响应:", res);
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: this.isEditMode ? "任务更新成功" : "任务创建成功",
            icon: "success",
            duration: 1500,
            success: () => {
              setTimeout(() => {
                common_vendor.index.reLaunch({
                  url: "/pages/tasks/tasks"
                });
              }, 1500);
            }
          });
        } else {
          common_vendor.index.showToast({
            title: res.msg || (this.isEditMode ? "更新任务失败" : "创建任务失败"),
            icon: "none",
            duration: 2500
          });
        }
      }).catch((error) => {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__(
          "error",
          "at pages/tasks/add-task.vue:705",
          this.isEditMode ? "更新任务失败:" : "创建任务失败:",
          error
        );
        common_vendor.index.showToast({
          title: error.message || (this.isEditMode ? "更新任务失败" : "创建任务失败"),
          icon: "none",
          duration: 2500
        });
      });
    }
  }
};
if (!Array) {
  const _easycom_uni_data_select2 = common_vendor.resolveComponent("uni-data-select");
  const _easycom_uni_datetime_picker2 = common_vendor.resolveComponent("uni-datetime-picker");
  const _easycom_uni_tag2 = common_vendor.resolveComponent("uni-tag");
  const _easycom_uni_drawer2 = common_vendor.resolveComponent("uni-drawer");
  (_easycom_uni_data_select2 + _easycom_uni_datetime_picker2 + _easycom_uni_tag2 + _easycom_uni_drawer2)();
}
const _easycom_uni_data_select = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-data-select/uni-data-select.js";
const _easycom_uni_datetime_picker = () => "../../uni_modules/uni-datetime-picker/components/uni-datetime-picker/uni-datetime-picker.js";
const _easycom_uni_tag = () => "../../uni_modules/uni-tag/components/uni-tag/uni-tag.js";
const _easycom_uni_drawer = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-drawer/uni-drawer.js";
if (!Math) {
  (_easycom_uni_data_select + _easycom_uni_datetime_picker + _easycom_uni_tag + _easycom_uni_drawer)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.task.title,
    b: common_vendor.o(($event) => $data.task.title = $event.detail.value),
    c: $data.task.description,
    d: common_vendor.o(($event) => $data.task.description = $event.detail.value),
    e: common_vendor.o((e) => {
      const selected = this.subjectList.find((s) => s.value === e.detail.value);
      this.task.subjectName = selected ? selected.text : "";
    }),
    f: common_vendor.o(($event) => $data.task.subjectId = $event),
    g: common_vendor.p({
      localdata: $data.subjectList,
      loading: $data.subjectLoading,
      placeholder: "请选择学科",
      mode: "none",
      clearable: true,
      modelValue: $data.task.subjectId
    }),
    h: $data.task.subjectId && $data.subjectList.length > 0
  }, $data.task.subjectId && $data.subjectList.length > 0 ? {
    i: common_vendor.t($options.getSelectedSubjectName())
  } : {}, {
    j: $data.task.priority === "高" ? 1 : "",
    k: common_vendor.o(($event) => $data.task.priority = "高"),
    l: $data.task.priority === "中" ? 1 : "",
    m: common_vendor.o(($event) => $data.task.priority = "中"),
    n: $data.task.priority === "低" ? 1 : "",
    o: common_vendor.o(($event) => $data.task.priority = "低"),
    p: common_vendor.o($options.onDeadlineChange),
    q: common_vendor.o(($event) => $data.task.deadline = $event),
    r: common_vendor.p({
      type: "datetime",
      start: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      end: (/* @__PURE__ */ new Date()).getFullYear() + 3 + "-12-31",
      placeholder: "选择截止日期和时间",
      border: true,
      modelValue: $data.task.deadline
    }),
    s: common_vendor.f($data.tags, (tag, k0, i0) => {
      return {
        a: common_vendor.t(tag.tagName),
        b: tag.id,
        c: common_vendor.o(($event) => $options.removeTag(tag.id), tag.id)
      };
    }),
    t: common_vendor.o((...args) => $options.openTagSelector && $options.openTagSelector(...args)),
    v: common_vendor.t($data.isEditMode ? "更新任务" : "创建任务"),
    w: common_vendor.o((...args) => $options.submitTask && $options.submitTask(...args)),
    x: !$options.isFormValid,
    y: common_vendor.o((...args) => $options.closeTagSelector && $options.closeTagSelector(...args)),
    z: common_vendor.f($data.tagList, (tag, k0, i0) => {
      return {
        a: tag.id,
        b: common_vendor.o(($event) => $options.toggleTag(tag), tag.id),
        c: "00aa9757-3-" + i0 + ",00aa9757-2",
        d: common_vendor.p({
          text: tag.tagName,
          type: $options.isTagSelected(tag.id) ? "primary" : "default",
          inverted: true
        })
      };
    }),
    A: $data.tagLoading
  }, $data.tagLoading ? {} : !$data.hasMoreTags && $data.tagList.length > 0 ? {} : {}, {
    B: !$data.hasMoreTags && $data.tagList.length > 0,
    C: common_vendor.o((...args) => $options.loadMoreTags && $options.loadMoreTags(...args)),
    D: common_vendor.sr("showRight", "00aa9757-2"),
    E: common_vendor.p({
      mode: "right",
      ["background-color"]: "#fff"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-00aa9757"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/tasks/add-task.js.map
