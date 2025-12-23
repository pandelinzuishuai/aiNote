"use strict";
const common_vendor = require("../common/vendor.js");
const BASE_URL = "http://139.9.179.161:8088";
const TIMEOUT = 3e4;
function getToken() {
  return common_vendor.index.getStorageSync("token");
}
function setToken(token) {
  common_vendor.index.setStorageSync("token", token);
}
function clearToken() {
  common_vendor.index.removeStorageSync("token");
}
function isLoggedIn() {
  return !!getToken();
}
function request(options = {}) {
  return new Promise((resolve, reject) => {
    if (options.needLogin && !isLoggedIn()) {
      common_vendor.index.navigateTo({ url: "/pages/login/login" });
      reject(new Error("请先登录"));
      return;
    }
    const config = {
      url: `${BASE_URL}${options.url}`,
      method: options.method || "GET",
      timeout: options.timeout || TIMEOUT,
      header: {
        "content-type": options.contentType || "application/json",
        ...options.header
      },
      data: options.data || {},
      success: (res) => {
        common_vendor.index.__f__("log", "at utils/request.js:53", res);
        handleResponse(res, resolve, reject);
      },
      fail: (err) => {
        handleRequestError(err, reject);
      }
    };
    const token = getToken();
    if (token) {
      config.header["Authorization"] = `Bearer ${token}`;
    }
    common_vendor.index.request(config);
  });
}
function handleResponse(res, resolve, reject) {
  const { statusCode, data } = res;
  if (statusCode === 200) {
    if (data.code === 200) {
      resolve(data);
    } else if (data.code === 401) {
      clearToken();
      common_vendor.index.navigateTo({ url: "/pages/login/login" });
      reject(new Error("登录已过期，请重新登录"));
    } else {
      common_vendor.index.showToast({
        title: data.msg || "请求失败",
        icon: "none"
      });
      reject(new Error(data.msg || "业务处理失败"));
    }
  } else if (statusCode === 401) {
    clearToken();
    common_vendor.index.navigateTo({ url: "/pages/login/login" });
    reject(new Error("登录已过期，请重新登录"));
  } else if (statusCode === 403) {
    common_vendor.index.showToast({
      title: "没有权限访问",
      icon: "none"
    });
    reject(new Error("权限不足"));
  } else if (statusCode === 404) {
    common_vendor.index.showToast({
      title: "请求的资源不存在",
      icon: "none"
    });
    reject(new Error("资源不存在"));
  } else if (statusCode === 500) {
    common_vendor.index.showToast({
      title: "服务器内部错误",
      icon: "none"
    });
    reject(new Error("服务器错误"));
  } else {
    common_vendor.index.showToast({
      title: `请求失败: ${statusCode}`,
      icon: "none"
    });
    reject(new Error(`HTTP错误: ${statusCode}`));
  }
}
function handleRequestError(err, reject) {
  common_vendor.index.showToast({
    title: "网络连接失败，请检查网络设置",
    icon: "none"
  });
  common_vendor.index.__f__("error", "at utils/request.js:135", "请求失败:", err);
  reject(new Error("网络连接失败"));
}
const http = {
  get: (url, data = {}, options = {}) => {
    return request({ url, method: "GET", data, ...options });
  },
  post: (url, data = {}, options = {}) => {
    return request({ url, method: "POST", data, ...options });
  },
  put: (url, data = {}, options = {}) => {
    return request({ url, method: "PUT", data, ...options });
  },
  delete: (url, data = {}, options = {}) => {
    return request({ url, method: "DELETE", data, ...options });
  }
};
exports.clearToken = clearToken;
exports.getToken = getToken;
exports.http = http;
exports.isLoggedIn = isLoggedIn;
exports.setToken = setToken;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/request.js.map
