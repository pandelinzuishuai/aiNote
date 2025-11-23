# API接口文档


**简介**:API接口文档


**HOST**:http://192.168.43.150:8080


**联系人**:Uzhi


**Version**:v1.0


**接口路径**:/v3/api-docs/auth-api


[TOC]






# 用户控制器


## 根据用户id修改用户信息


**接口地址**:`/user/updateUserInfo`


**请求方式**:`PUT`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "name": "",
  "username": "",
  "email": "",
  "phone": "",
  "avatar": "",
  "count": 0,
  "idNumber": "",
  "uid": 0
}
```


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|updateUserForm|UpdateUserForm|body|true|UpdateUserForm|UpdateUserForm|
|&emsp;&emsp;name|||false|string||
|&emsp;&emsp;username|||false|string||
|&emsp;&emsp;email|||false|string||
|&emsp;&emsp;phone|||false|string||
|&emsp;&emsp;avatar|||false|string||
|&emsp;&emsp;count|||false|number||
|&emsp;&emsp;idNumber|||false|string||
|&emsp;&emsp;uid|||false|integer(int32)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultObject|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|msg||string||
|data||object||


**响应示例**:
```javascript
{
	"code": 0,
	"msg": "",
	"data": {}
}
```


## 用户注册


**接口地址**:`/user/register`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "username": "",
  "password": "",
  "email": "",
  "code": "",
  "permId": 0
}
```


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|registerForm|RegisterForm|body|true|RegisterForm|RegisterForm|
|&emsp;&emsp;username|||false|string||
|&emsp;&emsp;password|||false|string||
|&emsp;&emsp;email|||false|string||
|&emsp;&emsp;code|||false|string||
|&emsp;&emsp;permId|||false|integer(int32)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultObject|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|msg||string||
|data||object||


**响应示例**:
```javascript
{
	"code": 0,
	"msg": "",
	"data": {}
}
```


## 用户登录


**接口地址**:`/user/login`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "username": "",
  "password": ""
}
```


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|loginForm|LoginForm|body|true|LoginForm|LoginForm|
|&emsp;&emsp;username|||false|string||
|&emsp;&emsp;password|||false|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultObject|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|msg||string||
|data||object||


**响应示例**:
```javascript
{
  "code": 200,
  "msg": "成功",
  "data": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJrZXkiOiJ1c2VyX3Rlc3QifQ.SHA2n5zg5g1yY43rl4AGZIrstWQk6KE5IiGEC0WH0t8"
}
```


## 查看个人信息


**接口地址**:`/user/getUserInfo`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|userName||query|true|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultObject|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|msg||string||
|data||object||


**响应示例**:
```javascript
{
  "code": 200,
  "msg": "成功",
  "data": {
    "sex": null,
    "username": "test",
    "email": "1485382864@qq.com",
    "avatar": null,
    "phone": null,
    "name": null,
    "count": null,
    "idNumber": null,
    "permList": [],
    "uid": 1
  }
}
```


## 发送验证码


**接口地址**:`/user/getEmail_code`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|email||query|true|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultObject|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|msg||string||
|data||object||


**响应示例**:
```javascript
{
	"code": 0,
	"msg": "",
	"data": {}
}
```


# 任务控制器


## 更新任务信息


**接口地址**:`/task/update`


**请求方式**:`PUT`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "taskId": 0,
  "taskName": "",
  "description": "",
  "deadline": "",
  "priority": "",
  "status": "",
  "finishTime": ""
}
```


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|updateTaskForm|UpdateTaskForm|body|true|UpdateTaskForm|UpdateTaskForm|
|&emsp;&emsp;taskId|||false|integer(int64)||
|&emsp;&emsp;taskName|||false|string||
|&emsp;&emsp;description|||false|string||
|&emsp;&emsp;deadline|||false|string(date-time)||
|&emsp;&emsp;priority|||false|string||
|&emsp;&emsp;status|||false|string||
|&emsp;&emsp;finishTime|||false|string(date-time)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultObject|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|msg||string||
|data||object||


**响应示例**:
```javascript
{
	"code": 0,
	"msg": "",
	"data": {}
}
```


## 获取任务列表


**接口地址**:`/task/list`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "currentPage": 0,
  "pageSize": 0,
  "userId": 0,
  "subjectId": 0,
  "taskName": "",
  "priority": "",
  "status": ""
}
```


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|taskQuery|TaskQuery|body|true|TaskQuery|TaskQuery|
|&emsp;&emsp;currentPage|||false|integer(int32)||
|&emsp;&emsp;pageSize|||false|integer(int32)||
|&emsp;&emsp;userId|||false|integer(int64)||
|&emsp;&emsp;subjectId|||false|integer(int64)||
|&emsp;&emsp;taskName|||false|string||
|&emsp;&emsp;priority|||false|string||
|&emsp;&emsp;status|||false|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultObject|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|msg||string||
|data||object||


**响应示例**:
```javascript
{
  "code": 200,
  "msg": "成功",
  "data": {
    "total": 1,
    "pageNumber": 1,
    "records": [
      {
        "taskId": 1,
        "userId": 1,
        "subjectId": 1,
        "taskName": "任务1",
        "deadline": "2025-11-14T00:00:00",
        "description": "任务1任务1",
        "priority": "高",
        "status": "已完成",
        "createTime": "2025-11-16T23:18:46",
        "finishTime": "2025-11-14T00:00:00"
      }
    ],
    "currentPage": 1
  }
}
```


## 添加任务


**接口地址**:`/task/add`


**请求方式**:`POST`


**请求数据类型**:`application/x-www-form-urlencoded,application/json`


**响应数据类型**:`*/*`


**接口描述**:


**请求示例**:


```javascript
{
  "userId": 0,
  "subjectId": 0,
  "taskName": "",
  "description": "",
  "deadline": "",
  "priority": ""
}
```


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|addTaskForm|AddTaskForm|body|true|AddTaskForm|AddTaskForm|
|&emsp;&emsp;userId|||false|integer(int64)||
|&emsp;&emsp;subjectId|||false|integer(int64)||
|&emsp;&emsp;taskName|||false|string||
|&emsp;&emsp;description|||false|string||
|&emsp;&emsp;deadline|||false|string(date-time)||
|&emsp;&emsp;priority|||false|string||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultObject|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|msg||string||
|data||object||


**响应示例**:
```javascript
{
	"code": 0,
	"msg": "",
	"data": {}
}
```


## 获取任务信息


**接口地址**:`/task/getInfo`


**请求方式**:`GET`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|id||query|true|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultObject|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|msg||string||
|data||object||


**响应示例**:
```javascript
{
	"code": 0,
	"msg": "",
	"data": {}
}
```


## 删除任务


**接口地址**:`/task/delete`


**请求方式**:`DELETE`


**请求数据类型**:`application/x-www-form-urlencoded`


**响应数据类型**:`*/*`


**接口描述**:


**请求参数**:


| 参数名称 | 参数说明 | 请求类型    | 是否必须 | 数据类型 | schema |
| -------- | -------- | ----- | -------- | -------- | ------ |
|id||query|true|integer(int64)||


**响应状态**:


| 状态码 | 说明 | schema |
| -------- | -------- | ----- | 
|200|OK|ResultObject|


**响应参数**:


| 参数名称 | 参数说明 | 类型 | schema |
| -------- | -------- | ----- |----- | 
|code||integer(int32)|integer(int32)|
|msg||string||
|data||object||


**响应示例**:
```javascript
{
	"code": 0,
	"msg": "",
	"data": {}
}
```