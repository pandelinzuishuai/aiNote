<template>
  <view class="container">
    <view class="page-body">
      <view class="wrapper">
        <view
          class="toolbar"
          @tap="format"
          style="height: 120px; overflow-y: auto"
        >
          <view
            :class="formats.bold ? 'ql-active' : ''"
            class="iconfont icon-zitijiacu"
            data-name="bold"
          >
          </view>
          <view
            :class="formats.italic ? 'ql-active' : ''"
            class="iconfont icon-zitixieti"
            data-name="italic"
          >
          </view>
          <view
            :class="formats.underline ? 'ql-active' : ''"
            class="iconfont icon-zitixiahuaxian"
            data-name="underline"
          ></view>
          <view
            :class="formats.strike ? 'ql-active' : ''"
            class="iconfont icon-zitishanchuxian"
            data-name="strike"
          ></view>
          <!-- #ifndef MP-BAIDU -->
          <view
            :class="formats.align === 'left' ? 'ql-active' : ''"
            class="iconfont icon-zuoduiqi"
            data-name="align"
            data-value="left"
          ></view>
          <!-- #endif -->
          <view
            :class="formats.align === 'center' ? 'ql-active' : ''"
            class="iconfont icon-juzhongduiqi"
            data-name="align"
            data-value="center"
          ></view>
          <view
            :class="formats.align === 'right' ? 'ql-active' : ''"
            class="iconfont icon-youduiqi"
            data-name="align"
            data-value="right"
          ></view>
          <view
            :class="formats.align === 'justify' ? 'ql-active' : ''"
            class="iconfont icon-zuoyouduiqi"
            data-name="align"
            data-value="justify"
          ></view>
          <!-- #ifndef MP-BAIDU -->
          <view
            :class="formats.lineHeight ? 'ql-active' : ''"
            class="iconfont icon-line-height"
            data-name="lineHeight"
            data-value="2"
          ></view>
          <view
            :class="formats.letterSpacing ? 'ql-active' : ''"
            class="iconfont icon-Character-Spacing"
            data-name="letterSpacing"
            data-value="2em"
          ></view>
          <view
            :class="formats.marginTop ? 'ql-active' : ''"
            class="iconfont icon-722bianjiqi_duanqianju"
            data-name="marginTop"
            data-value="20px"
          ></view>
          <view
            :class="formats.marginBottom ? 'ql-active' : ''"
            class="iconfont icon-723bianjiqi_duanhouju"
            data-name="marginBottom"
            data-value="20px"
          ></view>
          <!-- #endif -->

          <view class="iconfont icon-clearedformat" @tap="removeFormat"></view>

          <!-- #ifndef MP-BAIDU -->
          <view
            :class="formats.fontFamily ? 'ql-active' : ''"
            class="iconfont icon-font"
            data-name="fontFamily"
            data-value="Pacifico"
          ></view>
          <view
            :class="formats.fontSize === '24px' ? 'ql-active' : ''"
            class="iconfont icon-fontsize"
            data-name="fontSize"
            data-value="24px"
          ></view>
          <!-- #endif -->
          <view
            :class="formats.color === '#0000ff' ? 'ql-active' : ''"
            class="iconfont icon-text_color"
            data-name="color"
            data-value="#0000ff"
          ></view>
          <view
            :class="formats.backgroundColor === '#00ff00' ? 'ql-active' : ''"
            class="iconfont icon-fontbgcolor"
            data-name="backgroundColor"
            data-value="#00ff00"
          ></view>
          <view class="iconfont icon-date" @tap="insertDate"></view>
          <view
            class="iconfont icon--checklist"
            data-name="list"
            data-value="check"
          ></view>
          <view
            :class="formats.list === 'ordered' ? 'ql-active' : ''"
            class="iconfont icon-youxupailie"
            data-name="list"
            data-value="ordered"
          ></view>
          <view
            :class="formats.list === 'bullet' ? 'ql-active' : ''"
            class="iconfont icon-wuxupailie"
            data-name="list"
            data-value="bullet"
          ></view>

          <view class="iconfont icon-undo" @tap="undo"></view>
          <view class="iconfont icon-redo" @tap="redo"></view>

          <view
            class="iconfont icon-outdent"
            data-name="indent"
            data-value="-1"
          ></view>
          <view
            class="iconfont icon-indent"
            data-name="indent"
            data-value="+1"
          ></view>
          <view class="iconfont icon-fengexian" @tap="insertDivider"></view>
          <view class="iconfont icon-charutupian" @tap="insertImage"></view>
          <view
            :class="formats.header === 1 ? 'ql-active' : ''"
            class="iconfont icon-format-header-1"
            data-name="header"
            :data-value="1"
          ></view>
          <view
            :class="formats.script === 'sub' ? 'ql-active' : ''"
            class="iconfont icon-zitixiabiao"
            data-name="script"
            data-value="sub"
          ></view>
          <view
            :class="formats.script === 'super' ? 'ql-active' : ''"
            class="iconfont icon-zitishangbiao"
            data-name="script"
            data-value="super"
          ></view>

          <view class="iconfont icon-shanchu" @tap="clear"></view>

          <view
            :class="formats.direction === 'rtl' ? 'ql-active' : ''"
            class="iconfont icon-direction-rtl"
            data-name="direction"
            data-value="rtl"
          ></view>
        </view>

        <view class="editor-wrapper">
          <editor
            id="editor"
            class="ql-container"
            :placeholder="placeholder || '开始输入...'"
            show-img-size
            show-img-toolbar
            show-img-resize
            @statuschange="onStatusChange"
            :read-only="readOnly"
            @ready="onEditorReady"
            @input="onInput"
          >
          </editor>
          <!-- 字数统计 -->
          <view class="word-count"> {{ wordCount }}/18000 </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { uploadFile } from '../api/minio';

export default {
  props: {
    modelValue: {
      type: String,
      default: "",
    },

    placeholder: {
      type: String,
      default: "",
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      formats: {},
      currentContent: "",
      wordCount: 0,
    };
  },
  watch: {
    modelValue(newVal) {
      // 当外部值变化且与当前内容不同时，更新编辑器内容
      if (newVal !== this.currentContent) {
        this.currentContent = newVal;
        // 尝试立即设置内容到编辑器
        if (this.editorCtx) {
          this.trySetEditorContent(newVal);
        } else {
          // 如果编辑器上下文还未准备好，添加一个延时重试
          setTimeout(() => {
            if (this.editorCtx) {
              this.trySetEditorContent(newVal);
            }
          }, 100);
        }
      }
    },
  },
  onLoad() {
    // #ifndef MP-BAIDU
    uni.loadFontFace({
      family: "Pacifico",
      source: 'url("https://sungd.github.io/Pacifico.ttf")',
    });
    // #endif
  },
  methods: {
    readOnlyChange() {
      this.readOnly = !this.readOnly;
    },
    // 更新字数统计
    updateWordCount(text) {
      // 确保 text 是字符串，如果为空或 undefined 则使用空字符串
      const safeText = text || "";
      // 移除空格、换行符、制表符等空白字符
      const cleanText = safeText.replace(/\s+/g, "");
      console.log(cleanText);
      this.wordCount = cleanText.length;
      this.$emit("wordCountChange", this.wordCount);
      if (this.wordCount > 18000) {
        uni.showToast({
          title: "已超过最大字数限制",
          icon: "none",
        });
        this.undo();
      }
    },
    onEditorReady() {
      console.log("Editor ready event triggered");
      // #ifdef APP-PLUS || MP-WEIXIN || H5
      this.createSelectorQuery()
        .select("#editor")
        .context((res) => {
          this.editorCtx = res.context;
          console.log("Editor context obtained, modelValue length:", this.modelValue ? this.modelValue.length : 0);
          // 使用封装的trySetEditorContent方法，提供更好的错误处理
          this.trySetEditorContent(this.modelValue);
          
          // 添加额外的延时检查，确保内容被正确设置
          setTimeout(() => {
            if (this.modelValue && this.modelValue.length > 0 && this.editorCtx) {
              console.log("Secondary content check and set attempt");
              this.trySetEditorContent(this.modelValue);
            }
          }, 200);
        })
        .exec();
      // #endif
    },

    // 尝试设置编辑器内容的辅助方法
    trySetEditorContent(content) {
      console.log(
        "Trying to set editor content, length:",
        content ? content.length : 0
      );
      try {
        this.editorCtx.setContents({
          html: content || "",
          success: () => {
            console.log("setContents success callback triggered");
            this.updateWordCount(content || "");
          },
          fail: (err) => {
            console.error("setContents fail callback:", err);
          },
        });
      } catch (e) {
        console.error("Exception when setting editor content:", e);
      }
    },

    // 手动设置内容方法，供外部调用
    setContent(html) {
      console.log(
        "setContent method called with content length:",
        html ? html.length : 0
      );
      this.currentContent = html;
      this.trySetEditorContent(html);
    },
    undo() {
      if (this.editorCtx) {
        try {
          this.editorCtx.undo();
        } catch (e) {
          console.error("Undo operation failed:", e);
        }
      }
    },
    redo() {
      if (this.editorCtx) {
        try {
          this.editorCtx.redo();
        } catch (e) {
          console.error("Redo operation failed:", e);
        }
      }
    },
    format(e) {
      if (!this.editorCtx) return;
      let { name, value } = e.target.dataset || {};
      if (!name) return;
      // console.log('format', name, value)
      try {
        this.editorCtx.format(name, value);
      } catch (e) {
        console.error("Format operation failed:", e);
      }
    },
    onStatusChange(e) {
      const formats = e && e.detail ? e.detail : {};
      this.formats = formats;
    },
    onInput(e) {
      // 当编辑器内容变化时，更新当前内容并触发事件
      if (e && e.detail && e.detail.html) {
        this.currentContent = e.detail.html;
        this.$emit("update:modelValue", this.currentContent);
        this.$emit("change", this.currentContent);
        console.log(e);
        // 更新字数统计
        this.updateWordCount(e.detail.text);
      }
    },
    insertDivider() {
      if (this.editorCtx) {
        try {
          this.editorCtx.insertDivider({
            success: function () {
              console.log("insert divider success");
            },
          });
        } catch (e) {
          console.error("Insert divider operation failed:", e);
        }
      }
    },
    clear() {
      if (this.editorCtx) {
        uni.showModal({
          title: "清空编辑器",
          content: "确定清空编辑器全部内容？",
          success: (res) => {
            if (res && res.confirm) {
              try {
                this.editorCtx.clear({
                  success: function () {
                    console.log("clear success");
                  },
                });
              } catch (e) {
                console.error("Clear operation failed:", e);
              }
            }
          },
        });
      }
    },
    removeFormat() {
      if (this.editorCtx) {
        try {
          this.editorCtx.removeFormat();
        } catch (e) {
          console.error("Remove format operation failed:", e);
        }
      }
    },
    insertDate() {
      if (this.editorCtx) {
        try {
          const date = new Date();
          const formatDate = `${date.getFullYear()}/${
            date.getMonth() + 1
          }/${date.getDate()}`;
          this.editorCtx.insertText({
            text: formatDate,
          });
        } catch (e) {
          console.error("Insert date operation failed:", e);
        }
      }
    },
    insertImage() {
      if (this.editorCtx) {
        uni.chooseImage({
          count: 1,
          success: async (res) => {
            if (res && res.tempFilePaths && res.tempFilePaths[0]) {
              try {
                // 显示加载中提示
                uni.showLoading({ title: '图片上传中...' });
                
                // 使用MinIO API上传图片
                const uploadResult = await uploadFile(res.tempFilePaths[0]);
                console.log(uploadResult)
                
                if (uploadResult && uploadResult.data && uploadResult.data.url) {
                  // 使用上传后的URL插入图片
                  this.editorCtx.insertImage({
                    src: uploadResult.data.url,
                    alt: "图像",
                    success: function () {
                      console.log("insert image success");
                    },
                  });
                }
                
                // 隐藏加载中提示
                uni.hideLoading();
              } catch (e) {
                console.error("Image upload or insert failed:", e);
                uni.hideLoading();
                uni.showToast({ title: '图片上传失败', icon: 'none' });
              }
            }
          },
          fail: () => {
            uni.hideLoading();
          }
        });
      }
    },
  },
};
</script>

<style>
@import "./editor-icon.css";

.page-body {
  height: calc(100vh - var(--window-top) - var(--status-bar-height));
}

.wrapper {
  height: 100%;
}

.editor-wrapper {
  height: calc(100vh - var(--window-top) - var(--status-bar-height) - 140px);

  background: #fff;
}

.iconfont {
  display: inline-block;
  padding: 8px 8px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 20px;
}

.toolbar {
  box-sizing: border-box;
  border-bottom: 0;
  font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif;
}

.ql-container {
  box-sizing: border-box;
  overflow-y: scroll;
  padding: 12px 15px;
  width: 100%;
  min-height: 30vh;
  height: 100%;
  margin-top: 20px;
  font-size: 16px;
  line-height: 1.5;
}

.ql-active {
  color: #06c;
}
.word-count {
  margin-top: 20px;
  font-size: 24rpx;
  color: #666666;
}
</style>
