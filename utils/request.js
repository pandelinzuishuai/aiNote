// 网络请求工具类

// API基础URL
// const BASE_URL = 'http://192.168.249.197:8080';//杨家标热点
// const BASE_URL = 'http://192.168.43.150:8088';//潘德林热点
const BASE_URL = 'http://139.9.179.161:8088';//服务器ip

// 请求超时时间
const TIMEOUT = 30000;

// 获取token
function getToken() {
  return uni.getStorageSync('token');
}

// 设置token
function setToken(token) {
  uni.setStorageSync('token', token);
}

// 清除token
function clearToken() {
  uni.removeStorageSync('token');
}

// 检查是否已登录
function isLoggedIn() {
  return !!getToken();
}

// 网络请求函数
function request(options = {}) {
  return new Promise((resolve, reject) => {
    // 检查是否需要登录但未登录
    if (options.needLogin && !isLoggedIn()) {
      uni.navigateTo({ url: '/pages/login/login' });
      reject(new Error('请先登录'));
      return;
    }

    // 构建请求配置
    const config = {
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      timeout: options.timeout || TIMEOUT,
      header: {
        'content-type': options.contentType || 'application/json',
        ...options.header
      },
      data: options.data || {},
      success: (res) => {
        // 处理响应
        console.log(res)
        handleResponse(res, resolve, reject);
      },
      fail: (err) => {
        // 处理失败
        handleRequestError(err, reject);
      }
    };

    // 添加token（如果有）
    const token = getToken();
    if (token) {
      config.header['Authorization'] = `Bearer ${token}`;
    }

    // 发送请求
    uni.request(config);
  });
}

// 处理响应
function handleResponse(res, resolve, reject) {
  const { statusCode, data } = res;

  // 处理HTTP状态码
  if (statusCode === 200) {
    // 处理业务逻辑
    if (data.code === 200) {
      // 请求成功
      resolve(data);
    } else if (data.code === 401) {
      // Token过期或无效
      clearToken();
      uni.navigateTo({ url: '/pages/login/login' });
      reject(new Error('登录已过期，请重新登录'));
    } else {
      // 业务错误
      uni.showToast({
        title: data.msg || '请求失败',
        icon: 'none'
      });
      reject(new Error(data.msg || '业务处理失败'));
    }
  } else if (statusCode === 401) {
    // Token过期或无效
    clearToken();
    uni.navigateTo({ url: '/pages/login/login' });
    reject(new Error('登录已过期，请重新登录'));
  } else if (statusCode === 403) {
    uni.showToast({
      title: '没有权限访问',
      icon: 'none'
    });
    reject(new Error('权限不足'));
  } else if (statusCode === 404) {
    uni.showToast({
      title: '请求的资源不存在',
      icon: 'none'
    });
    reject(new Error('资源不存在'));
  } else if (statusCode === 500) {
    uni.showToast({
      title: '服务器内部错误',
      icon: 'none'
    });
    reject(new Error('服务器错误'));
  } else {
    uni.showToast({
      title: `请求失败: ${statusCode}`,
      icon: 'none'
    });
    reject(new Error(`HTTP错误: ${statusCode}`));
  }
}

// 处理请求失败
function handleRequestError(err, reject) {
  // 网络错误处理
  uni.showToast({
    title: '网络连接失败，请检查网络设置',
    icon: 'none'
  });
  console.error('请求失败:', err);
  reject(new Error('网络连接失败'));
}

// 导出常用请求方法
const http = {
  get: (url, data = {}, options = {}) => {
    return request({ url, method: 'GET', data, ...options });
  },
  post: (url, data = {}, options = {}) => {
    return request({ url, method: 'POST', data, ...options });
  },
  put: (url, data = {}, options = {}) => {
    return request({ url, method: 'PUT', data, ...options });
  },
  delete: (url, data = {}, options = {}) => {
    return request({ url, method: 'DELETE', data, ...options });
  }
};

// 导出工具函数
export {
  http,
  getToken,
  setToken,
  clearToken,
  isLoggedIn
};

export default http;