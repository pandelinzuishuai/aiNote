// 笔记相关接口函数

import { http } from '../utils/request';

/**
 * 获取笔记列表（分页，支持按创建时间、标签、科目查询）
 * @param {Object} noteQuery - 笔记查询参数
 * @param {number} [noteQuery.currentPage] - 当前页码（可选）
 * @param {number} [noteQuery.pageSize] - 每页数量（可选）
 * @param {number} [noteQuery.userId] - 用户ID（可选）
 * @param {number} [noteQuery.subjectId] - 主题ID（可选）
 * @param {number} [noteQuery.tagId] - 标签ID（可选）
 * @param {string} [noteQuery.title] - 笔记标题（可选）
 * @param {string} [noteQuery.createTimeStart] - 创建开始时间（可选）
 * @param {string} [noteQuery.createTimeEnd] - 创建结束时间（可选）
 * @returns {Promise} 返回笔记列表
 */
export async function getNoteList(noteQuery = {}) {
  try {
    const defaultQuery = {
      currentPage: 1,
      pageSize: 10
    };
    const query = { ...defaultQuery, ...noteQuery };
    const res = await http.post('/note/list', query, { needLogin: true });
    return res;
  } catch (error) {
    console.error('获取笔记列表失败:', error);
    throw error;
  }
}

/**
 * 获取笔记信息
 * @param {number} id - 笔记ID
 * @returns {Promise} 返回笔记详情
 */
export async function getNoteInfo(id) {
  try {
    const res = await http.get(`/note/getInfo?id=${encodeURIComponent(id)}`, {}, { needLogin: true });
    return res;
  } catch (error) {
    console.error('获取笔记信息失败:', error);
    throw error;
  }
}

/**
 * 添加笔记
 * @param {Object} addNoteForm - 添加笔记表单数据
 * @param {number} addNoteForm.userId - 用户ID
 * @param {number} [addNoteForm.subjectId] - 主题ID（可选）
 * @param {number} [addNoteForm.tagId] - 标签ID（可选）
 * @param {string} addNoteForm.title - 笔记标题
 * @param {string} addNoteForm.content - 笔记内容
 * @returns {Promise} 返回添加结果
 */
export async function addNote(addNoteForm) {
  try {
    const res = await http.post('/note/add', addNoteForm, { needLogin: true });
    return res;
  } catch (error) {
    console.error('添加笔记失败:', error);
    throw error;
  }
}

/**
 * 更新笔记信息
 * @param {Object} updateNoteForm - 更新笔记表单数据
 * @param {number} updateNoteForm.noteId - 笔记ID
 * @param {number} [updateNoteForm.subjectId] - 主题ID（可选）
 * @param {number} [updateNoteForm.tagId] - 标签ID（可选）
 * @param {string} [updateNoteForm.title] - 笔记标题（可选）
 * @param {string} [updateNoteForm.content] - 笔记内容（可选）
 * @returns {Promise} 返回更新结果
 */
export async function updateNote(updateNoteForm) {
  try {
    const res = await http.put('/note/update', updateNoteForm, { needLogin: true });
    return res;
  } catch (error) {
    console.error('更新笔记失败:', error);
    throw error;
  }
}

/**
 * 删除笔记
 * @param {number} id - 笔记ID
 * @returns {Promise} 返回删除结果
 */
export async function deleteNote(id) {
  try {
    const res = await http.delete(`/note/delete?id=${encodeURIComponent(id)}`, {}, { needLogin: true });
    return res;
  } catch (error) {
    console.error('删除笔记失败:', error);
    throw error;
  }
}

/**
 * 查询近一周需要复习的笔记
 * @param {number} userId - 用户ID
 * @returns {Promise} 返回复习列表
 */
export async function getReviewNotes(userId) {
  try {
    const res = await http.get(`/note/reviewList?userId=${encodeURIComponent(userId)}`, {}, { needLogin: true });
    return res;
  } catch (error) {
    console.error('获取复习笔记列表失败:', error);
    throw error;
  }
}

/**
 * 导出笔记为PDF
 * @param {number} id - 笔记ID
 * @returns {Promise} 返回导出结果
 */
export async function exportNoteToPdf(id) {
  try {
    const res = await http.get(`/note/exportPdf?id=${encodeURIComponent(id)}`, {}, {
      needLogin: true,
      responseType: 'blob' // 注意：这里可能需要根据后端实际返回类型调整
    });
    return res;
  } catch (error) {
    console.error('导出笔记为PDF失败:', error);
    throw error;
  }
}