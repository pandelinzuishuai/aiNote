"use strict";
const common_vendor = require("../common/vendor.js");
const utils_request = require("../utils/request.js");
async function getTodayTasks(queryParams = {}) {
  try {
    const defaultQuery = {
      currentPage: 1,
      pageSize: 10
    };
    const query = { ...defaultQuery, ...queryParams };
    const res = await utils_request.http.post("/task/getTodo", query, { needLogin: true });
    return res;
  } catch (error) {
    common_vendor.index.__f__("error", "at api/task.js:23", "获取今日待办任务失败:", error);
    throw error;
  }
}
async function getUpcomingTasks(queryParams = {}) {
  try {
    const defaultQuery = {
      currentPage: 1,
      pageSize: 10
    };
    const query = { ...defaultQuery, ...queryParams };
    const res = await utils_request.http.post("/task/getDeadline", query, { needLogin: true });
    return res;
  } catch (error) {
    common_vendor.index.__f__("error", "at api/task.js:46", "获取即将截止任务失败:", error);
    throw error;
  }
}
async function getTaskList(taskQuery = {}) {
  try {
    const defaultQuery = {
      currentPage: 1,
      pageSize: 10
    };
    const query = { ...defaultQuery, ...taskQuery };
    const res = await utils_request.http.post("/task/list", query, { needLogin: true });
    return res;
  } catch (error) {
    common_vendor.index.__f__("error", "at api/task.js:74", "获取任务列表失败:", error);
    throw error;
  }
}
async function getTaskInfo(id) {
  try {
    const res = await utils_request.http.get(`/task/getInfo?id=${encodeURIComponent(id)}`, {}, { needLogin: true });
    return res;
  } catch (error) {
    common_vendor.index.__f__("error", "at api/task.js:89", "获取任务信息失败:", error);
    throw error;
  }
}
async function addTask(addTaskForm) {
  try {
    const res = await utils_request.http.post("/task/add", addTaskForm, { needLogin: true });
    return res;
  } catch (error) {
    common_vendor.index.__f__("error", "at api/task.js:112", "添加任务失败:", error);
    throw error;
  }
}
async function updateTask(updateTaskForm) {
  try {
    const res = await utils_request.http.put("/task/update", updateTaskForm, { needLogin: true });
    return res;
  } catch (error) {
    common_vendor.index.__f__("error", "at api/task.js:134", "更新任务失败:", error);
    throw error;
  }
}
async function deleteTask(id) {
  try {
    const res = await utils_request.http.delete(`/task/delete?id=${encodeURIComponent(id)}`, {}, { needLogin: true });
    return res;
  } catch (error) {
    common_vendor.index.__f__("error", "at api/task.js:149", "删除任务失败:", error);
    throw error;
  }
}
async function getTasksByIds(ids) {
  try {
    const tasks = await Promise.all(ids.map((id) => getTaskInfo(id)));
    return {
      code: 0,
      msg: "success",
      data: tasks.map((task) => task.data)
    };
  } catch (error) {
    common_vendor.index.__f__("error", "at api/task.js:169", "批量获取任务失败:", error);
    throw error;
  }
}
async function updateTaskStatus(taskId, status) {
  try {
    const res = await updateTask({
      taskId,
      status,
      // 如果状态是已完成，自动设置完成时间
      finishTime: status === "已完成" ? (/* @__PURE__ */ new Date()).toISOString() : void 0
    });
    return res;
  } catch (error) {
    common_vendor.index.__f__("error", "at api/task.js:190", "更新任务状态失败:", error);
    throw error;
  }
}
async function getTaskStatistics(userId) {
  try {
    const taskList = await getTaskList({ userId });
    if (taskList.code === 0 && taskList.data) {
      const tasks = taskList.data.list || [];
      const statistics = {
        total: tasks.length,
        pending: tasks.filter((task) => task.status === "pending").length,
        inProgress: tasks.filter((task) => task.status === "in_progress").length,
        completed: tasks.filter((task) => task.status === "completed").length,
        overdue: tasks.filter((task) => {
          return task.status !== "completed" && task.deadline && new Date(task.deadline) < /* @__PURE__ */ new Date();
        }).length
      };
      return {
        code: 0,
        msg: "success",
        data: statistics
      };
    }
    throw new Error("获取任务列表失败");
  } catch (error) {
    common_vendor.index.__f__("error", "at api/task.js:223", "获取任务统计失败:", error);
    throw error;
  }
}
exports.addTask = addTask;
exports.deleteTask = deleteTask;
exports.getTaskInfo = getTaskInfo;
exports.getTaskList = getTaskList;
exports.getTaskStatistics = getTaskStatistics;
exports.getTasksByIds = getTasksByIds;
exports.getTodayTasks = getTodayTasks;
exports.getUpcomingTasks = getUpcomingTasks;
exports.updateTask = updateTask;
exports.updateTaskStatus = updateTaskStatus;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/task.js.map
