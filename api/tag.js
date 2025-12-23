// 标签相关接口函数

import { http } from '../utils/request';

/**
 * 获取标签列表（分页）
 * @param {Object} tagQuery - 标签查询参数
 * @param {number} [tagQuery.currentPage] - 当前页码（可选）
 * @param {number} [tagQuery.pageSize] - 每页数量（可选）
 * @returns {Promise} 返回标签列表
 */
export async function getTagList(tagQuery = {}) {
  try {
    const defaultQuery = {
      currentPage: 1,
      pageSize: 10
    };
    const query = { ...defaultQuery, ...tagQuery };
    const res = await http.post('/tag/list', query, { needLogin: true });
    return res;
  } catch (error) {
    console.error('获取标签列表失败:', error);
    throw error;
  }
}

/**
 * 获取标签信息
 * @param {number} id - 标签ID
 * @returns {Promise} 返回标签详情
 */
export async function getTagInfo(id) {
  try {
    const res = await http.get(`/tag/getInfo?id=${encodeURIComponent(id)}`, {}, { needLogin: true });
    return res;
  } catch (error) {
    console.error('获取标签信息失败:', error);
    throw error;
  }
}

/**
 * 添加标签
 * @param {Object} addTagForm - 添加标签表单数据
 * @param {string} addTagForm.tagName - 标签名称
 * @returns {Promise} 返回添加结果
 */
export async function addTag(addTagForm) {
  try {
    const res = await http.post('/tag/add', addTagForm, { needLogin: true });
    return res;
  } catch (error) {
    console.error('添加标签失败:', error);
    throw error;
  }
}

/**
 * 更新标签信息
 * @param {Object} updateTagForm - 更新标签表单数据
 * @param {number} updateTagForm.tagId - 标签ID
 * @param {string} updateTagForm.tagName - 标签名称
 * @returns {Promise} 返回更新结果
 */
export async function updateTag(updateTagForm) {
  try {
    const res = await http.put('/tag/update', updateTagForm, { needLogin: true });
    return res;
  } catch (error) {
    console.error('更新标签失败:', error);
    throw error;
  }
}

/**
 * 删除标签
 * @param {number} id - 标签ID
 * @returns {Promise} 返回删除结果
 */
export async function deleteTag(id) {
  try {
    const res = await http.delete(`/tag/delete?id=${encodeURIComponent(id)}`, {}, { needLogin: true });
    return res;
  } catch (error) {
    console.error('删除标签失败:', error);
    throw error;
  }
}
