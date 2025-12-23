<template>
  <view class="container">
    <uni-search-bar
      @confirm="search"
      :focus="true"
      radius="30"
      bgColor="#fff"
      placeholder="输入笔记标题"
      v-model="searchValue"
      @blur="blur"
      @focus="focus"
      @input="input"
      @cancel="cancel"
      @clear="clear"
    >
    </uni-search-bar>

    <!-- 内容滚动区域 -->
    <scroll-view
      ref="scrollView"
      class="content-scroll"
      scroll-y
      @scrolltolower="handleScrollToLower"
      :refresher-triggered="triggered"
      @refresherrefresh="onRefresh"
      @refresherpulling="onPulling"
      refresher-enabled="true"
      lower-threshold="200"
    >
      <view v-if="notes.length === 0 && !isLoading" class="empty-state">
        <image class="empty-icon" src="/static/logo.png"></image>
        <text class="empty-text">{{
          searchValue ? "未找到相关笔记" : "暂无笔记"
        }}</text>
        <text class="empty-subtext">
          {{
            searchValue
              ? "尝试调整搜索关键词"
              : "点击右下角添加按钮创建第一条笔记"
          }}
        </text>
      </view>
      <view v-else>
        <view
          v-for="(note, index) in notes"
          :key="note.id"
          class="note-item"
          @tap="viewNoteDetail(note.id)"
        >
          <view class="note-header">
            <text class="note-title">{{ note.title }}</text>
          </view>
          <view class="note-label">
            <uni-tag
              class="note-tag"
              circle
              customStyle="background-color: #e6eaff;color:#4A6CF7;border:none"
              :text="tag.name"
              v-for="(tag, tagIndex) in note.tags"
              :key="tag.id"
              type="primary"
            ></uni-tag>
          </view>
          <text class="note-content">{{
            truncateText(note.content, 100)
          }}</text>
          <view class="note-footer">
            <text class="note-date">{{ formatDate(note.createdAt) }}</text>
          </view>
        </view>
      </view>

      <!-- 使用uni-load-more组件实现加载更多 -->
      <view v-if="notes.length > 0" class="load-more-container">
        <uni-load-more
          :status="loadMoreStatus"
          :content-text="{
            contentdown: '下滑加载更多',
            contentrefresh: '加载中...',
            contentnomore: '没有更多数据了',
          }"
        ></uni-load-more>
      </view>
    </scroll-view>

    <!-- 添加笔记浮动按钮 -->
    <view class="add-btn" @tap="addNote">
      <text class="add-btn-text">+</text>
    </view>
  </view>
</template>

<script>
// 导入笔记API
import { getNoteList } from "../../api/note";
// 导入存储工具函数
import { getUserId } from "../../utils/storage";

export default {
  data() {
    return {
      notes: [],
      isLoading: false,
      triggered: false,
      currentPage: 1,
      pageSize: 10,
      hasMore: true,
      searchValue: "", // 搜索关键词
      debounceTimer: null, // 防抖定时器
      loadMoreStatus: "more", // 加载更多状态：more(可以加载更多), loading(加载中), noMore(没有更多数据)
    };
  },
  // 页面加载时执行
  onLoad() {
    this.loadNotes();
  },

  // 监听滚动到底部事件
  handleScrollToLower() {
    // 当滚动到底部且没有在加载中且有更多数据时，触发加载
    if (!this.isLoading && this.hasMore) {
      this.loadNotes();
    }
  },
  methods: {
    // 下拉刷新处理函数
    onRefresh() {
      // 重置页码为第一页
      this.currentPage = 1;
      this.hasMore = true;
      // 重新获取数据
      this.loadNotes().then(() => {
        // 数据加载完成后，停止下拉刷新动画
        uni.stopPullDownRefresh();
      });
      // this.hasMore = true;
      // this.triggered = true;
      // if (!this.isPull) {
      //   this.isPull = true; //下拉加载，先让其变true再变false才能关闭
      //   //关闭加载状态 (转动的圈)，需要一点延时才能关闭
      //   // 重新加载数据
      //   this.loadNotes().finally(() => {
      //     // 停止下拉刷新动画
      //     console.log("停止加载");
      //     this.triggered = false;
      //   });
      // }
    },
    onPulling() {
      var that = this;
      if (!this.triggered) {
        //下拉加载，先让其变true再变false才能关闭
        this.triggered = true;
        //关闭加载状态 (转动的圈)，需要一点延时才能关闭
        setTimeout(() => {
          that.triggered = false;
        }, 1000);
      }
    },

    // 加载笔记列表
    async loadNotes() {
      // 如果已经没有更多数据，直接返回
      if (!this.hasMore) return;

      this.isLoading = true;
      this.loadMoreStatus = "loading"; // 设置加载状态
      try {
        const query = {
          currentPage: this.currentPage,
          pageSize: this.pageSize,
          title: this.searchValue, // 添加搜索条件
          userId: getUserId(), // 添加userId参数
        };

        // 调用真实的API
        const res = await getNoteList(query);

        console.log("笔记列表API返回:", res);

        // 根据新的返回格式，数据在data.records数组中
        const records = res.data && res.data.records ? res.data.records : [];

        // 将API返回的数据转换为页面需要的格式
        const newNotes = records.map((note) => {
          // 解析标签字符串为数组并与标签名称合并为对象数组
          const tagIds = note.tagId
            ? note.tagId.split(",").map((id) => parseInt(id.trim()))
            : [];
          const tagNames = note.tagNames || [];

          // 创建包含id和name属性的标签对象数组
          const tags = tagIds.map((id, index) => ({
            id: id,
            name: tagNames[index] || "未命名标签",
          }));

          return {
            id: note.noteId,
            title: note.title,
            content: this.cleanHtmlContent(note.content),
            createdAt: new Date(note.createTime).getTime(),
            updatedAt: new Date(note.updateTime).getTime(),
            tags: tags,
            tagNames: tagNames, // 保留原始标签名称数组，兼容模板使用
          };
        });

        // 如果是第一页，替换数据；否则追加数据
        if (this.currentPage === 1) {
          this.notes = newNotes;
        } else {
          this.notes = [...this.notes, ...newNotes];
        }

        // 判断是否还有更多数据
        const total = res.data && res.data.total ? res.data.total : 0;
        this.hasMore = this.notes.length < total;

        // 如果有更多数据，增加页码
        if (this.hasMore) {
          this.currentPage++;
        }
      } catch (error) {
        console.error("加载笔记列表失败:", error);
        uni.showToast({
          title: "加载失败，请重试",
          icon: "none",
        });
        this.loadMoreStatus = "more"; // 加载失败时恢复为可加载状态
      } finally {
        this.isLoading = false;
        // 根据是否有更多数据更新状态
        this.loadMoreStatus = this.hasMore ? "more" : "noMore";
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

    // 查看笔记详情
    viewNoteDetail(noteId) {
      uni.navigateTo({
        url: `/pages/notes/note-detail?id=${noteId}`,
      });
    },

    // 添加笔记
    addNote() {
      uni.navigateTo({
        url: "/pages/notes/add-note",
      });
    },

    // 搜索相关方法
    search() {
      // 重置页码和数据
      this.currentPage = 1;
      this.hasMore = true;
      // 重新加载数据
      this.loadNotes();
    },

    // 输入时触发 - 实现防抖搜索
    input() {
      // 清除之前的定时器
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      // 设置新的定时器，延迟500ms执行搜索
      this.debounceTimer = setTimeout(() => {
        // 重置页码和数据
        this.currentPage = 1;
        this.hasMore = true;
        // 重新加载数据
        this.loadNotes();
      }, 500);
    },

    // 聚焦时触发
    focus() {
      // 可选：聚焦时的处理
    },

    // 失焦时触发
    blur() {
      // 可选：失焦时的处理
    },

    // 取消搜索
    cancel() {
      this.searchValue = "";
      // 重置页码和数据
      this.currentPage = 1;
      this.hasMore = true;
      // 重新加载数据
      this.loadNotes();
    },

    // 清空搜索内容
    clear() {
      this.searchValue = "";
      // 重置页码和数据
      this.currentPage = 1;
      this.hasMore = true;
      // 重新加载数据
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
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + "...";
    },
  },
};
</script>

<style>
.container {
  height: 100vh;
  background-color: #f8faff;
  display: flex;
  flex-direction: column;
}

/* 内容滚动区域 */
.content-scroll {
  flex: 1;
  height: calc(100vh - 100rpx);
  overflow-y: auto;
}

/* 导航栏样式 */
.header {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 20rpx 30rpx;
  background-color: #ffffff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
}

.header-actions {
  display: flex;
  align-items: center;
}

.header-icon {
  width: 48rpx;
  height: 48rpx;
  margin-left: 40rpx;
}

/* 笔记列表样式 */
.notes-list {
  padding: 20rpx;
}

.note-item {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;

  margin: 0 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;
}

.note-item:active {
  transform: scale(0.98);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.note-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  flex: 1;
}

.note-date {
  font-size: 24rpx;
  color: #999999;
  margin-left: 20rpx;
}

.note-content {
  font-size: 28rpx;
  color: #666666;
  line-height: 44rpx;
  margin-bottom: 20rpx;
  overflow-x:hidden;
  text-overflow: ellipsis;
}

.note-label {
  display: flex;
  flex-wrap: wrap;
}
.note-tag {
  margin: 0 12rpx 25rpx 0;
}
.note-footer {
  display: flex;
  justify-content: flex-end;
}

.note-tags {
  font-size: 24rpx;
  color: #4a6cf7;
  background-color: #e8efff;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  margin-right: 12rpx;
  margin-bottom: 12rpx;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  opacity: 0.5;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #666666;
  margin-bottom: 16rpx;
}

.empty-subtext {
  font-size: 26rpx;
  color: #999999;
  text-align: center;
  padding: 0 60rpx;
}

/* 添加按钮样式 */
.add-btn {
  position: fixed;
  right: 40rpx;
  bottom: 40rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: #4a6cf7;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(74, 108, 247, 0.4);
}

.add-btn-text {
  font-size: 60rpx;
  color: #ffffff;
  line-height: 1;
  margin-top: -8rpx;
}

/* 加载更多容器样式 */
.load-more-container {
  padding: 20rpx 0 30rpx;
  display: flex;
  justify-content: center;
}
</style>
