// 任务相关接口函数

import { http } from '../utils/request';

/**
 * 获取今日待办任务
 * @param {Object} queryParams - 查询参数
 * @param {number} [queryParams.currentPage=1] - 当前页码
 * @param {number} [queryParams.pageSize=10] - 每页数量
 * @param {number} queryParams.userId - 用户ID
 * @returns {Promise} 返回今日待办任务列表
 */
export async function getTodayTasks(queryParams = {}) {
  try {
    const defaultQuery = {
      currentPage: 1,
      pageSize: 10
    };
    const query = { ...defaultQuery, ...queryParams };
    const res = await http.post('/task/getTodo', query, { needLogin: true });
    return res;
  } catch (error) {
    console.error('获取今日待办任务失败:', error);
    throw error;
  }
}

/**
 * 获取即将截止任务（3天内）
 * @param {Object} queryParams - 查询参数
 * @param {number} [queryParams.currentPage=1] - 当前页码
 * @param {number} [queryParams.pageSize=10] - 每页数量
 * @param {number} queryParams.userId - 用户ID
 * @returns {Promise} 返回即将截止任务列表
 */
export async function getUpcomingTasks(queryParams = {}) {
  try {
    const defaultQuery = {
      currentPage: 1,
      pageSize: 10
    };
    const query = { ...defaultQuery, ...queryParams };
    const res = await http.post('/task/getDeadline', query, { needLogin: true });
    return res;
  } catch (error) {
    console.error('获取即将截止任务失败:', error);
    throw error;
  }
}

/**
 * 获取任务列表
 * @param {Object} taskQuery - 任务查询参数
 * @param {number} [taskQuery.currentPage] - 当前页码（可选）
 * @param {number} [taskQuery.pageSize] - 每页数量（可选）
 * @param {number} [taskQuery.userId] - 用户ID（可选）
 * @param {number} [taskQuery.subjectId] - 主题ID（可选）
 * @param {string} [taskQuery.taskName] - 任务名称（可选）
 * @param {string} [taskQuery.priority] - 优先级（可选）
 * @param {string} [taskQuery.status] - 状态（可选）
 * @returns {Promise} 返回任务列表
 */
export async function getTaskList(taskQuery = {}) {
  try {
    const defaultQuery = {
      currentPage: 1,
      pageSize: 10
    };
    const query = { ...defaultQuery, ...taskQuery };
    // 根据API文档，修改为POST请求，参数放在body中
    const res = await http.post('/task/list', query, { needLogin: true });
    return res;
  } catch (error) {
    console.error('获取任务列表失败:', error);
    throw error;
  }
}

/**
 * 获取任务信息
 * @param {number} id - 任务ID
 * @returns {Promise} 返回任务详情
 */
export async function getTaskInfo(id) {
  try {
    const res = await http.get(`/task/getInfo?id=${encodeURIComponent(id)}`, {}, { needLogin: true });
    return res;
  } catch (error) {
    console.error('获取任务信息失败:', error);
    throw error;
  }
}

/**
 * 添加任务
 * @param {Object} addTaskForm - 添加任务表单数据
 * @param {number} addTaskForm.userId - 用户ID
 * @param {number} [addTaskForm.subjectId] - 主题ID（可选）
 * @param {string} [addTaskForm.tagId] - 标签ID，逗号分隔的字符串（可选）
 * @param {string} addTaskForm.taskName - 任务名称
 * @param {string} [addTaskForm.description] - 任务描述（可选）
 * @param {string} [addTaskForm.deadline] - 截止时间（可选）
 * @param {string} [addTaskForm.remindTime] - 提醒时间（可选）
 * @param {string} [addTaskForm.priority] - 优先级（可选）
 * @returns {Promise} 返回添加结果
 */
export async function addTask(addTaskForm) {
  try {
    const res = await http.post('/task/add', addTaskForm, { needLogin: true });
    return res;
  } catch (error) {
    console.error('添加任务失败:', error);
    throw error;
  }
}

/**
 * 更新任务信息
 * @param {Object} updateTaskForm - 更新任务表单数据
 * @param {number} updateTaskForm.taskId - 任务ID
 * @param {string} [updateTaskForm.taskName] - 任务名称（可选）
 * @param {string} [updateTaskForm.description] - 任务描述（可选）
 * @param {string} [updateTaskForm.deadline] - 截止时间（可选）
 * @param {string} [updateTaskForm.priority] - 优先级（可选）
 * @param {string} [updateTaskForm.status] - 状态（可选）
 * @param {string} [updateTaskForm.finishTime] - 完成时间（可选）
 * @returns {Promise} 返回更新结果
 */
export async function updateTask(updateTaskForm) {
  try {
    const res = await http.put('/task/update', updateTaskForm, { needLogin: true });
    return res;
  } catch (error) {
    console.error('更新任务失败:', error);
    throw error;
  }
}

/**
 * 删除任务
 * @param {number} id - 任务ID
 * @returns {Promise} 返回删除结果
 */
export async function deleteTask(id) {
  try {
    const res = await http.delete(`/task/delete?id=${encodeURIComponent(id)}`, {}, { needLogin: true });
    return res;
  } catch (error) {
    console.error('删除任务失败:', error);
    throw error;
  }
}

/**
 * 批量获取任务信息
 * @param {Array<number>} ids - 任务ID数组
 * @returns {Promise} 返回任务列表
 */
export async function getTasksByIds(ids) {
  try {
    // 这里假设后端有批量获取任务的接口，如果没有，可以通过循环调用getTaskInfo实现
    const tasks = await Promise.all(ids.map(id => getTaskInfo(id)));
    return {
      code: 0,
      msg: 'success',
      data: tasks.map(task => task.data)
    };
  } catch (error) {
    console.error('批量获取任务失败:', error);
    throw error;
  }
}

/**
 * 更新任务状态
 * @param {number} taskId - 任务ID
 * @param {string} status - 新状态
 * @returns {Promise} 返回更新结果
 */
export async function updateTaskStatus(taskId, status) {
  try {
    const res = await updateTask({
      taskId,
      status,
      // 如果状态是已完成，自动设置完成时间
      finishTime: status === '已完成' ? new Date().toISOString() : undefined
    });
    return res;
  } catch (error) {
    console.error('更新任务状态失败:', error);
    throw error;
  }
}

/**
 * 获取任务统计信息
 * @param {number} userId - 用户ID
 * @returns {Promise} 返回统计结果
 */
export async function getTaskStatistics(userId) {
  try {
    // 这里假设后端有统计接口，如果没有，可以通过获取任务列表后本地计算
    const taskList = await getTaskList({ userId });
    if (taskList.code === 0 && taskList.data) {
      const tasks = taskList.data.list || [];
      const statistics = {
        total: tasks.length,
        pending: tasks.filter(task => task.status === 'pending').length,
        inProgress: tasks.filter(task => task.status === 'in_progress').length,
        completed: tasks.filter(task => task.status === 'completed').length,
        overdue: tasks.filter(task => {
          return task.status !== 'completed' && task.deadline && new Date(task.deadline) < new Date();
        }).length
      };
      return {
        code: 0,
        msg: 'success',
        data: statistics
      };
    }
    throw new Error('获取任务列表失败');
  } catch (error) {
    console.error('获取任务统计失败:', error);
    throw error;
  }
}