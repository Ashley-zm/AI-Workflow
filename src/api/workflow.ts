import { http } from '@/api/http'
import type {
  AddGroupRequest,
  AddOrUpdateTemplateRequest,
  AddOrUpdateWorkflowRequest,
  ApiListResponse,
  ApiResponse,
  ExecuteWorkflowRequest,
  ExecuteWorkflowResult,
  GroupEntity,
  StartBusinessServiceRequest,
  TemplateEntity,
  TemplateListQuery,
  UpdateWorkflowBaseRequest,
  VerifyWorkflowResult,
  WorkflowAddGroupRequest,
  WorkflowEntity,
  WorkflowListQuery,
  WorkflowServiceEntity,
  WorkflowServiceListQuery,
  ModelServiceListQuery,
} from '@/types/workflow-api'

// 工作流相关接口前缀（与《AI工作流接口文档》保持一致）
const WORKFLOW_PREFIX = '/cyc/workflowManage/v0.5'
// 工作流服务相关接口前缀
const WORKFLOW_SERVICE_PREFIX = '/cyc/workflowService/v0.5'

// 是否启用 mock：默认启用，显式设置 VITE_USE_WORKFLOW_MOCK=false 时走真实后端
const USE_WORKFLOW_MOCK = (import.meta.env.VITE_USE_WORKFLOW_MOCK ?? 'true') !== 'false'

// 统一时间与深拷贝工具
const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ')
const clone = <T>(data: T): T => JSON.parse(JSON.stringify(data)) as T

// 统一成功响应封装
const success = <T>(data: T, msg = 'Operation succeeded'): ApiResponse<T> => ({
  code: 200,
  msg,
  data,
})

// 统一列表响应封装
const successList = <T>(
  rows: T[],
  total = rows.length,
  msg = 'Query succeeded',
): ApiListResponse<T> => ({
  code: 200,
  msg,
  rows,
  total,
})

// 模拟网络延迟
const wait = <T>(data: T, ms = 120) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(data), ms))

// mock 分组数据
let mockGroups: GroupEntity[] = [
  { id: 'g-1', groupName: 'Default Group', createTime: now() },
  { id: 'g-2', groupName: 'Tool Detection', createTime: now() },
  { id: 'g-3', groupName: 'Welding Quality', createTime: now() },
]

// mock 工作流数据
let mockWorkflows: WorkflowEntity[] = [
  {
    id: 'wf-1',
    workflowName: 'Tool Defect Detection',
    workflowId: 'wf_detect_001',
    workflowClass: 'Tool Detection',
    description: 'Detect common defects on tool surfaces.',
    workflowJsonData: '{"steps":[]}',
    workflowGroup: 'g-2',
    createTime: now(),
    updateTime: now(),
  },
  {
    id: 'wf-2',
    workflowName: 'Weld Seam Inspection',
    workflowId: 'wf_detect_002',
    workflowClass: 'Welding Quality',
    description: 'Inspect weld quality and output annotated results.',
    workflowJsonData: '{"steps":[]}',
    workflowGroup: 'g-3',
    createTime: now(),
    updateTime: now(),
  },
]

// mock 模板数据
let mockTemplates: TemplateEntity[] = [
  {
    id: 'tpl-1',
    templateType: 1,
    templateName: 'Blank Template',
    templateJsonData: '{"name":"Blank Template","steps":[]}',
    createTime: now(),
    updateTime: now(),
  },
  {
    id: 'tpl-2',
    templateType: 1,
    templateName: 'Tool Detection Template',
    templateJsonData: '{"name":"Tool Detection Template","steps":[{"type":"detection_model@v1"}]}',
    createTime: now(),
    updateTime: now(),
  },
  {
    id: 'tpl-3',
    templateType: 2,
    templateName: 'Algorithm Template',
    templateJsonData: '{"name":"Algorithm Template","steps":[{"type":"detection_model@v1"}]}',
    createTime: now(),
    updateTime: now(),
  },
]

// mock 服务数据
let mockWorkflowServices: WorkflowServiceEntity[] = [
  {
    id: 'svc-1',
    serviceStatus: '1',
    serviceName: 'Tool Detection Service',
    serviceLabel: 'Tool',
    deployTime: now(),
    lastStartTime: now(),
  },
]

// 记录已部署的工作流（供 isWorkflowDeployed / deployWorkflow 使用）
const deployedWorkflowIds = new Set<string>(['wf-1'])

// 工作流模块 mock 接口
const mockWorkflowApi = {
  // 新增或更新工作流
  async addOrUpdateWorkflow(payload: AddOrUpdateWorkflowRequest) {
    if (payload.id) {
      const index = mockWorkflows.findIndex((item) => String(item.id) === String(payload.id))
      if (index >= 0) {
        mockWorkflows[index] = {
          ...mockWorkflows[index]!,
          workflowName: payload.workflowName,
          workflowId: payload.workflowId,
          workflowClass: payload.workflowClass,
          description: payload.description,
          workflowJsonData: payload.workflowJsonData,
          updateTime: now(),
        }
      }
    } else {
      const id = `wf-${Date.now()}`
      mockWorkflows.unshift({
        id,
        workflowName: payload.workflowName,
        workflowId: payload.workflowId,
        workflowClass: payload.workflowClass,
        description: payload.description,
        workflowJsonData: payload.workflowJsonData,
        createTime: now(),
        updateTime: now(),
      })
    }
    return wait(success(true))
  },

  // 获取工作流列表（支持关键词、分组、分页）
  async getWorkflowList(params: WorkflowListQuery) {
    const keyword = (params.keyword ?? '').toLowerCase()
    const groupId = params.groupId ? String(params.groupId) : ''
    const pageNum = params.pageNum ?? 1
    const pageSize = params.pageSize ?? 20

    const filtered = mockWorkflows.filter((item) => {
      const keywordMatch =
        !keyword ||
        [item.workflowName, item.workflowId, item.workflowClass, item.description]
          .filter(Boolean)
          .some((text) => String(text).toLowerCase().includes(keyword))
      const groupMatch = !groupId || String(item.workflowGroup ?? '') === groupId
      return keywordMatch && groupMatch
    })

    const start = (pageNum - 1) * pageSize
    const rows = filtered.slice(start, start + pageSize)
    return wait(successList(clone(rows), filtered.length))
  },

  // 删除工作流
  async deleteWorkflow(id: string) {
    mockWorkflows = mockWorkflows.filter((item) => String(item.id) !== String(id))
    deployedWorkflowIds.delete(String(id))
    return wait(success(true))
  },

  // 判断工作流是否已部署
  async isWorkflowDeployed(id: string) {
    return wait(success(deployedWorkflowIds.has(String(id))))
  },

  // 复制工作流
  async copyWorkflow(id: string) {
    const source = mockWorkflows.find((item) => String(item.id) === String(id))
    if (!source) return wait(success(false, 'Workflow not found'))

    const copyId = `wf-${Date.now()}`
    mockWorkflows.unshift({
      ...clone(source),
      id: copyId,
      workflowName: `${source.workflowName} Copy`,
      workflowId: `${source.workflowId}_copy`,
      createTime: now(),
      updateTime: now(),
    })
    return wait(success(true))
  },

  // 校验工作流编排数据
  async verifyWorkflow(id: string) {
    const target = mockWorkflows.find((item) => String(item.id) === String(id))
    const result: VerifyWorkflowResult = {
      valid: Boolean(target?.workflowJsonData),
      errors: target?.workflowJsonData ? [] : ['workflowJsonData is required'],
      warnings: [],
      execution_plan: ['input_image', 'step_detection', 'step_visualize', 'output_main'],
    }
    return wait(success(result))
  },

  // 执行工作流（返回模拟推理结果）
  async executeWorkflow(payload: ExecuteWorkflowRequest) {
    const result: ExecuteWorkflowResult = {
      valid: true,
      errors: [],
      warnings: [],
      executeResult: {
        execution_id: `exec_${Date.now()}`,
        workflow_id: payload.workflowId,
        status: 'completed',
        results: {
          detections: [
            { bbox: [100, 150, 200, 250], label: 'person', confidence: 0.95 },
            { bbox: [300, 180, 380, 280], label: 'car', confidence: 0.87 },
          ],
          annotated_image: 'data:image/jpeg;base64,mock',
        },
        execution_time_ms: 150,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      },
    }
    return wait(success(result))
  },

  // 部署工作流
  async deployWorkflow(id: string) {
    deployedWorkflowIds.add(String(id))
    return wait(success(true))
  },

  // 更新工作流基础信息
  async updateWorkflowBase(payload: UpdateWorkflowBaseRequest) {
    const index = mockWorkflows.findIndex((item) => String(item.id) === String(payload.id))
    if (index >= 0) {
      mockWorkflows[index] = {
        ...mockWorkflows[index]!,
        workflowName: payload.workflowName,
        workflowClass: payload.workflowClass,
        description: payload.description,
        updateTime: now(),
      }
    }
    return wait(success<null>(null))
  },

  async getWorkflowInfo(id: string) {
    const target = mockWorkflows.find((item) => String(item.id) === String(id))
    if (!target) {
      return wait(success<WorkflowEntity | null>(null, 'Workflow not found'))
    }
    return wait(success(clone(target)))
  },
}

// 模板模块 mock 接口
const mockTemplateApi = {
  // 新增或编辑模板
  async addOrUpdateTemplate(payload: AddOrUpdateTemplateRequest) {
    if (payload.id) {
      const index = mockTemplates.findIndex((item) => String(item.id) === String(payload.id))
      if (index >= 0) {
        mockTemplates[index] = {
          ...mockTemplates[index]!,
          templateType: payload.templateType,
          templateName: payload.templateName,
          templateJsonData: payload.templateJsonData,
          updateTime: now(),
        }
      }
    } else {
      mockTemplates.unshift({
        id: `tpl-${Date.now()}`,
        templateType: payload.templateType,
        templateName: payload.templateName,
        templateJsonData: payload.templateJsonData,
        createTime: now(),
        updateTime: now(),
      })
    }
    return wait(success<null>(null))
  },

  // 获取模板列表（按模板类型过滤）
  async getTemplateList(params: TemplateListQuery) {
    const pageNum = params.pageNum ?? 1
    const pageSize = params.pageSize ?? 20
    const rows = mockTemplates.filter(
      (item) => Number(item.templateType) === Number(params.templateType),
    )
    const start = (pageNum - 1) * pageSize
    return wait(successList(clone(rows.slice(start, start + pageSize)), rows.length))
  },

  // 删除模板
  async deleteTemplate(id: string) {
    mockTemplates = mockTemplates.filter((item) => String(item.id) !== String(id))
    return wait(success(true))
  },
}

// 分组模块 mock 接口
const mockGroupApi = {
  // 新增分组
  async addGroup(payload: AddGroupRequest) {
    mockGroups.unshift({
      id: `g-${Date.now()}`,
      groupName: payload.groupName,
      createTime: now(),
      updateTime: now(),
    })
    return wait(success<null>(null))
  },

  // 获取分组列表
  async getGroupList() {
    return wait(successList(clone(mockGroups), mockGroups.length))
  },

  // 将工作流加入分组
  async workflowAddGroup(payload: WorkflowAddGroupRequest) {
    const index = mockWorkflows.findIndex((item) => String(item.id) === String(payload.workflowId))
    if (index < 0) return wait(success(false, 'Workflow not found'))
    mockWorkflows[index] = {
      ...mockWorkflows[index]!,
      workflowGroup: payload.groupId,
      updateTime: now(),
    }
    return wait(success(true))
  },

  // 删除分组，并清理工作流中的分组关联
  async deleteGroup(id: string) {
    mockGroups = mockGroups.filter((item) => String(item.id) !== String(id))
    mockWorkflows = mockWorkflows.map((item) =>
      String(item.workflowGroup ?? '') === String(id)
        ? { ...item, workflowGroup: undefined }
        : item,
    )
    return wait(success(true))
  },
}

// 工作流服务模块 mock 接口
const mockWorkflowServiceApi = {
  // 获取服务列表（支持状态/名称/标签筛选）
  async getWorkflowServiceList(params: WorkflowServiceListQuery) {
    const pageNum = params.pageNum ?? 1
    const pageSize = params.pageSize ?? 20
    const serviceName = (params.serviceName ?? '').toLowerCase()
    const serviceStatus = params.serviceStatus ?? ''
    const serviceLabel = (params.serviceLabel ?? '').toLowerCase()

    const filtered = mockWorkflowServices.filter((item) => {
      const statusMatch = !serviceStatus || item.serviceStatus === serviceStatus
      const nameMatch = !serviceName || item.serviceName.toLowerCase().includes(serviceName)
      const labelMatch =
        !serviceLabel ||
        String(item.serviceLabel ?? '')
          .toLowerCase()
          .includes(serviceLabel)
      return statusMatch && nameMatch && labelMatch
    })
    const start = (pageNum - 1) * pageSize
    return wait(successList(clone(filtered.slice(start, start + pageSize)), filtered.length))
  },

  // 启停业务服务
  async startBusinessService(payload: StartBusinessServiceRequest) {
    const index = mockWorkflowServices.findIndex((item) => String(item.id) === String(payload.id))
    if (index >= 0) {
      mockWorkflowServices[index] = {
        ...mockWorkflowServices[index]!,
        serviceStatus: payload.serviceStatus,
        lastStartTime: now(),
      }
    }
    return wait(success<null>(null))
  },
}

// 工作流接口：根据开关在 mock 与真实接口之间切换
export const workflowApi = USE_WORKFLOW_MOCK
  ? mockWorkflowApi
  : {
      // 新增/更新工作流
      addOrUpdateWorkflow(payload: AddOrUpdateWorkflowRequest) {
        return http.post<never, ApiResponse<string>>(
          `${WORKFLOW_PREFIX}/addOrUpdateWorkflow`,
          payload,
        )
      },
      // 获取工作流列表
      getWorkflowList(params: WorkflowListQuery) {
        return http.get<never, ApiListResponse<WorkflowEntity>>(`${WORKFLOW_PREFIX}/list`, {
          params,
        })
      },
      // 删除工作流
      deleteWorkflow(id: string) {
        return http.delete<never, ApiResponse<boolean>>(`${WORKFLOW_PREFIX}/delete/${id}`)
      },
      // 检查工作流是否已部署
      isWorkflowDeployed(id: string) {
        return http.get<never, ApiResponse<boolean>>(`${WORKFLOW_PREFIX}/isDeployed/${id}`)
      },
      // 复制工作流
      copyWorkflow(id: string) {
        return http.post<never, ApiResponse<boolean>>(`${WORKFLOW_PREFIX}/copyWorkflow`, { id })
      },
      // 验证工作流
      verifyWorkflow(id: string) {
        return http.get<never, ApiResponse<VerifyWorkflowResult>>(
          `${WORKFLOW_PREFIX}/verifyWorkflow/${id}`,
        )
      },
      // 执行工作流
      executeWorkflow(payload: ExecuteWorkflowRequest) {
        return http.post<never, ApiResponse<any>>(`${WORKFLOW_PREFIX}/executeWorkflow`, payload)
      },
      // 部署工作流
      deployWorkflow(id: string) {
        return http.post<never, ApiResponse<boolean>>(`${WORKFLOW_PREFIX}/deployWorkflow`, { id })
      },
      // 更新工作流基本信息
      updateWorkflowBase(payload: UpdateWorkflowBaseRequest) {
        return http.post<never, ApiResponse<null>>(`${WORKFLOW_PREFIX}/updateWorkflowBase`, payload)
      },
      // 获取工作流信息
      getWorkflowInfo(id: string) {
        return http.get<never, ApiResponse<any>>(`${WORKFLOW_PREFIX}/getInfo/${id}`)
      },
    }

// 模板接口：根据开关在 mock 与真实接口之间切换
export const templateApi = USE_WORKFLOW_MOCK
  ? mockTemplateApi
  : {
      addOrUpdateTemplate(payload: AddOrUpdateTemplateRequest) {
        return http.post<never, ApiResponse<null>>(`${WORKFLOW_PREFIX}/addTemplate`, payload)
      },
      getTemplateList(params: TemplateListQuery) {
        return http.get<never, ApiListResponse<TemplateEntity>>(`${WORKFLOW_PREFIX}/templateList`, {
          params,
        })
      },
      deleteTemplate(id: string) {
        return http.delete<never, ApiResponse<boolean>>(`${WORKFLOW_PREFIX}/deleteTemplate/${id}`)
      },
    }

// 分组接口：根据开关在 mock 与真实接口之间切换
export const groupApi = USE_WORKFLOW_MOCK
  ? mockGroupApi
  : {
      addGroup(payload: AddGroupRequest) {
        return http.post<never, ApiResponse<null>>(`${WORKFLOW_PREFIX}/addGroup`, payload)
      },
      getGroupList() {
        return http.get<never, ApiListResponse<GroupEntity>>(`${WORKFLOW_PREFIX}/groupList`)
      },
      workflowAddGroup(payload: WorkflowAddGroupRequest) {
        return http.post<never, ApiResponse<boolean>>(
          `${WORKFLOW_PREFIX}/workflowAddGroup`,
          payload,
        )
      },
      deleteGroup(id: string) {
        return http.delete<never, ApiResponse<boolean>>(`${WORKFLOW_PREFIX}/deleteGroup/${id}`)
      },
    }

// 工作流服务接口：根据开关在 mock 与真实接口之间切换
export const workflowServiceApi = USE_WORKFLOW_MOCK
  ? mockWorkflowServiceApi
  : {
      getWorkflowServiceList(params: WorkflowServiceListQuery) {
        const requestParams = {
          ...params,
          'params[beginTime]': params.beginTime,
          'params[endTime]': params.endTime,
        }
        return http.get<never, ApiListResponse<WorkflowServiceEntity>>(
          `${WORKFLOW_SERVICE_PREFIX}/list`,
          { params: requestParams },
        )
      },
      startBusinessService(payload: StartBusinessServiceRequest) {
        return http.post<never, ApiResponse<null>>(
          `${WORKFLOW_SERVICE_PREFIX}/startBusinessService`,
          payload,
        )
      },
    }
// 模型服务接口
export const getModelServiceList = (data: ModelServiceListQuery) => {
  return http.post<never, ApiListResponse<any>>(`/cyc/modelService/v0.2/list`, data)
}
// 获取GPU信息
export const getGpuInfo = () => {
  return http.get<never, ApiResponse<any>>(`/cyc/trainingTask/v0.3/getGpuInfo`)
}
