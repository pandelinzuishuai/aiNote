// MinIO文件上传相关接口函数

import { http } from '../utils/request';

/**
 * 上传图片到MinIO服务器
 * @param {string} filePath - 本地文件路径
 * @param {string} [fileName] - 文件名（可选）
 * @param {Object} [formData] - 额外的表单数据（可选）
 * @returns {Promise} 返回上传结果，包含文件URL等信息
 */
export async function uploadFile(filePath, fileName, formData = {}) {
  try {
    // 使用uni.uploadFile API进行文件上传
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: `${http.baseUrl || 'http://139.9.179.161:8088'}/minio/upload`,
        filePath: filePath,
        name: 'file',
        formData: {
          fileName: fileName || '',
          ...formData
        },
        header: {
          'content-type': 'multipart/form-data',
          'Authorization': `Bearer ${uni.getStorageSync('token') || ''}`
        },
        success: (res) => {
          try {
            // 尝试解析JSON响应
            const data = JSON.parse(res.data);
            if (data.code === 200) {
              resolve(data);
            } else {
              reject(new Error(data.msg || '上传失败'));
            }
          } catch (e) {
            // 如果响应不是有效的JSON，直接返回响应内容
            console.error('解析响应数据失败:', e);
            reject(new Error('上传响应数据格式错误'));
          }
        },
        fail: (error) => {
          console.error('上传文件失败:', error);
          reject(new Error('网络请求失败，请检查网络连接'));
        }
      });
    });
  } catch (error) {
    console.error('上传文件异常:', error);
    throw error;
  }
}

/**
 * 从MinIO服务器删除文件
 * @param {string} objectName - 文件对象名称
 * @returns {Promise} 返回删除结果
 */
export async function deleteFile(objectName) {
  try {
    const res = await http.delete(`/minio/delete?objectName=${encodeURIComponent(objectName)}`, {}, { needLogin: true });
    return res;
  } catch (error) {
    console.error('删除文件失败:', error);
    throw error;
  }
}

/**
 * 上传多个文件
 * @param {Array} filePaths - 文件路径数组
 * @param {Function} [onProgress] - 进度回调函数 (current, total) => void
 * @returns {Promise} 返回所有文件的上传结果数组
 */
export async function uploadMultipleFiles(filePaths, onProgress) {
  const results = [];
  const total = filePaths.length;
  
  for (let i = 0; i < total; i++) {
    try {
      const result = await uploadFile(filePaths[i]);
      results.push(result);
      
      // 调用进度回调
      if (onProgress && typeof onProgress === 'function') {
        onProgress(i + 1, total);
      }
    } catch (error) {
      results.push({ success: false, error: error.message, index: i });
    }
  }
  
  return results;
}