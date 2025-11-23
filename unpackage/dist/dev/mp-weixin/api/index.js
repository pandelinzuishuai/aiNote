"use strict";
const api_user = require("./user.js");
const api_task = require("./task.js");
const utils_request = require("../utils/request.js");
const API = {
  // 用户相关API
  user: {
    login: api_user.userLogin,
    register: api_user.userRegister,
    getUserInfo: api_user.getUserInfo,
    sendEmailCode: api_user.sendEmailCode,
    updateUserInfo: api_user.updateUserInfo,
    logout: api_user.logout,
    getLocalUserInfo: api_user.getLocalUserInfo,
    isLoggedIn: api_user.isUserLoggedIn
  },
  // 任务相关API
  task: {
    getList: api_task.getTaskList,
    getInfo: api_task.getTaskInfo,
    add: api_task.addTask,
    update: api_task.updateTask,
    delete: api_task.deleteTask,
    getByIds: api_task.getTasksByIds,
    updateStatus: api_task.updateTaskStatus,
    getStatistics: api_task.getTaskStatistics
  },
  // 工具函数
  utils: {
    http: utils_request.http,
    getToken: utils_request.getToken,
    setToken: utils_request.setToken,
    clearToken: utils_request.clearToken,
    isLoggedIn: utils_request.isLoggedIn
  }
};
const userAPI = API.user;
exports.userAPI = userAPI;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/index.js.map
