// API统一管理文件

// 导入用户相关接口
import * as userAPIImport from './user';

// 导入任务相关接口
import * as taskAPIImport from './task';

// 导入标签相关接口
import * as tagAPIImport from './tag';

// 导入笔记相关接口
import * as noteAPIImport from './note';

// 导入复习计划相关接口
import * as reviewScheduleAPIImport from './reviewSchedule';

// 导入MinIO文件上传相关接口
import * as minioAPIImport from './minio';

// 导入OCR相关接口
import ocrAPIImport from './ocr';

// 导入网络请求工具
import { http, getToken, setToken, clearToken, isLoggedIn } from '../utils/request';

// 导出所有API
export const API = {
  // 用户相关API
  user: {
    login: userAPIImport.userLogin,
    register: userAPIImport.userRegister,
    getUserInfo: userAPIImport.getUserInfo,
    sendEmailCode: userAPIImport.sendEmailCode,
    updateUserInfo: userAPIImport.updateUserInfo,
    logout: userAPIImport.logout,
    getLocalUserInfo: userAPIImport.getLocalUserInfo,
    isLoggedIn: userAPIImport.isUserLoggedIn
  },
  // 任务相关API
  task: {
    getList: taskAPIImport.getTaskList,
    getInfo: taskAPIImport.getTaskInfo,
    add: taskAPIImport.addTask,
    update: taskAPIImport.updateTask,
    delete: taskAPIImport.deleteTask,
    getByIds: taskAPIImport.getTasksByIds,
    updateStatus: taskAPIImport.updateTaskStatus,
    getStatistics: taskAPIImport.getTaskStatistics
  },
  // 标签相关API
  tag: {
    getList: tagAPIImport.getTagList,
    getInfo: tagAPIImport.getTagInfo,
    add: tagAPIImport.addTag,
    update: tagAPIImport.updateTag,
    delete: tagAPIImport.deleteTag
  },
  // 笔记相关API
  note: {
    getList: noteAPIImport.getNoteList,
    getInfo: noteAPIImport.getNoteInfo,
    add: noteAPIImport.addNote,
    update: noteAPIImport.updateNote,
    delete: noteAPIImport.deleteNote,
    getReviewList: noteAPIImport.getReviewNotes,
    exportPdf: noteAPIImport.exportNoteToPdf
  },
  // 复习计划相关API
  reviewSchedule: {
    update: reviewScheduleAPIImport.updateReviewSchedule
  },
  // MinIO文件上传相关API
  minio: {
    uploadFile: minioAPIImport.uploadFile,
    deleteFile: minioAPIImport.deleteFile,
    uploadMultipleFiles: minioAPIImport.uploadMultipleFiles
  },
  // OCR相关API
  ocr: ocrAPIImport,
  // 工具函数
  utils: {
    http,
    getToken,
    setToken,
    clearToken,
    isLoggedIn
  }
};

// 默认导出
export default API;

// 直接导出常用API，方便使用
export const userAPI = API.user;
export const taskAPI = API.task;
export const tagAPI = API.tag;
export const noteAPI = API.note;
export const reviewScheduleAPI = API.reviewSchedule;
export const minioAPI = API.minio;
export const ocrAPI = API.ocr;
export const apiUtils = API.utils;

/**
 * 使用示例：
 * 
 * // 导入API
 * import { API, userAPI, taskAPI } from '@/api';
 * 
 * // 登录示例
 * async function login(username, password) {
 *   try {
 *     const res = await userAPI.login({ username, password });
 *     console.log('登录成功:', res);
 *     return res;
 *   } catch (error) {
 *     console.error('登录失败:', error);
 *   }
 * }
 * 
 * // 获取任务列表示例
 * async function fetchTasks() {
 *   try {
 *     const res = await taskAPI.getList({ userId: 1, status: 'pending' });
 *     console.log('任务列表:', res);
 *     return res;
 *   } catch (error) {
 *     console.error('获取任务列表失败:', error);
 *   }
 * }
 */