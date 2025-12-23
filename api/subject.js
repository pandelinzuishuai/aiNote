/*
 * @Author: delin66
 * @Date: 2025-12-14 17:48:20
 * @LastEditors: delin66
 * @LastEditTime: 2025-12-14 17:57:45
 * @Descripttion: 
 */
import { http } from '../utils/request';

/**
 * 获取科目列表
 * @param {Object} subjectQuery - 查询参数
 * @param {number} subjectQuery.currentPage - 当前页码
 * @param {number} subjectQuery.pageSize - 每页数量
 * @param {string} subjectQuery.subjectName - 科目名称搜索（可选）
 * @returns {Promise} 包含科目列表的Promise
 */
export const getSubjectList = (subjectQuery = {}) => {
  return http.post('/subject/list', subjectQuery);
};

/**
 * 添加科目
 * @param {Object} subjectData - 科目数据
 * @param {string} subjectData.subjectName - 科目名称
 * @param {string} subjectData.description - 科目描述
 * @returns {Promise} 操作结果Promise
 */
export const addSubject = (subjectData) => {
  return http.post('/subject/add', subjectData);
};

/**
 * 更新科目信息
 * @param {Object} subjectData - 更新的科目数据
 * @param {number} subjectData.subjectId - 科目ID
 * @param {string} subjectData.subjectName - 科目名称
 * @param {string} subjectData.description - 科目描述
 * @returns {Promise} 操作结果Promise
 */
export const updateSubject = (subjectData) => {
  return http.put('/subject/update', subjectData);
};

/**
 * 获取科目详情
 * @param {number} id - 科目ID
 * @returns {Promise} 科目详情Promise
 */
export const getSubjectInfo = (id) => {
  return http.get('/subject/getInfo', { id });
};

/**
 * 删除科目
 * @param {number} id - 科目ID
 * @returns {Promise} 操作结果Promise
 */
export const deleteSubject = (id) => {
  return http.delete('/subject/delete', { id });
};