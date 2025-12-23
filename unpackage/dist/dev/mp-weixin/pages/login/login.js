"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const utils_request = require("../../utils/request.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      loginForm: {
        username: "",
        password: ""
      },
      isRememberMe: true,
      isLoading: false
    };
  },
  onLoad() {
    this.checkRememberedUser();
  },
  methods: {
    // 检查是否有记住的用户信息
    checkRememberedUser() {
      const rememberedUser = common_vendor.index.getStorageSync("rememberedUser");
      if (rememberedUser) {
        this.loginForm.username = rememberedUser.username || "";
      }
    },
    // 验证用户名格式
    validateusername(username) {
      const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
      return usernameRegex.test(username);
    },
    // 处理登录
    async handleLogin() {
      if (!this.loginForm.username) {
        common_vendor.index.showToast({
          title: "请输入用户名",
          icon: "none"
        });
        return;
      }
      if (!this.validateusername(this.loginForm.username)) {
        common_vendor.index.showToast({
          title: "用户名格式不正确，需4-20个字符，支持字母、数字、下划线",
          icon: "none"
        });
        return;
      }
      if (!this.loginForm.password) {
        common_vendor.index.showToast({
          title: "请输入密码",
          icon: "none"
        });
        return;
      }
      if (this.loginForm.password.length < 6) {
        common_vendor.index.showToast({
          title: "密码长度不能少于6位",
          icon: "none"
        });
        return;
      }
      try {
        this.isLoading = true;
        const result = await api_index.userAPI.login({
          username: this.loginForm.username,
          password: this.loginForm.password
        });
        if (result.data) {
          utils_request.setToken(result.data);
          const token = result.data;
          let username = this.loginForm.username;
          try {
            const payload = token.split(".")[1];
            if (payload) {
              const decodedPayload = JSON.parse(decodeURIComponent(escape(atob(payload))));
              if (decodedPayload.key) {
                username = decodedPayload.key.replace("user_", "");
              }
            }
          } catch (parseError) {
            common_vendor.index.__f__("warn", "at pages/login/login.vue:168", "解析token失败，使用登录时的用户名:", parseError);
          }
          try {
            await api_index.userAPI.getUserInfo(username);
          } catch (infoError) {
            common_vendor.index.__f__("error", "at pages/login/login.vue:175", "获取用户信息失败:", infoError);
          }
        }
        if (this.isRememberMe) {
          common_vendor.index.setStorageSync("rememberedUser", {
            username: this.loginForm.username
          });
        } else {
          common_vendor.index.removeStorageSync("rememberedUser");
        }
        common_vendor.index.showToast({
          title: result.msg || "登录成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.reLaunch({
            url: "/pages/index/index"
          });
        }, 1e3);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:201", "登录错误:", error);
        common_vendor.index.showToast({
          title: error.message || "网络错误，请稍后重试",
          icon: "none"
        });
      } finally {
        this.isLoading = false;
      }
    },
    // 处理记住我选项变化
    handleRememberChange(e) {
      this.isRememberMe = e.target.checked;
    },
    handleForgotPassword() {
      common_vendor.index.showToast({
        title: "功能开发中",
        icon: "none"
      });
    },
    goToRegister() {
      common_vendor.index.navigateTo({
        url: "/pages/register/register"
      });
    },
    handleSocialLogin(type) {
      common_vendor.index.showToast({
        title: `${type}登录功能开发中`,
        icon: "none"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0,
    b: $data.loginForm.username,
    c: common_vendor.o(($event) => $data.loginForm.username = $event.detail.value),
    d: $data.loginForm.password,
    e: common_vendor.o(($event) => $data.loginForm.password = $event.detail.value),
    f: common_vendor.o((...args) => $options.handleForgotPassword && $options.handleForgotPassword(...args)),
    g: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args)),
    h: common_vendor.o((...args) => $options.goToRegister && $options.goToRegister(...args)),
    i: common_vendor.o(($event) => $options.handleSocialLogin("facebook")),
    j: common_vendor.o(($event) => $options.handleSocialLogin("google")),
    k: common_vendor.o(($event) => $options.handleSocialLogin("apple"))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
