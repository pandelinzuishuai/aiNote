/*
 * @Author: delin66
 * @Date: 2025-12-12 16:33:52
 * @LastEditors: delin66
 * @LastEditTime: 2025-12-13 15:13:48
 * @Descripttion: 
 */
// OCR文字识别API
import { http } from '../utils/request';

/**
 * OCR API模块
 */
const ocrAPI = {
  /**
   * 识别图片中的文字
   * @param {File|string} filePath - 图片文件对象或文件路径（临时兼容）
   * @returns {Promise} 识别结果
   */
  recognizeText(filePath) {
    return new Promise((resolve, reject) => {
      try {
        uni.uploadFile({
          url: "http://139.9.179.161:8088/ocr/extractText",
          filePath: filePath,
          name: "file",
          success: (uploadRes) => {
            const data = JSON.parse(uploadRes.data);
            console.log("上传成功:", data.url);
            console.log(data);
            // 提取OCR识别结果
            if (data.code == 200) {
              // 去除OCR识别结果中的空格
              resolve(data.data.text)
              
            } else {
              reject(data.msg)
            }
          },
        });
      } catch (error) {
        console.error('OCR识别过程中发生错误:', error);
        reject(error);
      }
    });
  },
  recommendLabel(filePath) {
    return new Promise((resolve, reject) => {
      try {
        uni.uploadFile({
          url: "http://139.9.179.161:8088/ocr/extractTextAndTags",
          filePath: filePath,
          name: "file",
          success: (uploadRes) => {
            const data = JSON.parse(uploadRes.data);
            console.log("上传成功:", data.url);
            console.log(data);
            // 提取OCR识别结果
            if (data.code == 200) {
              // 获取标签结果
              resolve(data.data)
              
            } else {
              reject(data.msg)
            }
          },
        });
      } catch (error) {
        console.error('OCR识别过程中发生错误:', error);
        reject(error);
      }
    });
  }
};

export default ocrAPI;