// 复习计划相关接口函数

import { http } from '../utils/request';

/**
 * 更新复习计划（根据艾宾浩斯遗忘曲线）
 * @param {number} noteId - 笔记ID
 * @returns {Promise} 返回更新结果
 */
export async function updateReviewSchedule(noteId) {
  try {
    const res = await http.put(`/reviewSchedule/update?noteId=${encodeURIComponent(noteId)}`, {}, { needLogin: true });
    return res;
  } catch (error) {
    console.error('更新复习计划失败:', error);
    throw error;
  }
}
