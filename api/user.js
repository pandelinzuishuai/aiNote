// 用户相关接口函数

import { http, setToken } from '../utils/request';

/**
 * 用户登录
 * @param {Object} loginForm - 登录表单数据
 * @param {string} loginForm.username - 用户名
 * @param {string} loginForm.password - 密码
 * @returns {Promise} 返回登录结果
 */
export async function userLogin(loginForm) {
  try {
    const res = await http.post('/user/login', loginForm);
    // 保存token
    if (res.data && res.data.token) {
      setToken(res.data.token);
      // 保存用户信息
      uni.setStorageSync('userInfo', res.data.userInfo || {});
    }
    return res;
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
}

/**
 * 用户注册
 * @param {Object} registerForm - 注册表单数据
 * @param {string} registerForm.username - 用户名
 * @param {string} registerForm.password - 密码
 * @param {string} registerForm.email - 邮箱
 * @param {string} registerForm.code - 验证码
 * @param {number} [registerForm.permId=0] - 权限ID（可选）
 * @returns {Promise} 返回注册结果
 */
export async function userRegister(registerForm) {
  try {
    const res = await http.post('/user/register', registerForm);
    return res;
  } catch (error) {
    console.error('注册失败:', error);
    throw error;
  }
}

/**
 * 获取用户信息
 * @param {string} userName - 用户名
 * @returns {Promise} 返回用户信息
 */
export async function getUserInfo(userName) {
  try {
    const res = await http.get(`/user/getUserInfo?userName=${encodeURIComponent(userName)}`, {}, { needLogin: true });
    // 更新本地存储的用户信息
    if (res.data) {
      uni.setStorageSync('userInfo', res.data);
    }
    return res;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
}

/**
 * 发送邮箱验证码
 * @param {string} email - 邮箱地址
 * @returns {Promise} 返回发送结果
 */
export async function sendEmailCode(email) {
  try {
    const res = await http.get(`/user/getEmail_code?email=${encodeURIComponent(email)}`, {});
    return res;
  } catch (error) {
    console.error('发送验证码失败:', error);
    throw error;
  }
}

/**
 * 更新用户信息
 * @param {Object} updateUserForm - 更新用户信息表单数据
 * @param {string} [updateUserForm.name] - 用户姓名（可选）
 * @param {string} [updateUserForm.username] - 用户名（可选）
 * @param {string} [updateUserForm.email] - 邮箱（可选）
 * @param {string} [updateUserForm.phone] - 手机号（可选）
 * @param {string} [updateUserForm.avatar] - 头像URL（可选）
 * @param {number} [updateUserForm.count] - 计数（可选）
 * @param {string} [updateUserForm.idNumber] - 身份证号（可选）
 * @param {number} [updateUserForm.uid] - 用户ID（可选）
 * @returns {Promise} 返回更新结果
 */
export async function updateUserInfo(updateUserForm) {
  try {
    const res = await http.put('/user/updateUserInfo', updateUserForm, { needLogin: true });
    // 更新本地存储的用户信息
    if (res.data) {
      const currentUserInfo = uni.getStorageSync('userInfo') || {};
      uni.setStorageSync('userInfo', { ...currentUserInfo, ...updateUserForm });
    }
    return res;
  } catch (error) {
    console.error('更新用户信息失败:', error);
    throw error;
  }
}

/**
 * 退出登录
 */
export function logout() {
  // 清除token和用户信息
  uni.removeStorageSync('token');
  uni.removeStorageSync('userInfo');
  // 跳转到登录页
  uni.navigateTo({ url: '/pages/login/login' });
}

/**
 * 获取本地存储的用户信息
 * @returns {Object} 用户信息
 */
export function getLocalUserInfo() {
  return uni.getStorageSync('userInfo') || {};
}

/**
 * 检查是否已登录
 * @returns {boolean} 是否已登录
 */
export function isUserLoggedIn() {
  const token = uni.getStorageSync('token');
  return !!token;
}