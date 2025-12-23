/**
 * 存储相关工具函数
 * 用于管理用户token、用户信息等数据的本地存储
 */

// 存储键名常量
const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  REMEMBER_ME: 'remember_me',
  USER_ID: 'userId'
};

/**
 * 存储token
 * @param {string} token - 用户token
 */
export function setToken(token) {
  try {
    uni.setStorageSync(STORAGE_KEYS.TOKEN, token);
  } catch (e) {
    console.error('存储token失败:', e);
  }
}

/**
 * 获取token
 * @returns {string|null} token值或null
 */
export function getToken() {
  try {
    return uni.getStorageSync(STORAGE_KEYS.TOKEN);
  } catch (e) {
    console.error('获取token失败:', e);
    return null;
  }
}

/**
 * 删除token
 */
export function removeToken() {
  try {
    uni.removeStorageSync(STORAGE_KEYS.TOKEN);
  } catch (e) {
    console.error('删除token失败:', e);
  }
}

/**
 * 存储用户信息
 * @param {object} userInfo - 用户信息对象
 */
export function setUserInfo(userInfo) {
  try {
    uni.setStorageSync(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
  } catch (e) {
    console.error('存储用户信息失败:', e);
  }
}

/**
 * 获取用户信息
 * @returns {object|null} 用户信息对象或null
 */
export function getUserInfo() {
  try {
    const userInfo = uni.getStorageSync(STORAGE_KEYS.USER_INFO);
    if (!userInfo) {
      return JSON.parse(userInfo);
    }
    console.log('userInfo', userInfo)
    return userInfo;
  } catch (e) {
    console.error('获取用户信息失败:', e);
    return null;
  }
}

/**
 * 删除用户信息
 */
export function removeUserInfo() {
  try {
    uni.removeStorageSync(STORAGE_KEYS.USER_INFO);
  } catch (e) {
    console.error('删除用户信息失败:', e);
  }
}

/**
 * 设置记住密码状态
 * @param {boolean} remember - 是否记住密码
 * @param {object} credentials - 用户凭证（包含邮箱和密码）
 */
export function setRememberCredentials(remember, credentials = {}) {
  try {
    const data = {
      remember,
      credentials: remember ? credentials : null
    };
    uni.setStorageSync(STORAGE_KEYS.REMEMBER_ME, JSON.stringify(data));
  } catch (e) {
    console.error('设置记住密码状态失败:', e);
  }
}

/**
 * 获取记住的用户凭证
 * @returns {object|null} 记住的凭证信息或null
 */
export function getRememberCredentials() {
  try {
    const data = uni.getStorageSync(STORAGE_KEYS.REMEMBER_ME);
    if (data) {
      const parsed = JSON.parse(data);
      return parsed.remember ? parsed.credentials : null;
    }
    return null;
  } catch (e) {
    console.error('获取记住的凭证失败:', e);
    return null;
  }
}

/**
 * 存储用户ID
 * 同时更新userInfo中的uid属性
 * @param {string|number} userId - 用户ID
 */
export function setUserId(userId) {
  try {
    // 为了兼容性，仍然保存userId
    uni.setStorageSync(STORAGE_KEYS.USER_ID, userId);
    
    // 同时更新userInfo中的uid属性
    const userInfo = getUserInfo();
    if (userInfo && typeof userInfo === 'object') {
      // 创建新的userInfo对象，避免直接修改原对象
      const updatedUserInfo = { ...userInfo, uid: userId };
      setUserInfo(updatedUserInfo);
    }
  } catch (e) {
    console.error('存储用户ID失败:', e);
  }
}

/**
 * 获取用户ID
 * 从userInfo中获取uid属性
 * @returns {string|number|null} 用户ID或null
 */
export function getUserId() {
  try {
    const userInfo = getUserInfo();
    // 确保userInfo是对象并且包含uid属性
    if (userInfo && typeof userInfo === 'object' && 'uid' in userInfo) {
      return userInfo.uid;
    }
    // 为了兼容，当userInfo中没有uid时，尝试从userId存储键获取
    return uni.getStorageSync(STORAGE_KEYS.USER_ID);
  } catch (e) {
    console.error('获取用户ID失败:', e);
    return null;
  }
}

/**
 * 删除用户ID
 * 同时从userInfo中移除uid属性
 */
export function removeUserId() {
  try {
    // 删除userId存储键
    uni.removeStorageSync(STORAGE_KEYS.USER_ID);
    
    // 同时从userInfo中移除uid属性
    const userInfo = getUserInfo();
    if (userInfo && typeof userInfo === 'object' && 'uid' in userInfo) {
      // 创建新的userInfo对象，移除uid属性
      const { uid, ...updatedUserInfo } = userInfo;
      setUserInfo(updatedUserInfo);
    }
  } catch (e) {
    console.error('删除用户ID失败:', e);
  }
}

/**
 * 清除所有用户相关的本地数据
 */
export function clearUserData() {
  removeToken();
  removeUserInfo();
  removeUserId();
}