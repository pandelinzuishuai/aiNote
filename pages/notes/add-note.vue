<template>
  <view class="container">
    <!-- 加载状态指示器 -->
    <view v-if="isLoading" class="global-loading">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
    <!-- 内容区域，可滚动 -->
    <view class="content-wrapper">
      <view class="edit-area">
        <view class="title-input-wrapper">
          <input
            v-model="note.title"
            class="note-title"
            placeholder="笔记标题..."
            placeholder-class="placeholder"
          />
          <text class="clear-icon" v-if="note.title" @click="clearTitle"
            >×</text
          >
        </view>

        <!-- 科目选择区域 -->
        <view class="subject-selector">
          <text class="section-label">所属学科</text>
          <uni-data-select
            v-model="selectedSubject"
            :localdata="subjectList"
            @change="onSubjectChange"
            placeholder="请选择学科"
            mode="none"
            clearable
          />
          <text
            v-if="selectedSubject && subjectList.length > 0"
            class="selected-subject-info"
          >
            当前选择: {{ getSelectedSubjectName() }}
          </text>
        </view>
        <!-- 使用富文本编辑器替换textarea -->
        <rich-text-editor
          ref="richTextEditor"
          v-model="note.content"
          placeholder="请输入笔记内容..."
          @change="onContentChange"
          @wordCountChange="onWordCountChange"
        />
      </view>

      <!-- 标签选择 -->
      <view class="tags-section">
        <view class="tags-container">
          <view
            v-for="tag in tags"
            :key="tag.id"
            class="tag-item"
            @tap="handleClose(tag.id)"
          >
            {{ tag.tagName }}
            <text class="tag-close">×</text>
          </view>
          <view class="tag-add-btn" @tap="open()"> + 添加标签 </view>
        </view>
      </view>
      <!-- OCR文本识别区域 -->
      <view class="ocr-section">
        <text class="ocr-title">OCR文本识别</text>
        <view class="ocr-upload-area">
          <view class="ocr-upload-btn" @tap="startOCR">
            <text class="ocr-upload-text">拍照/上传图片进行OCR识别</text>
          </view>
        </view>
        <view class="ocr-result-area">
          <text class="ocr-result-text">
            {{
              ocrResult ||
              "OCR识别结果将显示在这里。智能OCR功能可以识别图像中的文字并将其转换为可编辑文本，方便您快速记录教材内容、笔记照片或黑板板书。"
            }}
          </text>
          <view class="ocr-actions" v-if="ocrStatus === 'success'">
            <button class="ocr-action-btn" @tap="copyToEditor">
              复制到编辑器
            </button>
            <button class="ocr-action-btn" @tap="extractTags">提取标签</button>
            <button class="ocr-action-btn" @tap="clearOCRResult">
              清除结果
            </button>
          </view>
        </view>
      </view>

      <!-- 推荐标签展示区域 -->
      <view class="recommended-tags-area" v-if="recommendedTags.length > 0">
        <text class="recommended-tags-title">提取标签</text>
        <view class="recommended-tags-container">
          <view
            v-for="(tag, index) in recommendedTags"
            :key="index"
            class="recommended-tag-item"
            @tap="handleAddTag(tag)"
          >
            {{ tag }}
            <text class="tag-close">+</text>
          </view>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-placeholder"></view>
    </view>

    <!-- 底部保存按钮 -->
    <view class="bottom-save-area">
      <button class="save-btn" @tap="saveNote">
        {{ isEditMode ? "更新笔记" : "保存笔记" }}
      </button>
    </view>

    <!-- 标签选择器弹窗 -->
    <uni-drawer ref="showRight" mode="right" background-color="#fff">
      <view class="tag-selector-content">
        <view class="tag-selector-header">
          <text class="tag-selector-title">选择标签</text>
        </view>
        <view class="tag-list" @scrolltolower="loadMoreTags">
          <uni-tag
            v-for="tag in tagList"
            :key="tag.id"
            :text="tag.tagName"
            :type="tags.includes(tag) ? 'primary' : 'default'"
            inverted
            @tap="toggleTag(tag)"
          />
          <!-- 加载更多提示 -->
          <view v-if="loadingMore" class="loading-more">
            <text>加载中...</text>
          </view>

          <!-- 没有更多数据提示 -->
          <view
            v-else-if="!hasMoreData && tagList.length > 0"
            class="no-more-data"
          >
            <text>没有更多标签了</text>
          </view>
        </view>
      </view>
    </uni-drawer>
  </view>
</template>

<script>
// 导入笔记API
import { addNote, getNoteInfo, updateNote } from "../../api/note";
import ocrAPI from "../../api/ocr";
// 导入标签API
import { getTagList } from "../../api/tag";
// 导入科目API
import { getSubjectList } from "../../api/subject";
// 导入storage工具
import { getUserId } from "../../utils/storage";
// 开发环境下导入测试工具
// #ifdef DEV
import { testMinioUpload, runMinioTestSuite } from "../../utils/minio-test";
// #endif
// 导入富文本编辑器组件
import RichTextEditor from "../../components/rich-text-editor.vue";

export default {
  components: {
    RichTextEditor,
  },
  data() {
    return {
      // 编辑模式相关
      isEditMode: false,
      noteId: "",
      isLoading: false,

      note: {
        title: "",
        content: "",
        userId: getUserId() || 0, // 从storage中获取userId
        subjectId: 0,
        tagId: 0,
      },
      tags: [], // 已选标签
      tagList: [], // 所有可选标签列表
      recommendedTags: [], // 存储推荐的标签，待用户选择
      wordCount: 0,
      ocrResult: "",
      ocrStatus: "", // OCR状态字段
      ocrImagePath: "", // 保存OCR图片路径，用于提取标签

      // 科目相关数据
      subjectList: [], // 科目列表
      selectedSubject: null, // 当前选中的科目

      // 分页相关参数
      currentPage: 1,
      pageSize: 20,
      hasMoreData: true, // 是否还有更多数据
      loadingMore: false, // 是否正在加载更多
    };
  },
  onLoad(options) {
    // 检查是否是编辑模式
    if (options && options.id && options.mode === "edit") {
      this.isEditMode = true;
      this.noteId = options.id;
      // 设置页面标题
      uni.setNavigationBarTitle({
        title: "编辑笔记",
      });
    } else {
      // 设置页面标题
      uni.setNavigationBarTitle({
        title: "新增笔记",
      });
    }

    // 页面加载时获取标签列表和科目列表
    this.fetchTagList(true).then(() => {
      // 标签列表加载完成后，如果是编辑模式，则加载笔记详情
      if (this.isEditMode) {
        this.loadNoteDetail();
      }
    });
    this.fetchSubjectList(); // 获取科目列表
  },
  methods: {
    // 加载笔记详情
    async loadNoteDetail() {
      try {
        this.isLoading = true;
        uni.showLoading({
          title: "加载笔记中...",
          mask: true,
        });

        // 获取笔记详情
        const res = await getNoteInfo(this.noteId);
        console.log("笔记详情数据:", res);

        // 解析返回数据
        if (res && res.code === 200 && res.data) {
          const noteData = res.data;

          // 填充基本信息
          this.note.title = noteData.title || "";
          this.note.content = noteData.content || "";
          this.note.subjectId = noteData.subjectId || 0;
          
          // 添加延时重试机制，确保内容能正确绑定到编辑器
          setTimeout(() => {
            // 再次设置内容，解决可能的时序问题
            this.$set(this.note, 'content', this.note.content);
          }, 100);
          
          // 添加第二次延时检查
          setTimeout(() => {
            // 如果富文本编辑器组件已经挂载，尝试手动调用其setContent方法
            const editorRef = this.$refs.richTextEditor;
            if (editorRef && typeof editorRef.setContent === 'function') {
              console.log('调用编辑器setContent方法确保内容显示');
              editorRef.setContent(this.note.content);
            }
          }, 300);

          // 设置选中的科目
          if (noteData.subjectId) {
            this.selectedSubject = noteData.subjectId;
          }

          // 处理标签数据
          if (noteData.tagId) {
            const tagIds = noteData.tagId
              .split(",")
              .map((id) => parseInt(id.trim()));

            // 从标签列表中找到对应的标签对象
            this.tags = []; // 清空现有标签
            tagIds.forEach((tagId) => {
              const tag = this.tagList.find((t) => t.id === tagId);
              if (tag) {
                this.tags.push(tag);
              } else {
                // 如果在标签列表中找不到对应标签，创建临时标签对象
                this.tags.push({ id: tagId, tagName: `标签${tagId}` });
              }
            });
            console.log("加载完成后的标签:", this.tags);
          }
          console.log("加载完成后的内容:", this.note.content);
        }
      } catch (error) {
        // 确保在错误情况下也设置isLoading为false
        if (this.isLoading) {
          this.isLoading = false;
          uni.hideLoading();
        }
        console.error("加载笔记详情失败:", error);
        uni.showToast({
          title: "加载失败，请重试",
          icon: "none",
        });
      } finally {
        this.isLoading = false;
        uni.hideLoading();
      }
    },

    open() {
      this.$refs.showRight.open("right");
    },
    // 获取科目列表
    async fetchSubjectList() {
      try {
        // 获取科目列表，使用较大的pageSize确保一次性加载所有科目
        const subjectQuery = {
          currentPage: 1,
          pageSize: 100, // 假设不会有超过100个科目
        };

        console.log("获取科目列表，参数:", subjectQuery);
        const result = await getSubjectList(subjectQuery);
        console.log("获取科目列表结果:", result);

        // 根据API返回格式调整数据结构
        if (result.code === 200) {
          // 转换records数组为需要的格式，适配uni-data-select组件
          this.subjectList = result.data.records.map((subject) => ({
            value: subject.subjectId, // 使用subjectId作为value
            text: subject.subjectName, // 使用subjectName作为显示文本
          }));

          console.log("转换后的科目列表:", this.subjectList);
        } else {
        }
      } catch (error) {
        console.error("获取科目列表失败:", error);
      } finally {
      }
    },

    // 处理科目选择变化
    onSubjectChange(e) {
      console.log("科目选择变化:", e);
      this.selectedSubject = e.detail.value;
      this.note.subjectId = this.selectedSubject || 0;
    },

    // 获取选中的科目名称
    getSelectedSubjectName() {
      const subject = this.subjectList.find(
        (s) => s.value === this.selectedSubject
      );
      return subject ? subject.text : "";
    },

    // 获取标签列表（支持分页和重置）
    async fetchTagList(reset = false) {
      try {
        // 如果是重置，则重置页码
        if (reset) {
          this.currentPage = 1;
          this.tagList = [];
          this.hasMoreData = true;

          uni.showLoading({
            title: "加载标签中...",
            mask: true,
          });
        }

        // 构建分页参数
        const tagQuery = {
          currentPage: this.currentPage,
          pageSize: this.pageSize,
        };

        console.log("获取标签列表，分页参数:", tagQuery);
        const result = await getTagList(tagQuery);
        console.log("获取标签列表结果:", result);

        // 根据API返回格式调整数据结构: {code: 200, msg: "成功", data: {total: 4, pageNumber: 1, records: [...], currentPage: 1}}
        if (
          result &&
          result.code === 200 &&
          result.data &&
          Array.isArray(result.data.records)
        ) {
          // 转换records数组为需要的格式
          const newTags = result.data.records.map((tag) => ({
            id: tag.tagId, // 注意这里使用tagId而不是id
            tagName: tag.tagName,
          }));

          // 如果是重置则替换数据，否则追加数据
          if (reset) {
            this.tagList = newTags;
          } else {
            this.tagList = [...this.tagList, ...newTags];
          }

          // 判断是否还有更多数据
          const totalRecords = result.data.total || 0;
          this.hasMoreData = this.tagList.length < totalRecords;

          // 如果没有数据，添加一些默认标签作为备选
          if (this.tagList.length === 0) {
            this.tagList = [
              { id: 1, tagName: "学习笔记" },
              { id: 2, tagName: "工作计划" },
              { id: 3, tagName: "会议记录" },
              { id: 4, tagName: "灵感创意" },
              { id: 5, tagName: "重要事项" },
            ];
            this.hasMoreData = false; // 没有更多数据了
          }
        } else {
          // 如果是第一次加载失败，提供默认数据
          if (reset && this.tagList.length === 0) {
            this.tagList = [
              { id: 1, tagName: "学习笔记" },
              { id: 2, tagName: "工作计划" },
              { id: 3, tagName: "会议记录" },
              { id: 4, tagName: "灵感创意" },
              { id: 5, tagName: "重要事项" },
            ];
          }
          this.hasMoreData = false;
        }

        console.log(
          "最终标签列表:",
          this.tagList,
          "，还有更多数据:",
          this.hasMoreData
        );
      } catch (error) {
        console.error("获取标签列表失败:", error);
        // 如果是第一次加载失败，提供默认数据
        if (reset && this.tagList.length === 0) {
          this.tagList = [
            { id: 1, tagName: "学习笔记" },
            { id: 2, tagName: "工作计划" },
            { id: 3, tagName: "会议记录" },
            { id: 4, tagName: "灵感创意" },
            { id: 5, tagName: "重要事项" },
          ];
        }
        this.hasMoreData = false;
      } finally {
        uni.hideLoading();
        this.loadingMore = false;
      }
    },

    // 加载更多标签（无限滚动）
    async loadMoreTags() {
      // 如果没有更多数据或者正在加载中，则不重复加载
      if (!this.hasMoreData || this.loadingMore) {
        return;
      }

      this.loadingMore = true;
      this.currentPage++;
      await this.fetchTagList(false); // 传递false表示追加数据
    },
    // 切换标签选择状态
    toggleTag(tag) {
      const index = this.tags.findIndex((t) => t.id === tag.id);
      if (index > -1) {
        // 取消选择
        this.tags.splice(index, 1);
      } else {
        // 添加选择
        this.tags.push(tag);
      }
    },

    // 获取纯文本内容（用于内容验证）
    getPlainText(html) {
      if (!html) return "";
      return html
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();
    },

    // 保存笔记（新增或更新）
    async saveNote() {
      // 验证输入
      if (!this.note.title.trim()) {
        uni.showToast({
          title: "请输入笔记标题",
          icon: "none",
        });
        return;
      }

      // 清理HTML内容，获取纯文本进行验证
      const plainContent = this.getPlainText(this.note.content);
      if (!plainContent.trim()) {
        uni.showToast({
          title: "请输入笔记内容",
          icon: "none",
        });
        return;
      }

      // 根据编辑模式构建不同的参数
      let noteData;
      let apiCall;
      let successMessage;

      if (this.isEditMode) {
        // 更新模式 - 构建更新参数
        noteData = {
          noteId: this.noteId,
          userId: getUserId() || 0,
          subjectId: this.selectedSubject || this.note.subjectId || 0,
          tagId: this.tags.map((tag) => tag.id).join(",") || "",
          title: this.note.title,
          content: this.note.content,
        };
        apiCall = updateNote;
        successMessage = "更新成功";
      } else {
        // 新增模式 - 构建新增参数
        noteData = {
          userId: getUserId() || 0,
          subjectId: this.selectedSubject || this.note.subjectId || 0,
          tagId: this.tags.map((tag) => tag.id).join(",") || "",
          title: this.note.title,
          content: this.note.content,
        };
        apiCall = addNote;
        successMessage = "保存成功";
      }

      console.log(`笔记${this.isEditMode ? "更新" : "保存"}数据:`, noteData);

      try {
        // 设置全局加载状态
        this.isLoading = true;
        uni.showLoading({
          title: this.isEditMode ? "更新中..." : "保存中...",
          mask: true,
        });

        // 调用对应的API
        await apiCall(noteData);

        this.isLoading = false;
        uni.hideLoading();

        uni.showToast({
          title: successMessage,
          icon: "success",
        });

        // 返回笔记列表页
        setTimeout(() => {
          uni.reLaunch({
            url: "/pages/notes/notes",
          });
        }, 1500);
      } catch (error) {
        this.isLoading = false;
        uni.hideLoading();

        console.error(`${this.isEditMode ? "更新" : "保存"}笔记失败:`, error);
        uni.showToast({
          title: "操作失败，请重试",
          icon: "none",
        });
      }
    },

    //删除标签
    handleClose(tagId) {
      this.tags = this.tags.filter((tag) => tag.id !== tagId);
    },

    // 清空标题
    clearTitle() {
      this.note.title = "";
    },

    // 内容变化处理
    onContentChange(content) {
      this.note.content = content;
    },

    // 字数统计变化处理
    onWordCountChange(count) {
      this.wordCount = count;
    },

    // 开始OCR识别
    startOCR() {
      // 显示操作菜单供用户选择图片来源
      uni.showActionSheet({
        itemList: ["拍照", "从相册选择"],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 拍照
            this.chooseImageByCamera();
          } else if (res.tapIndex === 1) {
            // 从相册选择
            this.chooseImageFromAlbum();
          }
        },
        fail: (err) => {
          console.error("选择操作失败:", err);
        },
      });
    },

    // 拍照获取图片
    chooseImageByCamera() {
      uni.chooseImage({
        count: 1,
        sizeType: ["compressed"], // 压缩图片
        sourceType: ["camera"], // 拍照
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          // 直接进行OCR识别
          this.handleForOCR(tempFilePath);
        },
        fail: (err) => {
          console.error("拍照失败:", err);
          uni.showToast({
            title: "拍照失败，请重试",
            icon: "none",
          });
        },
      });
    },

    // 从相册选择图片
    chooseImageFromAlbum() {
      uni.chooseImage({
        count: 1,
        sizeType: ["compressed"], // 压缩图片
        sourceType: ["album"], // 从相册选择
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          // 直接进行OCR识别
          this.handleForOCR(tempFilePath);
        },
        fail: (err) => {
          console.error("选择图片失败:", err);
          uni.showToast({
            title: "选择图片失败，请重试",
            icon: "none",
          });
        },
      });
    },

    // 处理OCR识别（保留方法供其他场景使用）
    async handleForOCR(filePath) {
      if (!filePath) {
        console.error("无效的图片路径");
        uni.showToast({
          title: "图片获取失败，请重试",
          icon: "none",
        });
        return;
      }

      // 保存图片路径，用于后续提取标签
      this.ocrImagePath = filePath;

      // 直接调用OCR处理
      uni.showLoading({
        title: "OCR识别中...",
        mask: true,
      });
      ocrAPI
        .recognizeText(filePath)
        .then((result) => {
          console.log("OCR识别结果:", result);
          // 处理识别结果，例如设置到编辑器
          this.ocrResult = (result || "").replace(/\s+/g, "");
          uni.showToast({
            title: "OCR识别完成",
            icon: "success",
          });
          this.ocrStatus = "success";
          console.log("OCR识别结果（已去除空格）:", this.ocrResult);
        })
        .catch((error) => {
          console.error("OCR识别失败:", error);
          uni.showToast({
            title: "OCR识别失败",
            icon: "none",
          });
          this.ocrStatus = "error";
        })
        .finally(() => {
          uni.hideLoading();
        });
    },

    // 提取标签
    extractTags() {
      if (this.ocrStatus === "success" && this.ocrImagePath) {
        uni.showLoading({
          title: "提取标签中...",
          mask: true,
        });
        ocrAPI
          .recommendLabel(this.ocrImagePath)
          .then((result) => {
            console.log("推荐标签结果:", result.suggestedTags);
            if (result.suggestedTags && result.suggestedTags.length > 0) {
              // 清空之前的推荐标签
              this.recommendedTags = [];
              // 存储推荐标签供用户选择
              this.recommendedTags = [...result.suggestedTags];
              // 滚动到推荐标签区域
              setTimeout(() => {
                uni.pageScrollTo({
                  selector: ".recommended-tags-area",
                  duration: 500,
                });
              }, 100);
            } else {
              uni.showToast({
                title: "未提取到标签",
                icon: "none",
              });
            }
          })
          .catch((error) => {
            console.error("提取标签失败:", error);
            uni.showToast({
              title: "提取标签失败",
              icon: "none",
            });
          })
          .finally(() => {
            uni.hideLoading();
          });
      }
    },

    // 复制OCR结果到编辑器
    copyToEditor() {
      if (this.ocrStatus === "success") {
        // 去除OCR结果中的所有空格
        let formattedOcrResult = this.ocrResult.replace(/\s+/g, "");

        // 如果需要保留换行符，可以使用下面这行代替上面的代码
        // let formattedOcrResult = this.ocrResult.replace(/[ \t]+/g, '');

        // 将处理后的结果按原有换行符分割（如果保留了换行符）
        // 或者直接作为一个段落处理（如果去除了所有空格）
        let ocrHtml = "";
        if (formattedOcrResult.includes("\n")) {
          // 如果还有换行符，按段落处理
          const paragraphs = formattedOcrResult.split("\n");
          paragraphs.forEach((para) => {
            if (para) {
              ocrHtml += `<p>${para}</p>`;
            }
          });
        } else {
          // 如果没有换行符，作为单个段落
          ocrHtml = `<p>${formattedOcrResult}</p>`;
        }

        // 在当前内容后追加OCR结果，并添加分隔符
        if (this.note.content) {
          this.note.content +=
            '<p style="height: 1px; background-color: #eee; margin: 16px 0;"></p>';
        }
        this.note.content += ocrHtml;

        // 显示操作成功提示
        uni.showToast({
          title: "OCR内容已添加到编辑器",
          icon: "success",
          duration: 2000,
        });

        console.log("OCR内容已添加到编辑器");
      }
    },

    // 添加标签
    handleAddTag(tag) {
      if (!this.tags.includes(tag)) {
        this.tags.push(tag);
      }
    },

    // 清除OCR结果
    clearOCRResult() {
      // 询问用户确认
      uni.showModal({
        title: "确认清除",
        content: "确定要清除当前OCR识别结果吗？",
        success: (res) => {
          if (res.confirm) {
            this.ocrResult = "";
            this.ocrStatus = "";
            this.ocrImagePath = "";
            this.recommendedTags = [];
            uni.showToast({
              title: "OCR结果已清除",
              icon: "success",
              duration: 1500,
            });
            console.log("OCR结果已清除");
          }
        },
      });
    },

    // 从HTML中提取纯文本（Uniapp兼容版本）
    getPlainText(html) {
      if (!html) return "";
      // 简单的HTML标签移除
      let plainText = html.replace(/<[^>]+>/g, "");
      // 移除HTML实体
      plainText = plainText.replace(/&nbsp;/g, " ");
      plainText = plainText.replace(/&lt;/g, "<");
      plainText = plainText.replace(/&gt;/g, ">");
      plainText = plainText.replace(/&amp;/g, "&");
      return plainText.trim();
    },
  },
};
</script>

<style>
/* 根容器 */
.container {
  flex: 1;
  background-color: #f8faff;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.back-icon {
  width: 48rpx;
  height: 48rpx;
}

.save-btn {
  font-size: 30rpx;
  color: #4a6cf7;
  font-weight: 500;
}

/* 编辑区域样式 */
.edit-area {
  padding: 30rpx;
}

.title-input-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  background-color: #fff;
  border-radius: 40rpx;
  margin-bottom: 20rpx;
  padding: 0 20rpx;
}

/* 科目选择器样式 */
.subject-selector {
  margin-bottom: 30rpx;
}

.section-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 15rpx;
  display: block;
  font-weight: 500;
}

.selected-subject-info {
  font-size: 24rpx;
  color: #666;
  margin-top: 10rpx;
  display: block;
}

/* 调整uni-data-select组件样式 */
:deep(.uni-data-select) {
  width: 100%;
}

:deep(.uni-data-select__selector) {
  border-radius: 30rpx !important;
  border-color: #e6e6e6 !important;
  background-color: #fff !important;
}

.note-title {
  flex: 1;
  font-size: 32rpx;
  color: #333333;
  padding: 20rpx 0;
  margin: 0 20rpx;
}

.clear-icon {
  border-radius: 50%;
  background-color: #999;
  width: 35rpx;
  height: 35rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

/* 富文本编辑器样式调整 */
:deep(.rich-text-editor) {
  margin-top: 20rpx;
}

.placeholder {
  color: #cccccc;
}

/* 标签选择样式 */
.tags-section {
  margin: 30rpx;
}
.section-title {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
  font-weight: 500;
}

.tag-item {
  font-size: 26rpx;
  color: #666666;
  background-color: #e6eaff;
  padding: 8rpx 20rpx;
  border-radius: 16rpx;
  display: inline-flex;
  align-items: center;
}

.tag-close {
  margin-left: 8rpx;
  color: #999;
  font-size: 24rpx;
}

.tag-add-btn {
  background-color: #f0f0f0;
  color: #666;
  padding: 8rpx 20rpx;
  border-radius: 16rpx;
  font-size: 26rpx;
  display: inline-block;
  border: 1rpx dashed #ccc;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

/* OCR功能样式 */
.ocr-section {
  margin-top: 40rpx;
  padding: 20rpx;
}

.ocr-title {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.ocr-upload-area {
  margin-bottom: 20rpx;
}

.ocr-upload-btn {
  border: 2rpx dashed #4a6cf7;
  border-radius: 16rpx;
  padding: 60rpx 20rpx;
  text-align: center;
  background-color: #f8f9ff;
}

.ocr-upload-text {
  font-size: 28rpx;
  color: #4a6cf7;
}

.ocr-result-area {
  background-color: #f5f5f5;
  border-radius: 16rpx;
  padding: 20rpx;
  min-height: 180rpx;
}

.ocr-result-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.ocr-actions {
  margin-top: 20rpx;
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
}

.ocr-action-btn {
  font-size: 26rpx;
  padding: 8rpx 24rpx;
  background-color: #4a6cf7;
  color: white;
  border-radius: 16rpx;
  border: none;
}

/* 底部保存按钮占位 */
.bottom-placeholder {
  height: 120rpx;
}

/* 内容包装器 */
.content-wrapper {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20rpx;
}

/* 底部保存区域 */
.bottom-save-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  background-color: #ffffff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
  z-index: 10;
}

/* 保存按钮样式 */
.save-btn {
  width: 100%;
  height: 92rpx;
  line-height: 92rpx;
  text-align: center;
  background-color: #4a6cf7;
  color: white;
  font-size: 32rpx;
  border-radius: 46rpx;
  border: none;
  font-weight: 500;
}

/* 标签选择器样式 */
.tag-selector-content {
  padding: 30rpx;
  max-height: 80vh;
  overflow-y: auto;
}
.tag-selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.tag-selector-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}
.tag-selector-close {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 30rpx;
  background-color: #f5f5f5;
}
.close-icon {
  font-size: 40rpx;
  color: #999;
}
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  height: auto; /* 设置固定高度以支持滚动 */
  overflow-y: auto; /* 允许垂直滚动 */
}
.loading-more,
.no-more-data {
  text-align: center;
  padding: 15px 0;
  color: #999;
  font-size: 28rpx;
  width: 100%;
}
.tag-option {
  padding: 12rpx 30rpx;
  background-color: #f5f5f5;
  border-radius: 20rpx;
  font-size: 28rpx;
  color: #666;
  transition: all 0.3s;
}
.tag-option.selected {
  background-color: #4a6cf7;
  color: white;
}

/* 推荐标签样式 */
.recommended-tags-area {
  margin: 20rpx 30rpx;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 16rpx;
}

.recommended-tags-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
  color: #333;
}

.recommended-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.recommended-tag-item {
  padding: 10rpx 20rpx;
  background-color: #e6f4ff;
  color: #4a6cf7;
  border-radius: 16rpx;
  font-size: 26rpx;
}
/* 全局加载状态样式 */
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 9999;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 8rpx solid rgba(74, 108, 247, 0.3);
  border-top-color: #4a6cf7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}
</style>
