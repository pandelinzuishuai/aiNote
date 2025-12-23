<template>
  <view class="profile-container">
    <view class="content">
      <!-- 头像部分 -->
      <view class="avatar-section">
        <view class="avatar-container">
          <image
            class="avatar"
            :src="formData.avatar"
            mode="aspectFill"
            v-if="formData.avatar"
          ></image>
          <uni-icons
            type="contact-filled"
            class="avatar"
            size="140"
            v-else
          ></uni-icons>
          <view v-if="isEditMode" class="avatar-upload" @click="uploadAvatar">
            <text class="upload-icon">📷</text>
          </view>
        </view>
      </view>

      <!-- 个人信息表单 -->
      <view class="form-section">
        <view class="form-item">
          <text class="label">姓名</text>
          <view class="input-container">
            <text v-if="!isEditMode" class="value">{{
              formData.name || "未设置"
            }}</text>
            <input
              v-else
              class="input"
              v-model="formData.name"
              placeholder="请输入姓名"
            />
          </view>
        </view>

        <view class="form-item">
          <text class="label">用户名</text>
          <view class="input-container">
            <text class="value">{{ formData.username || "未设置" }}</text>
          </view>
        </view>

        <view class="form-item">
          <text class="label">邮箱</text>
          <view class="input-container">
            <text v-if="!isEditMode" class="value">{{
              formData.email || "未设置"
            }}</text>
            <input
              v-else
              class="input"
              v-model="formData.email"
              type="email"
              placeholder="请输入邮箱"
            />
          </view>
        </view>

        <view class="form-item">
          <text class="label">手机号</text>
          <view class="input-container">
            <text v-if="!isEditMode" class="value">{{
              formData.phone || "未设置"
            }}</text>
            <input
              v-else
              class="input"
              v-model="formData.phone"
              type="tel"
              placeholder="请输入手机号"
            />
          </view>
        </view>
      </view>

      <!-- 修改按钮 - 移到页面底部 -->
      <view class="bottom-edit-section">
        <button class="bottom-edit-btn" @click="toggleEditMode">
          {{ isEditMode ? "保存" : "修改" }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { getUserInfo, updateUserInfo } from "../../api/user";
import { uploadFile } from "../../api/minio";

export default {
  data() {
    return {
      isEditMode: false,
      originalData: {}, // 存储原始数据，用于取消编辑时恢复
      formData: {
        name: "",
        username: "",
        email: "",
        phone: "",
        avatar: "",
      },
    };
  },
  onLoad() {
    this.loadUserData();
  },
  methods: {
    // 加载用户数据
    async loadUserData() {
      try {
        // 显示加载中
        uni.showLoading({ title: "加载中..." });

        // 获取本地存储的用户信息
        const localUserInfo = uni.getStorageSync("userInfo") || {};
        const username = localUserInfo.username;

        if (username) {
          // 调用API获取最新用户信息
          const res = await getUserInfo(username);
          if (res.data) {
            this.formData = { ...res.data };
          } else {
            this.formData = { ...localUserInfo };
          }
        } else {
          // 使用本地存储的用户信息
          this.formData = { ...localUserInfo };
        }

        // 保存原始数据
        this.originalData = { ...this.formData };
      } catch (error) {
        console.error("加载用户数据失败:", error);
        uni.showToast({ title: "加载失败", icon: "none" });

        // 如果API调用失败，使用本地存储的用户信息
        const localUserInfo = uni.getStorageSync("userInfo") || {};
        this.formData = { ...localUserInfo };
        this.originalData = { ...this.formData };
      } finally {
        uni.hideLoading();
      }
    },

    // 切换编辑模式
    toggleEditMode() {
      if (this.isEditMode) {
        // 保存修改
        this.saveChanges();
      } else {
        // 进入编辑模式
        this.isEditMode = true;
      }
    },

    // 保存修改
    async saveChanges() {
      try {
        uni.showLoading({ title: "保存中..." });

        // 调用更新用户信息API
        const updateForm = {
          name: this.formData.name,
          email: this.formData.email,
          phone: this.formData.phone,
          avatar: this.formData.avatar,
          uid: this.formData.uid || uni.getStorageSync("userInfo").uid,
        };
        console.log(updateForm);

        const res = await updateUserInfo(updateForm);
        uni.reLaunch({
          url: "/pages/mine/mine",
        });

        uni.showToast({ title: "保存成功" });
        this.isEditMode = false;
        this.originalData = { ...this.formData };
      } catch (error) {
        console.error("保存用户信息失败:", error);
        uni.showToast({ title: "保存失败", icon: "none" });
      } finally {
        uni.hideLoading();
      }
    },

    // 上传头像
    uploadAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          try {
            const tempFilePath = res.tempFilePaths[0];

            // 显示加载中
            uni.showLoading({ title: "上传中..." });

            // 使用MinIO上传API
            const result = await uploadFile(tempFilePath);

            if (result && result.data && result.data.url) {
              // 使用上传后的URL作为头像路径
              this.formData.avatar = result.data.url;
              uni.showToast({ title: "上传成功", icon: "success" });
            } else {
              throw new Error("上传结果不包含有效URL");
            }
          } catch (error) {
            console.error("上传头像失败:", error);
            uni.showToast({ title: "上传失败，请重试", icon: "none" });
          } finally {
            uni.hideLoading();
          }
        },
        fail: () => {
          console.log("取消选择图片");
        },
      });
    },
  },
};
</script>

<style scoped>
.profile-container {
  height: 100vh;
  background-color: #f8faff;
  display: flex;
  flex-direction: column;
}

/* 内容区域样式 */
.content {
  flex: 1;
  padding: 30rpx;
}

/* 底部修改按钮区域 */
.bottom-edit-section {
  margin-top: 50rpx;
  padding: 0 20rpx;
}

.bottom-edit-btn {
  width: 100%;
  background-color: #5374f7;
  color: #fff;
  border: none;
  height: 90rpx;
  line-height: 90rpx;
  font-size: 32rpx;
  border-radius: 45rpx;
}

/* 头像部分样式 */
.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 40rpx;
}

.avatar-container {
  position: relative;
  width: 200rpx;
  height: 200rpx;
}

.avatar {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #fff;
}

.avatar-upload {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 60rpx;
  height: 60rpx;
  background-color: #666;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 30rpx;
}

/* 表单部分样式 */
.form-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.form-item:last-child {
  border-bottom: none;
}

.label {
  width: 150rpx;
  font-size: 32rpx;
  color: #666;
}

.input-container {
  flex: 1;
}

.value {
  font-size: 32rpx;
  color: #333;
}

.input {
  font-size: 32rpx;
  color: #333;
  padding: 10rpx 0;
  border: 1rpx solid #ddd;
  border-radius: 12rpx;
  padding: 20rpx;
}
</style>
