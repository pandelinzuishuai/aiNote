"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const utils_storage = require("./utils/storage.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/login/login.js";
  "./pages/register/register.js";
  "./pages/notes/notes.js";
  "./pages/tasks/tasks.js";
  "./pages/tasks/add-task.js";
  "./pages/tasks/task-detail.js";
  "./pages/mine/mine.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:14", "App Launch");
    this.initRouterGuard();
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:19", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:22", "App Hide");
  },
  methods: {
    initRouterGuard() {
      const that = this;
      common_vendor.index.addInterceptor("navigateTo", {
        invoke(e) {
          return that.checkPermission(e.url);
        },
        error(err) {
          common_vendor.index.__f__("error", "at App.vue:34", "导航错误:", err);
        }
      });
      common_vendor.index.addInterceptor("reLaunch", {
        invoke(e) {
          return that.checkPermission(e.url);
        }
      });
      common_vendor.index.addInterceptor("redirectTo", {
        invoke(e) {
          return that.checkPermission(e.url);
        }
      });
    },
    // 检查访问权限
    checkPermission(url) {
      const whiteList = ["/pages/login/login", "/pages/register/register"];
      let path = url;
      if (url.indexOf("?") !== -1) {
        path = url.split("?")[0];
      }
      if (whiteList.includes(path)) {
        return true;
      }
      const token = utils_storage.getToken();
      if (!token) {
        if (path !== "/pages/login/login") {
          common_vendor.index.__f__("log", "at App.vue:76", "未登录，重定向到登录页面");
          common_vendor.index.reLaunch({
            url: "/pages/login/login"
          });
          return false;
        }
      }
      return true;
    }
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
