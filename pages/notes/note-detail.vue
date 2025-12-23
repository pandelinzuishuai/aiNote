<template>
  <view class="container">
    <!-- 笔记内容 -->
    <view v-if="!isLoading" class="note-content">
      <view class="title-container">
        <text class="note-title">{{ note.title }} </text>
        <image
          class="header-icon"
          src="/static/icons/more.svg"
          mode="aspectFit"
          @tap="showMoreOptions"
        ></image>
      </view>
      <view class="note-info-bar">
        <text class="note-date">{{ formatDate(note.createdAt) }}</text>
        <text class="note-author" v-if="note.authorName">{{
          note.authorName
        }}</text>
      </view>

      <!-- 科目信息 -->
      <view class="note-meta" v-if="note.subjectName">
        <text class="subject-name">科目：{{ note.subjectName }}</text>
      </view>

      <!-- 标签区域 -->
      <view class="note-tags" v-if="note.tags && note.tags.length > 0">
        <uni-tag
          circle
          customStyle="background-color: #e6eaff;color:#4A6CF7;border:none;margin-right:10rpx"
          :text="tag.name"
          v-for="(tag, tagIndex) in note.tags"
          :key="tag.id"
          type="primary"
        ></uni-tag>
      </view>

      <!-- 笔记正文 -->
      <view class="note-body">
        <rich-text :nodes="formatHTML(note.content)"></rich-text>
        <!-- <view v-html="note.content"></view> -->
        <view class="control"
          ><text class="note-date"
            >上次更新:{{ formatDate(note.updatedAt) }}</text
          ></view
        >
      </view>
    </view>

    <!-- 加载中 -->
    <view v-else class="loading">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 加载失败 -->
    <view v-if="loadFailed" class="load-failed">
      <text class="failed-text">加载失败</text>
      <button class="retry-btn" @tap="loadNoteDetail">重试</button>
    </view>
    <view>笔记推荐(todo)</view>
  </view>
</template>

<script>
// 导入笔记API
import { getNoteInfo, deleteNote } from "../../api/note";
import { getUserInfo } from "../../utils/storage";
import {formatHTML} from "../../utils/replaceimg.js";

export default {
  data() {
    return {
      noteId: "",
      note: {
        id: "",
        title: "",
        content: "",
        plainContent: "",
        createdAt: "",
        updatedAt: "",
        tags: [],
        tagNames: [],
        subjectName: "",
        authorName: "",
      },
      isLoading: false,
      loadFailed: false,
    };
  },
  onLoad(options) {
    this.noteId = options.id;
    this.loadNoteDetail();
  },
  methods: {
    // 将导入的formatHTML函数定义为实例方法
    formatHTML(html) {
      return formatHTML(html);
    },


    // 加载笔记详情
    async loadNoteDetail() {
      this.isLoading = true;
      this.loadFailed = false;

      try {
        const res = await getNoteInfo(this.noteId);

        console.log("笔记详情API返回:", res);

        // 解析标签字符串为数组并与标签名称合并为对象数组
        const tagIds = res.data.tagId
          ? res.data.tagId.split(",").map((id) => parseInt(id.trim()))
          : [];
        const tagNames = res.data.tagNames || [];

        // 创建包含id和name属性的标签对象数组
        const tags = tagIds.map((id, index) => ({
          id: id,
          name: tagNames[index] || "未命名标签",
        }));

        // 获取用户信息作为作者名
        const userInfo = getUserInfo();

        // 格式化数据
        this.note = {
          id: res.data.noteId,
          title: res.data.title,
          content: res.data.content, // 保留原始HTML内容用于富文本展示
          plainContent: this.cleanHtmlContent(res.data.content), // 清理后的纯文本
          createdAt: new Date(res.data.createTime).getTime(),
          updatedAt: new Date(res.data.updateTime).getTime(),
          tags: tags, // 标签对象数组
          tagNames: tagNames, // 保留原始标签数组以兼容现有代码
          subjectId: res.data.subjectId,
          subjectName: res.data.subjectName || "", // 直接使用返回的科目名称
          authorName: userInfo?.username || "用户", // 从本地存储获取用户名作为作者名
        };
        console.log(this.note)
      } catch (error) {
        console.error("加载笔记详情失败:", error);
        this.loadFailed = true;
        uni.showToast({
          title: "加载失败，请重试",
          icon: "none",
        });
      } finally {
        this.isLoading = false;
      }
    },

    // 清理HTML内容，只保留文本
    cleanHtmlContent(html) {
      if (!html) return "";

      // 简单的HTML标签去除
      const text = html.replace(/<[^>]+>/g, "");
      // 去除多余的空白字符
      return text.replace(/\s+/g, " ").trim();
    },

    // 格式化日期
    formatDate(timestamp) {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}年${month}月${day}日`;
    },

    // 分享笔记
    shareNote() {
      uni.showShareMenu({
        withShareTicket: true,
        menus: ["shareAppMessage", "shareTimeline"],
      });
    },

    // 显示更多选项
    showMoreOptions() {
      uni.showActionSheet({
        itemList: ["编辑笔记", "删除笔记", "导出为pdf"],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.editNote();
          } else if (res.tapIndex === 1) {
            this.deleteNoteConfirm();
          }
        },
      });
    },

    // 编辑笔记
    editNote() {
      uni.navigateTo({
        url: `/pages/notes/add-note?id=${this.noteId}&mode=edit`,
      });
    },

    // 删除笔记确认
    deleteNoteConfirm() {
      uni.showModal({
        title: "确认删除",
        content: "确定要删除这篇笔记吗？此操作不可撤销。",
        success: async (res) => {
          if (res.confirm) {
            await this.deleteNote();
          }
        },
      });
    },

    // 删除笔记
    async deleteNote() {
      try {
        await deleteNote(this.noteId);
        uni.showToast({
          title: "删除成功",
          icon: "success",
        });
        // 删除成功后返回上一页
        setTimeout(() => {
          uni.reLaunch({
            url: "/pages/notes/notes",
          });
        }, 1500);
      } catch (error) {
        console.error("删除笔记失败:", error);
        uni.showToast({
          title: "删除失败，请重试",
          icon: "none",
        });
      }
    },
  },

  // 分享配置
  onShareAppMessage() {
    return {
      title: this.note.title,
      path: `/pages/notes/note-detail?id=${this.noteId}`,
      imageUrl: "/static/logo.png",
    };
  },

  onShareTimeline() {
    return {
      title: this.note.title,
      query: `id=${this.noteId}`,
      imageUrl: "/static/logo.png",
    };
  },
};
</script>

<style>
.container {
  flex: 1;
  background-color: #ffffff;
  min-height: 100vh;
}

.title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.header-icon {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 20rpx;
}

.icon {
  width: 36rpx;
  height: 36rpx;
}

/* 笔记内容样式 */
.note-content {
  padding: 40rpx 30rpx;
  background-color: #ffffff;
}

.note-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333333;
}

.note-info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.note-date {
  font-size: 24rpx;
  color: #999999;
}

.note-author {
  font-size: 24rpx;
  color: #666666;
}

.note-meta {
  margin-bottom: 30rpx;
}

.subject-name {
  font-size: 26rpx;
  color: #4a6cf7;
  background-color: #e8efff;
  padding: 8rpx 20rpx;
  border-radius: 16rpx;
}

.note-tags {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 40rpx;
}

.note-tag {
  font-size: 26rpx;
  color: #ffffff;
  background-color: #4a6cf7;
  padding: 8rpx 20rpx;
  border-radius: 16rpx;
  margin-right: 16rpx;
  margin-bottom: 16rpx;
}

.note-body {
  font-size: 32rpx;
  color: #333333;
  line-height: 56rpx;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.note-body view {
  width: 100%;
}

/* HTML内容样式 */
.note-body {
  /* 添加最大宽度限制和溢出控制 */
  max-width: 100%;
  overflow-x: hidden;
}

.note-body rich-text {
  max-width: 100%;
  word-wrap: break-word;
  word-break: break-all;
}

/* 为rich-text内部的内容添加样式 */
/* .note-body :deep(*),
.note-body :deep(*::before),
.note-body :deep(*::after) {
  box-sizing: border-box;
  max-width: 100% !important;
  word-wrap: break-word;
} */

/* 图片样式，确保不会溢出 */
rich-text img {
  max-width: 100% !important;
  height: auto !important;
  display: block !important;
}

rich-text :deep(h1),
rich-text :deep(h2),
rich-text :deep(h3) {
  font-weight: bold;
  margin: 30rpx 0 20rpx 0;
  color: #333333;
}

rich-text :deep(h1) {
  font-size: 40rpx;
}

rich-text :deep(h2) {
  font-size: 36rpx;
}

rich-text :deep(h3) {
  font-size: 34rpx;
}

rich-text :deep(p) {
  margin: 20rpx 0;
  line-height: 1.8;
  text-align: justify;
}

rich-text :deep(ul),
rich-text :deep(ol) {
  margin: 20rpx 0;
  padding-left: 50rpx;
}

rich-text :deep(li) {
  margin: 15rpx 0;
  line-height: 1.6;
  word-break: break-word;
}

rich-text :deep(strong) {
  font-weight: bold;
  color: #333333;
}

/* 处理表格溢出问题 */
rich-text :deep(table) {
  width: 100% !important;
  overflow-x: auto !important;
  display: block !important;
}

rich-text:deep(tr),
rich-text :deep(td),
rich-text :deep(th) {
  word-break: break-word;
  max-width: 100px !important;
}

rich-text :deep(em) {
  font-style: italic;
}

rich-text :deep(blockquote) {
  border-left: 4rpx solid #4a6cf7;
  padding-left: 20rpx;
  color: #666666;
  margin: 20rpx 0;
}

.control {
  display: flex;
  justify-content: flex-end;
}

/* 加载样式 */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 200rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #999999;
}

/* 加载失败样式 */
.load-failed {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 200rpx 0;
}

.failed-text {
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 30rpx;
}

.retry-btn {
  font-size: 28rpx;
  color: #4a6cf7;
  background-color: #ffffff;
  border: 1rpx solid #4a6cf7;
  border-radius: 8rpx;
  padding: 12rpx 40rpx;
}
</style>
