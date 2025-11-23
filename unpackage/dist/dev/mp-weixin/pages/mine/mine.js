"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      chartInstance: null,
      chartData: {
        labels: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
        values: [3, 4, 5, 4, 6, 3, 4]
      },
      userData: {
        name: "学习者",
        avatar: "../../../static/logo.png",
        slogan: "学习进步每一天"
      },
      isDarkMode: false,
      notificationEnabled: true,
      selectedThemeIndex: 0,
      themeColors: ["#5374f7", "#722ED1", "#E73D8D", "#00B42A"]
    };
  },
  onLoad() {
  },
  onReady() {
    this.drawTrendChart();
  },
  methods: {
    drawTrendChart() {
      const ctx = common_vendor.index.createCanvasContext("trendChart", this);
      const width = 300;
      const height = 100;
      ctx.setFillStyle("#fff");
      ctx.fillRect(0, 0, width, height);
      ctx.setStrokeStyle("#5374f7");
      ctx.setLineWidth(2);
      ctx.setFillStyle("#5374f7");
      ctx.setStrokeStyle("#f0f0f0");
      ctx.setLineWidth(1);
      for (let i = 0; i <= 5; i++) {
        const y = 20 + i * 12;
        ctx.beginPath();
        ctx.moveTo(20, y);
        ctx.lineTo(width - 20, y);
        ctx.stroke();
      }
      const padding = 20;
      const pointSpacing = (width - 2 * padding) / (this.chartData.labels.length - 1);
      ctx.setStrokeStyle("#5374f7");
      ctx.beginPath();
      this.chartData.values.forEach((value, index) => {
        const x = padding + index * pointSpacing;
        const y = height - padding - value / 10 * (height - 2 * padding);
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      this.chartData.values.forEach((value, index) => {
        const x = padding + index * pointSpacing;
        const y = height - padding - value / 10 * (height - 2 * padding);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
      ctx.setFontSize(10);
      ctx.setFillStyle("#999");
      this.chartData.labels.forEach((label, index) => {
        const x = padding + index * pointSpacing;
        const y = height - 5;
        ctx.fillText(label, x - 10, y);
      });
      ctx.draw();
    },
    // 处理退出登录
    logout() {
      common_vendor.index.showModal({
        title: "确认退出",
        content: "确定要退出当前账号吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.removeStorageSync("userInfo");
            common_vendor.index.navigateTo({
              url: "/pages/login/login"
            });
          }
        }
      });
    },
    // 处理设置项点击
    handleSettingClick(type) {
      switch (type) {
        case "profile":
          common_vendor.index.showToast({
            title: "跳转到个人资料编辑",
            icon: "none"
          });
          break;
        case "security":
          common_vendor.index.showToast({
            title: "跳转到账户安全",
            icon: "none"
          });
          break;
        case "language":
          common_vendor.index.showToast({
            title: "跳转到语言设置",
            icon: "none"
          });
          break;
        case "help":
          common_vendor.index.showToast({
            title: "跳转到帮助与支持",
            icon: "none"
          });
          break;
        case "about":
          common_vendor.index.showToast({
            title: "跳转到关于应用",
            icon: "none"
          });
          break;
      }
    },
    // 切换深色模式
    toggleDarkMode(e) {
      this.isDarkMode = e.detail.value;
      common_vendor.index.setStorageSync("darkMode", this.isDarkMode);
      common_vendor.index.showToast({
        title: this.isDarkMode ? "已开启深色模式" : "已关闭深色模式",
        icon: "none"
      });
    },
    // 切换通知设置
    toggleNotification(e) {
      this.notificationEnabled = e.detail.value;
      common_vendor.index.setStorageSync("notificationEnabled", this.notificationEnabled);
    },
    // 切换主题色
    selectTheme(index) {
      this.selectedThemeIndex = index;
      common_vendor.index.setStorageSync("themeColor", this.themeColors[index]);
      common_vendor.index.showToast({
        title: "主题已切换",
        icon: "none"
      });
    },
    // 模拟加载用户数据
    loadUserData() {
      const savedUser = common_vendor.index.getStorageSync("userInfo");
      if (savedUser) {
        this.userData = savedUser;
      }
      const savedTheme = common_vendor.index.getStorageSync("themeColor");
      if (savedTheme) {
        const index = this.themeColors.indexOf(savedTheme);
        if (index !== -1) {
          this.selectedThemeIndex = index;
        }
      }
      const darkMode = common_vendor.index.getStorageSync("darkMode");
      if (darkMode !== null) {
        this.isDarkMode = darkMode;
      }
      const notification = common_vendor.index.getStorageSync("notificationEnabled");
      if (notification !== null) {
        this.notificationEnabled = notification;
      }
    }
  },
  onLoad() {
    this.loadUserData();
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.userData.avatar,
    b: common_vendor.t($data.userData.name),
    c: common_vendor.t($data.userData.slogan),
    d: common_vendor.o(($event) => $options.handleSettingClick("profile")),
    e: common_vendor.o(($event) => $options.handleSettingClick("security")),
    f: $data.notificationEnabled,
    g: common_vendor.o((...args) => $options.toggleNotification && $options.toggleNotification(...args)),
    h: common_vendor.o(($event) => $options.handleSettingClick("language")),
    i: $data.isDarkMode,
    j: common_vendor.o((...args) => $options.toggleDarkMode && $options.toggleDarkMode(...args)),
    k: common_vendor.f($data.themeColors, (color, index, i0) => {
      return {
        a: index,
        b: $data.selectedThemeIndex === index ? 1 : "",
        c: color,
        d: common_vendor.o(($event) => $options.selectTheme(index), index)
      };
    }),
    l: common_vendor.o(($event) => $options.handleSettingClick("help")),
    m: common_vendor.o(($event) => $options.handleSettingClick("about")),
    n: common_vendor.o((...args) => $options.logout && $options.logout(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7c2ebfa5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/mine.js.map
