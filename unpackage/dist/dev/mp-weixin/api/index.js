"use strict";
const api_user = require("./user.js");
const api_task = require("./task.js");
const api_tag = require("./tag.js");
const api_note = require("./note.js");
const api_reviewSchedule = require("./reviewSchedule.js");
const api_minio = require("./minio.js");
const api_ocr = require("./ocr.js");
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
  // 标签相关API
  tag: {
    getList: api_tag.getTagList,
    getInfo: api_tag.getTagInfo,
    add: api_tag.addTag,
    update: api_tag.updateTag,
    delete: api_tag.deleteTag
  },
  // 笔记相关API
  note: {
    getList: api_note.getNoteList,
    getInfo: api_note.getNoteInfo,
    add: api_note.addNote,
    update: api_note.updateNote,
    delete: api_note.deleteNote,
    getReviewList: api_note.getReviewNotes,
    exportPdf: api_note.exportNoteToPdf
  },
  // 复习计划相关API
  reviewSchedule: {
    update: api_reviewSchedule.updateReviewSchedule
  },
  // MinIO文件上传相关API
  minio: {
    uploadFile: api_minio.uploadFile,
    deleteFile: api_minio.deleteFile,
    uploadMultipleFiles: api_minio.uploadMultipleFiles
  },
  // OCR相关API
  ocr: api_ocr.ocrAPI,
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
