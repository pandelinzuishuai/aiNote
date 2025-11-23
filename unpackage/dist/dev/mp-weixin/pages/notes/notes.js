"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      notes: [],
      isLoading: false
    };
  },
  onLoad() {
    this.loadNotes();
  },
  methods: {
    // 加载笔记列表
    loadNotes() {
      this.isLoading = true;
      setTimeout(() => {
        this.notes = this.generateMockNotes();
        this.isLoading = false;
      }, 500);
    },
    // 生成模拟笔记数据
    generateMockNotes() {
      return [
        {
          id: "1",
          title: "学习计划",
          content: "今天需要完成AI学习任务，包括阅读论文、编写代码和总结笔记。重点关注神经网络模型的优化方法和应用场景。",
          createdAt: (/* @__PURE__ */ new Date()).getTime() - 864e5,
          updatedAt: (/* @__PURE__ */ new Date()).getTime() - 36e5,
          tags: ["学习", "计划", "AI"]
        },
        {
          id: "2",
          title: "项目进度记录",
          content: "项目开发进度良好，已完成需求分析和系统设计。下一步需要开始前端开发，重点是用户界面的实现和交互逻辑的设计。",
          createdAt: (/* @__PURE__ */ new Date()).getTime() - 1728e5,
          updatedAt: (/* @__PURE__ */ new Date()).getTime() - 72e5,
          tags: ["项目", "进度", "开发"]
        },
        {
          id: "3",
          title: "会议记录",
          content: "团队会议讨论了产品迭代计划，确定了下一版本的功能优先级。需要关注用户反馈，优化核心功能体验。",
          createdAt: (/* @__PURE__ */ new Date()).getTime() - 2592e5,
          updatedAt: (/* @__PURE__ */ new Date()).getTime() - 2592e5,
          tags: ["会议", "记录", "团队"]
        }
      ];
    },
    // 查看笔记详情
    viewNoteDetail(noteId) {
      common_vendor.index.navigateTo({
        url: `/pages/notes/note-detail?id=${noteId}`
      });
    },
    // 添加笔记
    addNote() {
      common_vendor.index.navigateTo({
        url: "/pages/notes/add-note"
      });
    },
    // 搜索笔记
    searchNotes() {
      common_vendor.index.showToast({
        title: "搜索功能开发中",
        icon: "none"
      });
    },
    // 格式化日期
    formatDate(timestamp) {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    // 截断文本
    truncateText(text, maxLength) {
      if (text.length <= maxLength)
        return text;
      return text.substring(0, maxLength) + "...";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.searchNotes && $options.searchNotes(...args)),
    b: common_assets._imports_0,
    c: common_vendor.o((...args) => $options.addNote && $options.addNote(...args)),
    d: common_assets._imports_1,
    e: $data.notes.length === 0
  }, $data.notes.length === 0 ? {
    f: common_assets._imports_2
  } : {
    g: common_vendor.f($data.notes, (note, index, i0) => {
      return {
        a: common_vendor.t(note.title),
        b: common_vendor.t($options.formatDate(note.createdAt)),
        c: common_vendor.t($options.truncateText(note.content, 100)),
        d: common_vendor.f(note.tags, (tag, tagIndex, i1) => {
          return {
            a: common_vendor.t(tag),
            b: tagIndex
          };
        }),
        e: note.id,
        f: common_vendor.o(($event) => $options.viewNoteDetail(note.id), note.id)
      };
    })
  }, {
    h: common_vendor.o((...args) => $options.addNote && $options.addNote(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/notes/notes.js.map
