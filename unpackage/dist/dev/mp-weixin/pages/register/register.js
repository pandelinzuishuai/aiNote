"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const _sfc_main = {
  data() {
    return {
      registerForm: {
        name: "",
        email: "",
        code: "",
        password: "",
        confirmPassword: ""
      },
      countdown: 0,
      timer: null,
      isAgreed: true,
      isLoading: false,
      isSendingCode: false
    };
  },
  onUnload() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    // 验证邮箱格式
    validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    // 发送验证码
    async sendcode() {
      if (!this.registerForm.email) {
        common_vendor.index.showToast({
          title: "请输入邮箱地址",
          icon: "none"
        });
        return;
      }
      if (!this.validateEmail(this.registerForm.email)) {
        common_vendor.index.showToast({
          title: "请输入有效的邮箱地址",
          icon: "none"
        });
        return;
      }
      try {
        this.isSendingCode = true;
        common_vendor.index.__f__("log", "at pages/register/register.vue:150", this.registerForm.email);
        const result = await api_index.userAPI.sendEmailCode(this.registerForm.email);
        if (result.code === 0) {
          this.startCountdown();
          common_vendor.index.showToast({
            title: result.msg || "验证码已发送",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: result.msg || "发送验证码失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/register/register.vue:170", "发送验证码错误:", error);
        common_vendor.index.showToast({
          title: error.message || "网络错误，请稍后重试",
          icon: "none"
        });
      } finally {
        this.isSendingCode = false;
      }
    },
    // 开始倒计时
    startCountdown() {
      this.countdown = 60;
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.timer = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          clearInterval(this.timer);
          this.timer = null;
        }
      }, 1e3);
    },
    // 密码强度检查
    getPasswordStrength(password) {
      if (!password)
        return 0;
      let strength = 0;
      if (password.length >= 8)
        strength++;
      if (password.match(/[0-9]/))
        strength++;
      if (password.match(/[a-z]/))
        strength++;
      if (password.match(/[A-Z]/))
        strength++;
      if (password.match(/[!@#$%^&*(),.?":{}|<>]/))
        strength++;
      return strength;
    },
    // 处理注册
    async handleRegister() {
      if (!this.registerForm.name) {
        common_vendor.index.showToast({
          title: "请输入姓名",
          icon: "none"
        });
        return;
      }
      if (!this.registerForm.email) {
        common_vendor.index.showToast({
          title: "请输入邮箱",
          icon: "none"
        });
        return;
      }
      if (!this.validateEmail(this.registerForm.email)) {
        common_vendor.index.showToast({
          title: "请输入有效的邮箱地址",
          icon: "none"
        });
        return;
      }
      if (!this.registerForm.code) {
        common_vendor.index.showToast({
          title: "请输入验证码",
          icon: "none"
        });
        return;
      }
      if (this.registerForm.code.length < 4) {
        common_vendor.index.showToast({
          title: "请输入有效的验证码",
          icon: "none"
        });
        return;
      }
      if (!this.registerForm.password) {
        common_vendor.index.showToast({
          title: "请设置密码",
          icon: "none"
        });
        return;
      }
      if (this.registerForm.password.length < 6) {
        common_vendor.index.showToast({
          title: "密码长度不能少于6位",
          icon: "none"
        });
        return;
      }
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        common_vendor.index.showToast({
          title: "两次输入的密码不一致",
          icon: "none"
        });
        return;
      }
      if (!this.isAgreed) {
        common_vendor.index.showToast({
          title: "请同意服务条款和隐私政策",
          icon: "none"
        });
        return;
      }
      try {
        this.isLoading = true;
        const result = await api_index.userAPI.register({
          username: this.registerForm.name,
          email: this.registerForm.email,
          code: this.registerForm.code,
          password: this.registerForm.password,
          permId: 0
        });
        if (result.code === 200) {
          common_vendor.index.showToast({
            title: result.msg || "注册成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.navigateTo({
              url: "/pages/login/login"
            });
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: result.msg || "注册失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/register/register.vue:320", "注册错误:", error);
        common_vendor.index.showToast({
          title: error.message || "网络错误，请稍后重试",
          icon: "none"
        });
      } finally {
        this.isLoading = false;
      }
    },
    // 处理协议勾选变化
    handleAgreementChange(e) {
      this.isAgreed = e.target.checked;
    },
    goToLogin() {
      common_vendor.index.navigateTo({
        url: "/pages/login/login"
      });
    },
    // 查看服务条款
    viewTerms() {
      common_vendor.index.showToast({
        title: "服务条款功能开发中",
        icon: "none"
      });
    },
    // 查看隐私政策
    viewPrivacy() {
      common_vendor.index.showToast({
        title: "隐私政策功能开发中",
        icon: "none"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: $data.registerForm.name,
    c: common_vendor.o(($event) => $data.registerForm.name = $event.detail.value),
    d: $data.registerForm.email,
    e: common_vendor.o(($event) => $data.registerForm.email = $event.detail.value),
    f: $data.registerForm.code,
    g: common_vendor.o(($event) => $data.registerForm.code = $event.detail.value),
    h: common_vendor.t($data.countdown > 0 ? `${$data.countdown}秒后重试` : "发送验证码"),
    i: common_vendor.o((...args) => $options.sendcode && $options.sendcode(...args)),
    j: $data.countdown > 0,
    k: $data.registerForm.password,
    l: common_vendor.o(($event) => $data.registerForm.password = $event.detail.value),
    m: $data.registerForm.password
  }, $data.registerForm.password ? {
    n: $options.getPasswordStrength($data.registerForm.password) >= 1 ? 1 : "",
    o: $options.getPasswordStrength($data.registerForm.password) >= 3 ? 1 : "",
    p: $options.getPasswordStrength($data.registerForm.password) >= 5 ? 1 : ""
  } : {}, {
    q: $data.registerForm.confirmPassword,
    r: common_vendor.o(($event) => $data.registerForm.confirmPassword = $event.detail.value),
    s: $data.isAgreed,
    t: common_vendor.o((...args) => $options.handleAgreementChange && $options.handleAgreementChange(...args)),
    v: common_vendor.o((...args) => $options.viewTerms && $options.viewTerms(...args)),
    w: common_vendor.o((...args) => $options.viewPrivacy && $options.viewPrivacy(...args)),
    x: common_vendor.o((...args) => $options.handleRegister && $options.handleRegister(...args)),
    y: common_vendor.o((...args) => $options.goToLogin && $options.goToLogin(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-bac4a35d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/register/register.js.map
