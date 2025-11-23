"use strict";
const common_vendor = require("../common/vendor.js");
const STORAGE_KEYS = {
  TOKEN: "token",
  USER_INFO: "userInfo",
  REMEMBER_ME: "remember_me",
  USER_ID: "userId"
};
function getToken() {
  try {
    return common_vendor.index.getStorageSync(STORAGE_KEYS.TOKEN);
  } catch (e) {
    common_vendor.index.__f__("error", "at utils/storage.js:34", "获取token失败:", e);
    return null;
  }
}
function removeToken() {
  try {
    common_vendor.index.removeStorageSync(STORAGE_KEYS.TOKEN);
  } catch (e) {
    common_vendor.index.__f__("error", "at utils/storage.js:46", "删除token失败:", e);
  }
}
function setUserInfo(userInfo) {
  try {
    common_vendor.index.setStorageSync(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
  } catch (e) {
    common_vendor.index.__f__("error", "at utils/storage.js:58", "存储用户信息失败:", e);
  }
}
function getUserInfo() {
  try {
    const userInfo = common_vendor.index.getStorageSync(STORAGE_KEYS.USER_INFO);
    common_vendor.index.__f__("log", "at utils/storage.js:69", "userInfo", userInfo);
    return userInfo;
  } catch (e) {
    common_vendor.index.__f__("error", "at utils/storage.js:72", "获取用户信息失败:", e);
    return null;
  }
}
function removeUserInfo() {
  try {
    common_vendor.index.removeStorageSync(STORAGE_KEYS.USER_INFO);
  } catch (e) {
    common_vendor.index.__f__("error", "at utils/storage.js:84", "删除用户信息失败:", e);
  }
}
function getUserId() {
  try {
    const userInfo = getUserInfo();
    if (userInfo && typeof userInfo === "object" && "uid" in userInfo) {
      return userInfo.uid;
    }
    return common_vendor.index.getStorageSync(STORAGE_KEYS.USER_ID);
  } catch (e) {
    common_vendor.index.__f__("error", "at utils/storage.js:160", "获取用户ID失败:", e);
    return null;
  }
}
function removeUserId() {
  try {
    common_vendor.index.removeStorageSync(STORAGE_KEYS.USER_ID);
    const userInfo = getUserInfo();
    if (userInfo && typeof userInfo === "object" && "uid" in userInfo) {
      const { uid, ...updatedUserInfo } = userInfo;
      setUserInfo(updatedUserInfo);
    }
  } catch (e) {
    common_vendor.index.__f__("error", "at utils/storage.js:182", "删除用户ID失败:", e);
  }
}
function clearUserData() {
  removeToken();
  removeUserInfo();
  removeUserId();
}
exports.clearUserData = clearUserData;
exports.getToken = getToken;
exports.getUserId = getUserId;
exports.getUserInfo = getUserInfo;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/storage.js.map
