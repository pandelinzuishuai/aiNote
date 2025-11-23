<!--
 * @Author: delin66
 * @Date: 2025-11-14 20:28:38
 * @LastEditors: delin66
 * @LastEditTime: 2025-11-17 21:22:33
 * @Descripttion: 
-->
<script>
// 导入存储相关的工具方法
import { getToken } from "./utils/storage";

export default {
  onLaunch: function () {
    console.log("App Launch");
    // 初始化全局路由守卫
    this.initRouterGuard();
  },
  onShow: function () {
    console.log("App Show");
  },
  onHide: function () {
    console.log("App Hide");
  },
  methods: {
    initRouterGuard() {
      // 使用uni-app的路由钩子
      const that = this;
      // 路由前置守卫
      uni.addInterceptor("navigateTo", {
        invoke(e) {
          return that.checkPermission(e.url);
        },
        error(err) {
          console.error("导航错误:", err);
        },
      });

      // 拦截reLaunch，处理tab切换和页面跳转
      uni.addInterceptor("reLaunch", {
        invoke(e) {
          return that.checkPermission(e.url);
        },
      });

      // 拦截redirectTo
      uni.addInterceptor("redirectTo", {
        invoke(e) {
          return that.checkPermission(e.url);
        },
      });
    },

    // 检查访问权限
    checkPermission(url) {
      // 不需要登录的页面列表
      const whiteList = ["/pages/login/login", "/pages/register/register"];

      // 解析url，获取页面路径（去掉参数部分）
      let path = url;
      if (url.indexOf("?") !== -1) {
        path = url.split("?")[0];
      }

      // 检查是否在白名单中
      if (whiteList.includes(path)) {
        return true;
      }

      // 获取token
      const token = getToken();

      // 如果没有token，重定向到登录页面
      if (!token) {
        // 避免无限重定向
        if (path !== "/pages/login/login") {
          console.log("未登录，重定向到登录页面");
          uni.reLaunch({
            url: "/pages/login/login",
          });
          return false;
        }
      }

      return true;
    },
  },
};
</script>

<style lang="scss">
/*每个页面公共css */
@import '@/uni_modules/uni-scss/index.scss';

body {
  height: 100%;
}
</style>
