# AI工作流接口文档

# 1： 工作流

## 1.1：工作流管理

### 1.1.1：创建或编辑工作流

- 接口描述

创建或者编辑工作流  要同步给python

- 请求地址

POST /cyc/workflow/v0.5/addOrUpdateWorkflow

- 请求参数

| 字段名           | 类型   | 必填 | 说明                            |
| ---------------- | ------ | ---- | ------------------------------- |
| id               | String | 否   | id (不传表示新增，传值表示编辑) |
| workflowName     | String | 是   | 工作流名称                      |
| workflowId       | String | 是   | 工作流ID                        |
| workflowClass    | String | 是   | 工作流标签                      |
| description      | String | 否   | 描述                            |
| workflowJsonData | String | 是   | 工作流JSON数据                  |

- 请求实例

```json
{
  "workflowName": "test",
  "workflowId": "aaa",
  "workflowClass": "1",
  "description":  "",
  "workflowJsonData": "{
    "name": "极简风格 CV 工作流",
    "description": "前端最小联调工作流",
    "version": "1.0",
    "inputs": [
        {
            "id": "input_1",
            "type": "WorkflowImage",
            "name": "image",
            "ui_position": {
                "x": 80,
                "y": 180
            }
        }
    ],
    "steps": [
        {
            "id": "step_2",
            "type": "detection_model@v1",
            "name": "detect",
            "ui_position": {
                "x": 380,
                "y": 180
            },
            "images": "$inputs.image",
            "model_type": "yolov5",
            "model_repository_id": "2037404699447279617",   模型库id
            "is_latest_version": 1,  是否选择最新版本(0:否 1:是)
            "selected_model_version_id": 123,  指定的模型版本ID(没有选择最新版本的情况下填)
            //"selected_version":"v0.1", 选择的版本号(没有选择最新版本的情况下填)
           // "model_path": "/mnt/data/onnx/meter_2026_02_09.onnx",
            //"labels": ["meter"],
            "device": "cuda",
            "confidence_threshold": 0.2,
            "iou_threshold": 0.45
        },
        {
            "id": "step_3",
            "type": "bounding_box_visualization@v1",
            "name": "visualize",
            "ui_position": {
                "x": 700,
                "y": 180
            },
            "image": "$inputs.image",
            "predictions": "$steps.detect.predictions",
            "box_color": "#FF0000",
            "box_thickness": 2,
            "use_model_colors": true,
            "show_labels": false,
            "show_scores": false
        },
        {
            "id": "step_4",
            "type": "label_display@v1",
            "name": "label_display",
            "ui_position": {
                "x": 980,
                "y": 180
            },
            "predictions": "$steps.visualize.predictions",
            "image": "$inputs.image",
            "font_size": 20,
            "font_color": "#FFFFFF",
            "background_color": "#111827",
            "render_boxes": true,
            "use_model_colors": true,
            "box_color": "#FF0000",
            "box_thickness": 2,
            "show_labels": false,
            "show_scores": false,
            "merge_all_visualizers": false
        }
    ],
    "outputs": [
        {
            "id": "output_5",
            "type": "output@v1",
            "name": "output",
            "ui_position": {
                "x": 1260,
                "y": 180
            },
            "outputs": [
                {
                    "type": "JsonField",
                    "name": "detections",
                    "selector": "$steps.label_display.predictions"
                },
                {
                    "type": "ImageField",
                    "name": "annotated_image",
                    "selector": "$steps.label_display.image"
                },
                {
                    "type": "JsonField",
                    "name": "labels",
                    "selector": "$steps.label_display.labels"
                }
            ]
        }
    ],
    "edges": [
        {
            "id": "e-0-1-2",
            "source": "1",
            "target": "2"
        },
        {
            "id": "e-1-2-3",
            "source": "2",
            "target": "3"
        },
        {
            "id": "e-2-3-4",
            "source": "3",
            "target": "4"
        },
        {
            "id": "e-3-4-5",
            "source": "4",
            "target": "5"
        }
    ],
    "ui_metadata": {
        "viewport": {
            "x": 0,
            "y": 0,
            "zoom": 1
        },
        "last_modified": "2026-03-30T07:09:43.917Z"
    }
}
```

- 响应返回

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": true
}
```

### 1.1.2：查询工作流列表

- **接口描述**

  工作流列表查询

- **请求地址**

GET /cyc/workflow/v0.5/list

- **请求参数**

| 字段名   | 类型    | 必填 | 说明                           |
| -------- | ------- | ---- | ------------------------------ |
| keyword  | String  | 否   | 关键字（匹配工作流名称、标签） |
| groupId  | String  | 否   | 分组ID                         |
| pageNum  | Integer | 否   | 页码，默认 1                   |
| pageSize | Integer | 否   | 每页条数，默认 20              |

- **请求实例**

  ```json
  /cyc/workflow/v0.5/list?pageNum=1&pageSize=10&keyword=检测&groupId=2
  ```

- **响应返回**

```json
{
  "code": 200,
  "msg": "查询成功",
  "rows": [
    {
      "id": 1001,
      "workflowName": "燃气灶具检测工作流",
      "workflowId": "wf_detect_001",
      "workflowClass": "检测,视觉",
      "description": "用于燃气灶具检测",
      "workflowJsonData": "",
      "workflowGroupId": 1,
      "createTime": "2026-03-25 11:00:00",
      "createBy": 1,
      "updateTime": "2026-03-25 11:10:00",
      "updateBy": 1
    }
  ],
  "total": 1
}
```

### 1.1.3：删除工作流

- 接口描述

删除工作流   同步python

- 请求地址

DELETE /cyc/workflow/v0.5/delete

- 请求参数

| 字段名 | 类型   | 必填 | 说明   |
| ------ | ------ | ---- | ------ |
| id     | String | 是   | 主键id |

- 请求实例

  ```json
  /cyc/workflow/v0.5/delete/{id}
  ```

- 响应返回

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": true
}
```

### 1.1.4：查询工作流是否已部署为服务

- 接口描述

查询工作流是否已部署为服务

- 请求地址

GET /cyc/workflow/v0.5/isDeployed

- 请求参数

| 字段名 | 类型   | 必填 | 说明         |
| ------ | ------ | ---- | ------------ |
| id     | String | 是   | 工作流主键id |

- 请求实例

  ```json
  /cyc/workflow/v0.5/isDeployed/{id}
  ```

- 响应返回

```json
{
  "code":200,
  "msg":"操作成功",
  "data":true       true表示已部署   false表示没有部署
}
```

### 1.1.5：复制工作流

- 接口描述

复制工作流  复制的在名称和ID后面递增数字  复制的工作流默认其他分组

- 请求地址

POST /cyc/workflow/v0.5/copyWorkflow

- 请求参数

| 字段名 | 类型   | 必填 | 说明         |
| ------ | ------ | ---- | ------------ |
| id     | String | 是   | 工作流主键id |

- 请求实例

  ```json
  {
    "id": "1231"
  }
  ```

- 响应返回

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": true
}
```

### 1.1.6：校验工作流

- 接口描述

校验工作流   后端调用python

- 请求地址

GET /cyc/workflow/v0.5/verifyWorkflow

- 请求参数

| 字段名 | 类型   | 必填 | 说明         |
| ------ | ------ | ---- | ------------ |
| id     | String | 是   | 工作流主键id |

- 请求实例

  ```json
  /cyc/workflow/v0.5/verifyWorkflow/{id}
  ```

- 响应返回

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "valid": true,
    "errors": [],
    "warnings": [],
    "execution_plan": [
      "input_image",
      "input_confidence",
      "step_detection",
      "step_visualize",
      "output_main"
    ]
  }
}
```

### 1.1.7：工作流调试运行

- 接口描述

校验工作流  后端调用python

- 请求地址

POST /cyc/workflow/v0.5/executeWorkflow

- 请求参数

| 字段名     | 类型   | 必填 | 说明     |
| ---------- | ------ | ---- | -------- |
| workflowId | String | 是   | 工作流id |
| image      | String | 是   | 图片地址 |

- 请求实例

  ```json
  {
    "workflowId": "123465",
    "image": ""
  }
  ```

- 响应返回

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "execution_id": "exec_12345",
    "workflow_id": "wf_001",
    "status": "completed",
    "results": {
      "detections": [
        {
          "bbox": [100, 150, 200, 250],
          "label": "person",
          "confidence": 0.95
        },
        {
          "bbox": [300, 180, 380, 280],
          "label": "car",
          "confidence": 0.87
        }
      ],
      "annotated_image": "data:image/jpeg;base64,/9j/4AAQ..."
    },
    "execution_time_ms": 150,
    "started_at": "2025-02-05T10:35:00Z",
    "completed_at": "2025-02-05T10:35:00.150Z"
  }
}
```

### 1.1.8：工作流发布为业务算法服务

- 接口描述

工作流发布部署  后端调用python

- 请求地址

POST /cyc/workflow/v0.5/deployWorkflow

- 请求参数

| 字段名 | 类型   | 必填 | 说明         |
| ------ | ------ | ---- | ------------ |
| id     | String | 是   | 工作流主键id |

- 请求实例

  ```json
  {
    "id": "123456"
  }
  ```

- 响应返回

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": true
}
```

### 1.2.9：修改工作流基础信息

- 接口描述

修改工作流基础信息  

- 请求地址

POST /cyc/workflow/v0.5/updateWorkflowBase

- 请求参数

| 字段名        | 类型   | 必填 | 说明       |
| ------------- | ------ | ---- | ---------- |
| id            | String | 是   | id         |
| workflowName  | String | 是   | 工作流名称 |
| workflowClass | String | 是   | 工作流标签 |
| description   | String | 否   | 描述       |

- 请求实例

```json
{
  "workflowName": "test",
  "workflowClass": "1",
  "description": ""
}
```

- 响应返回

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": null
}
```

## 1.2：模板有关

### 1.2.1：新增或编辑模板

- 接口描述

新增或编辑模板

- 请求地址

POST /cyc/workflow/v0.5/addTemplate

- 请求参数

| 字段名           | 类型   | 必填 | 说明                            |
| ---------------- | ------ | ---- | ------------------------------- |
| id               | String | 否   | id (不传表示新增，传值表示编辑) |
| templateType     | int    | 是   | 模板类别(1:业务模板 2:算法模板) |
| templateName     | String | 是   | 模板名称                        |
| templateJsonData | String | 是   | 工作流JSON数据                  |

- 请求实例

```json
{
  "templateType": "test",
  "templateName": "aaa",
  "templateJsonData": "1"
}
```

- 响应返回

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": null
}
```

### 1.2.2：查询模板列表

- **接口描述**

  模板列表查询

- **请求地址**

GET /cyc/workflow/v0.5/templateList

- **请求参数**

| 字段名       | 类型    | 必填 | 说明                            |
| ------------ | ------- | ---- | ------------------------------- |
| templateType | int     | 是   | 模板类别(1:业务模板 2:算法模板) |
| pageNum      | Integer | 否   | 页码，默认 1                    |
| pageSize     | Integer | 否   | 每页条数，默认 20               |

- **请求实例**

  ```json
  /cyc/workflow/v0.5/templateList?pageNum=1&pageSize=10&templateType=1
  ```

- **响应返回**

```json
{
  "code": 200,
  "msg": "查询成功",
  "rows": [
    {
      "id": 1001,
      "templateType": 1,
      "templateName": "模板名称",
      "templateJsonData": {},
      "createTime": "2026-03-25 11:00:00",
      "createBy": 1,
      "updateTime": "2026-03-25 11:10:00",
      "updateBy": 1
    }
  ],
  "total": 1
}
```

### 1.2.3：删除模板

- 接口描述

删除模板

- 请求地址

DELETE /cyc/workflow/v0.5/deleteTemplate

- 请求参数

| 字段名 | 类型   | 必填 | 说明   |
| ------ | ------ | ---- | ------ |
| id     | String | 是   | 主键id |

- 请求实例

  ```json
  /cyc/workflow/v0.5/deleteTemplate/{id}
  ```

- 响应返回

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": true
}
```

## 1.3：分组有关

### 1.3.1：新增分组

- 接口描述

新增分组

- 请求地址

POST /cyc/workflow/v0.5/addGroup

- 请求参数

| 字段名    | 类型   | 必填 | 说明     |
| --------- | ------ | ---- | -------- |
| groupName | String | 是   | 分组名称 |

- 请求实例

```json
{
  "groupName": "分组名称"
}
```

- 响应返回

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": null
}
```

### 1.3.2：查询分组列表信息

- **接口描述**

  查询分组列表

- **请求地址**

GET /cyc/workflow/v0.5/groupList

- **请求参数**

| 字段名 | 类型 | 必填 | 说明 |
| ------ | ---- | ---- | ---- |

- **请求实例**

  ```json
  无
  ```

- **响应返回**

```json
{
  "code": 200,
  "msg": "查询成功",
  "rows": [
    {
      "id": 1001,
      "groupName": "分组",
      "createTime": "2026-03-25 11:00:00",
      "createBy": 1,
      "updateTime": "2026-03-25 11:10:00",
      "updateBy": 1
    }
  ],
  "total": 1
}
```

### 1.3.3：选择或移动工作流添加到分组

- **接口描述**

  选择工作流添加到分组

- **请求地址**

POST /cyc/workflow/v0.5/workflowAddGroup

- **请求参数**

| 字段名     | 类型   | 必填 | 说明         |
| ---------- | ------ | ---- | ------------ |
| workflowId | String | 是   | 工作流主键id |
| groupId    | String | 是   | 分组主键ID   |

- **请求实例**

  ```json
  {
    "workflowId": "",
    "groupId": ""
  }
  ```

- **响应返回**

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": true
}
```

### 1.3.4：删除分组

- 接口描述

删除分组

- 请求地址

DELETE /cyc/workflow/v0.5/deleteGroup

- 请求参数

| 字段名 | 类型   | 必填 | 说明       |
| ------ | ------ | ---- | ---------- |
| id     | String | 是   | 分组主键id |

- 请求实例

  ```json
  /cyc/workflow/v0.5/deleteGroup/{id}
  ```

- 响应返回

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": true
}
```

## 1.4：工作流服务有关

### 1.4.1：查询工作流服务列表

- **接口描述**

  查询业务算法服务列表

- **请求地址**

GET /cyc/workflowService/v0.5/list

- **请求参数**

| 字段名              | 类型   | 必填 | 说明                         |
| ------------------- | ------ | ---- | ---------------------------- |
| pageNum             | int    | 是   | 页数                         |
| pageSize            | int    | 是   | 条数                         |
| serviceStatus       | String | 否   | 服务状态(0已停止 1运行中)    |
| serviceName         | String | 否   | 工作流服务名称               |
| serviceLabel        | String | 否   | 业务算法服务标签信息         |
| params\[beginTime\] | Map    | 否   | 查询创建时间开始时间         |
| params\[endTime\]   | Map    | 否   | 查询创建时间开始时间结束时间 |

- **请求实例**

  ```json
  {
    "pageNum": 1,
    "pageSize": 10,
    "serviceStatus": "1",   服务状态(0已停止 1运行中)
    "serviceName": "",    业务算法服务名称
    "serviceLabel": "",  自定义标签
    "params": {"beginTime": 2025-12-12,"endTime": 2025-12-12}

  }
  ```

- **响应返回**

```json
{
	"total": 3,
	"rows": [
		{
			"id": "123456",
			"serviceStatus": "1",   服务状态(0已停止 1运行中)
			"serviceName": "",    工作流服务名称
			"serviceLabel": "",  自定义标签
			"deployTime": "2026-01-04 17:14:02",  部署时间
			"lastStartTime": "2026-01-04 17:14:02"  最新启动时间
		}
	],
	"code": 200,
	"msg": "查询成功"
}
```

### 1.4.2：启动或停止工作流服务

- **接口描述**

  启动或停止业务算法服务

- **请求地址**

POST /cyc/workflowService/v0.5/startBusinessService

- **请求参数**

| 字段名        | 类型   | 必填 | 说明                    |
| ------------- | ------ | ---- | ----------------------- |
| id            | String | 是   | 工作流服务主键id        |
| serviceStatus | String | 是   | 状态 0(停止)或1(运行中) |

- **请求实例**

  ```json
  {
    "id": "123",
    "serviceStatus": "1"
  }
  ```

- **响应返回**

```json
{
  "code": 200,
  "data": null,
  "msg": "操作成功"
}
```
