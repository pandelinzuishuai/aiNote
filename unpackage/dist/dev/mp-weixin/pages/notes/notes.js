"use strict";
const common_vendor = require("../../common/vendor.js");
const api_note = require("../../api/note.js");
const utils_storage = require("../../utils/storage.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      notes: [],
      isLoading: false,
      triggered: false,
      currentPage: 1,
      pageSize: 10,
      hasMore: true,
      searchValue: "",
      // 搜索关键词
      debounceTimer: null,
      // 防抖定时器
      loadMoreStatus: "more"
      // 加载更多状态：more(可以加载更多), loading(加载中), noMore(没有更多数据)
    };
  },
  // 页面加载时执行
  onLoad() {
    this.loadNotes();
  },
  // 监听滚动到底部事件
  handleScrollToLower() {
    if (!this.isLoading && this.hasMore) {
      this.loadNotes();
    }
  },
  methods: {
    // 下拉刷新处理函数
    onRefresh() {
      this.currentPage = 1;
      this.hasMore = true;
      this.loadNotes().then(() => {
        common_vendor.index.stopPullDownRefresh();
      });
    },
    onPulling() {
      var that = this;
      if (!this.triggered) {
        this.triggered = true;
        setTimeout(() => {
          that.triggered = false;
        }, 1e3);
      }
    },
    // 加载笔记列表
    async loadNotes() {
      if (!this.hasMore)
        return;
      this.isLoading = true;
      this.loadMoreStatus = "loading";
      try {
        const query = {
          currentPage: this.currentPage,
          pageSize: this.pageSize,
          title: this.searchValue,
          // 添加搜索条件
          userId: utils_storage.getUserId()
          // 添加userId参数
        };
        const res = await api_note.getNoteList(query);
        common_vendor.index.__f__("log", "at pages/notes/notes.vue:179", "笔记列表API返回:", res);
        const records = res.data && res.data.records ? res.data.records : [];
        const newNotes = records.map((note) => {
          const tagIds = note.tagId ? note.tagId.split(",").map((id) => parseInt(id.trim())) : [];
          const tagNames = note.tagNames || [];
          const tags = tagIds.map((id, index) => ({
            id,
            name: tagNames[index] || "未命名标签"
          }));
          return {
            id: note.noteId,
            title: note.title,
            content: this.cleanHtmlContent(note.content),
            createdAt: new Date(note.createTime).getTime(),
            updatedAt: new Date(note.updateTime).getTime(),
            tags,
            tagNames
            // 保留原始标签名称数组，兼容模板使用
          };
        });
        if (this.currentPage === 1) {
          this.notes = newNotes;
        } else {
          this.notes = [...this.notes, ...newNotes];
        }
        const total = res.data && res.data.total ? res.data.total : 0;
        this.hasMore = this.notes.length < total;
        if (this.hasMore) {
          this.currentPage++;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/notes/notes.vue:225", "加载笔记列表失败:", error);
        common_vendor.index.showToast({
          title: "加载失败，请重试",
          icon: "none"
        });
        this.loadMoreStatus = "more";
      } finally {
        this.isLoading = false;
        this.loadMoreStatus = this.hasMore ? "more" : "noMore";
      }
    },
    // 清理HTML内容，只保留文本
    cleanHtmlContent(html) {
      if (!html)
        return "";
      const text = html.replace(/<[^>]+>/g, "");
      return text.replace(/\s+/g, " ").trim();
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
    // 搜索相关方法
    search() {
      this.currentPage = 1;
      this.hasMore = true;
      this.loadNotes();
    },
    // 输入时触发 - 实现防抖搜索
    input() {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      this.debounceTimer = setTimeout(() => {
        this.currentPage = 1;
        this.hasMore = true;
        this.loadNotes();
      }, 500);
    },
    // 聚焦时触发
    focus() {
    },
    // 失焦时触发
    blur() {
    },
    // 取消搜索
    cancel() {
      this.searchValue = "";
      this.currentPage = 1;
      this.hasMore = true;
      this.loadNotes();
    },
    // 清空搜索内容
    clear() {
      this.searchValue = "";
      this.currentPage = 1;
      this.hasMore = true;
      this.loadNotes();
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
if (!Array) {
  const _easycom_uni_search_bar2 = common_vendor.resolveComponent("uni-search-bar");
  const _easycom_uni_tag2 = common_vendor.resolveComponent("uni-tag");
  const _easycom_uni_load_more2 = common_vendor.resolveComponent("uni-load-more");
  (_easycom_uni_search_bar2 + _easycom_uni_tag2 + _easycom_uni_load_more2)();
}
const _easycom_uni_search_bar = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-search-bar/uni-search-bar.js";
const _easycom_uni_tag = () => "../../uni_modules/uni-tag/components/uni-tag/uni-tag.js";
const _easycom_uni_load_more = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-load-more/uni-load-more.js";
if (!Math) {
  (_easycom_uni_search_bar + _easycom_uni_tag + _easycom_uni_load_more)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o($options.search),
    b: common_vendor.o($options.blur),
    c: common_vendor.o($options.focus),
    d: common_vendor.o($options.input),
    e: common_vendor.o($options.cancel),
    f: common_vendor.o($options.clear),
    g: common_vendor.o(($event) => $data.searchValue = $event),
    h: common_vendor.p({
      focus: true,
      radius: "30",
      bgColor: "#fff",
      placeholder: "输入笔记标题",
      modelValue: $data.searchValue
    }),
    i: $data.notes.length === 0 && !$data.isLoading
  }, $data.notes.length === 0 && !$data.isLoading ? {
    j: common_assets._imports_0,
    k: common_vendor.t($data.searchValue ? "未找到相关笔记" : "暂无笔记"),
    l: common_vendor.t($data.searchValue ? "尝试调整搜索关键词" : "点击右下角添加按钮创建第一条笔记")
  } : {
    m: common_vendor.f($data.notes, (note, index, i0) => {
      return {
        a: common_vendor.t(note.title),
        b: common_vendor.f(note.tags, (tag, tagIndex, i1) => {
          return {
            a: tag.id,
            b: "881add60-1-" + i0 + "-" + i1,
            c: common_vendor.p({
              circle: true,
              customStyle: "background-color: #e6eaff;color:#4A6CF7;border:none",
              text: tag.name,
              type: "primary"
            })
          };
        }),
        c: common_vendor.t($options.truncateText(note.content, 100)),
        d: common_vendor.t($options.formatDate(note.createdAt)),
        e: note.id,
        f: common_vendor.o(($event) => $options.viewNoteDetail(note.id), note.id)
      };
    })
  }, {
    n: $data.notes.length > 0
  }, $data.notes.length > 0 ? {
    o: common_vendor.p({
      status: $data.loadMoreStatus,
      ["content-text"]: {
        contentdown: "下滑加载更多",
        contentrefresh: "加载中...",
        contentnomore: "没有更多数据了"
      }
    })
  } : {}, {
    p: common_vendor.o((...args) => _ctx.handleScrollToLower && _ctx.handleScrollToLower(...args)),
    q: $data.triggered,
    r: common_vendor.o((...args) => $options.onRefresh && $options.onRefresh(...args)),
    s: common_vendor.o((...args) => $options.onPulling && $options.onPulling(...args)),
    t: common_vendor.o((...args) => $options.addNote && $options.addNote(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/notes/notes.js.map
