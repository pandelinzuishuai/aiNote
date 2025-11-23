"use strict";
const common_vendor = require("../common/vendor.js");
const utils_request = require("../utils/request.js");
async function userLogin(loginForm) {
  try {
    const res = await utils_request.http.post("/user/login", loginForm);
    if (res.data && res.data.token) {
      utils_request.setToken(res.data.token);
      common_vendor.index.setStorageSync("userInfo", res.data.userInfo || {});
    }
    return res;
  } catch (error) {
    common_vendor.index.__f__("error", "at api/user.js:23", "登录失败:", error);
    throw error;
  }
}
async function userRegister(registerForm) {
  try {
    const res = await utils_request.http.post("/user/register", registerForm);
    return res;
  } catch (error) {
    common_vendor.index.__f__("error", "at api/user.js:43", "注册失败:", error);
    throw error;
  }
}
async function getUserInfo(userName) {
  try {
    const res = await utils_request.http.get(`/user/getUserInfo?userName=${encodeURIComponent(userName)}`, {}, { needLogin: true });
    if (res.data) {
      common_vendor.index.setStorageSync("userInfo", res.data);
    }
    return res;
  } catch (error) {
    common_vendor.index.__f__("error", "at api/user.js:62", "获取用户信息失败:", error);
    throw error;
  }
}
async function sendEmailCode(email) {
  try {
    const res = await utils_request.http.get(`/user/getEmail_code?email=${encodeURIComponent(email)}`, {});
    return res;
  } catch (error) {
    common_vendor.index.__f__("error", "at api/user.js:77", "发送验证码失败:", error);
    throw error;
  }
}
async function updateUserInfo(updateUserForm) {
  try {
    const res = await utils_request.http.put("/user/updateUserInfo", updateUserForm, { needLogin: true });
    if (res.data) {
      const currentUserInfo = common_vendor.index.getStorageSync("userInfo") || {};
      common_vendor.index.setStorageSync("userInfo", { ...currentUserInfo, ...updateUserForm });
    }
    return res;
  } catch (error) {
    common_vendor.index.__f__("error", "at api/user.js:105", "更新用户信息失败:", error);
    throw error;
  }
}
function logout() {
  common_vendor.index.removeStorageSync("token");
  common_vendor.index.removeStorageSync("userInfo");
  common_vendor.index.navigateTo({ url: "/pages/login/login" });
}
function getLocalUserInfo() {
  return common_vendor.index.getStorageSync("userInfo") || {};
}
function isUserLoggedIn() {
  const token = common_vendor.index.getStorageSync("token");
  return !!token;
}
exports.getLocalUserInfo = getLocalUserInfo;
exports.getUserInfo = getUserInfo;
exports.isUserLoggedIn = isUserLoggedIn;
exports.logout = logout;
exports.sendEmailCode = sendEmailCode;
exports.updateUserInfo = updateUserInfo;
exports.userLogin = userLogin;
exports.userRegister = userRegister;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/user.js.map
