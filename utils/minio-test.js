// MinIO API测试工具
import { minioAPI } from '../api';

/**
 * 测试MinIO上传功能
 * @param {string} filePath - 要上传的文件路径
 * @returns {Promise} 上传结果
 */
export const testMinioUpload = async (filePath) => {
  try {
    console.log('开始测试MinIO上传功能...');
    console.log('上传文件路径:', filePath);
    
    // 调用上传API
    const result = await minioAPI.uploadFile(filePath);
    
    console.log('MinIO上传测试成功!');
    console.log('上传结果:', result);
    
    return {
      success: true,
      data: result,
      message: 'MinIO上传功能测试成功'
    };
  } catch (error) {
    console.error('MinIO上传测试失败:', error);
    
    return {
      success: false,
      error: error.message || '未知错误',
      message: 'MinIO上传功能测试失败'
    };
  }
};

/**
 * 测试MinIO删除功能
 * @param {string} objectName - 要删除的对象名称
 * @returns {Promise} 删除结果
 */
export const testMinioDelete = async (objectName) => {
  try {
    console.log('开始测试MinIO删除功能...');
    console.log('删除对象名称:', objectName);
    
    // 调用删除API
    const result = await minioAPI.deleteFile(objectName);
    
    console.log('MinIO删除测试成功!');
    console.log('删除结果:', result);
    
    return {
      success: true,
      data: result,
      message: 'MinIO删除功能测试成功'
    };
  } catch (error) {
    console.error('MinIO删除测试失败:', error);
    
    return {
      success: false,
      error: error.message || '未知错误',
      message: 'MinIO删除功能测试失败'
    };
  }
};

/**
 * 执行完整的MinIO功能测试流程
 * @param {string} filePath - 要测试的文件路径
 * @returns {Promise} 完整测试结果
 */
export const runMinioTestSuite = async (filePath) => {
  console.log('开始MinIO API功能测试套件...');
  
  // 记录测试结果
  const testResults = {
    upload: null,
    delete: null,
    overall: {}
  };
  
  try {
    // 1. 测试上传功能
    testResults.upload = await testMinioUpload(filePath);
    
    // 如果上传成功，继续测试删除功能
    if (testResults.upload.success && testResults.upload.data && testResults.upload.data.objectName) {
      const objectName = testResults.upload.data.objectName;
      testResults.delete = await testMinioDelete(objectName);
    }
    
    // 计算总体测试结果
    testResults.overall = {
      success: testResults.upload.success,
      message: testResults.upload.success 
        ? 'MinIO API基本功能测试通过' 
        : 'MinIO API测试未全部通过'
    };
    
    console.log('MinIO API功能测试套件完成!');
    console.log('测试结果汇总:', testResults);
    
    return testResults;
  } catch (error) {
    console.error('测试套件执行失败:', error);
    
    testResults.overall = {
      success: false,
      error: error.message || '未知错误',
      message: '测试套件执行失败'
    };
    
    return testResults;
  }
};