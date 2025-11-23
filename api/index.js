// API统一管理文件

// 导入用户相关接口
import * as userAPIImport from './user';

// 导入任务相关接口
import * as taskAPIImport from './task';

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