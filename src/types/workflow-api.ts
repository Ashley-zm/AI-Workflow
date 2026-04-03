// 通用接口响应结构
export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
}

// 列表查询响应结构
export interface ApiListResponse<T> {
  code: number
  msg: string
  data?: T[]
  rows?: T[]
  total: number
}

// 工作流实体
export interface WorkflowEntity {
  id: string | number
  workflowName: string
  workflowId: string
  workflowClass: string
  description?: string
  workflowJsonData?: string
  workflowGroupId?: string | number
  createTime?: string
  createBy?: string | number
  updateTime?: string
  updateBy?: string | number
}

// 新增/编辑工作流请求
export interface AddOrUpdateWorkflowRequest {
  id?: string
  workflowName: string
  workflowId: string
  workflowClass: string
  description?: string
  workflowJsonData: string
}

// 工作流列表查询参数
export interface WorkflowListQuery {
  keyword?: string
  groupId?: string
  pageNum?: number
  pageSize?: number
}

// 工作流校验结果
export interface VerifyWorkflowResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  execution_plan: string[]
}

// 执行工作流请求参数
export interface ExecuteWorkflowRequest {
  workflowId: string
  image: string
}

// 检测结果基础结构
export interface DetectionResult {
  bbox: number[]
  label: string
  confidence: number
}

// 执行工作流返回结果
export interface ExecuteWorkflowResult {
  execution_id: string
  workflow_id: string
  status: string
  results: {
    detections?: DetectionResult[]
    annotated_image?: string
    [key: string]: unknown
  }
  execution_time_ms: number
  started_at: string
  completed_at: string
}

// 更新工作流基础信息请求
export interface UpdateWorkflowBaseRequest {
  id: string
  workflowName: string
  workflowClass: string
  description?: string
}

// 模板类型：1 业务模板，2 算法模板
export type TemplateType = 1 | 2

// 模板实体
export interface TemplateEntity {
  id: string | number
  templateType: TemplateType | number
  templateName: string
  templateJsonData: string | Record<string, unknown>
  createTime?: string
  createBy?: string | number
  updateTime?: string
  updateBy?: string | number
}

// 新增/编辑模板请求
export interface AddOrUpdateTemplateRequest {
  id?: string
  templateType: TemplateType
  templateName: string
  templateJsonData: string
}

// 模板列表查询参数
export interface TemplateListQuery {
  templateType: TemplateType
  pageNum?: number
  pageSize?: number
}

// 分组实体
export interface GroupEntity {
  id: string | number
  groupName: string
  createTime?: string
  createBy?: string | number
  updateTime?: string
  updateBy?: string | number
}

// 新增分组请求
export interface AddGroupRequest {
  groupName: string
}

// 工作流加入分组请求
export interface WorkflowAddGroupRequest {
  workflowId: string
  groupId: string
}

// 工作流服务实体
export interface WorkflowServiceEntity {
  id: string | number
  serviceStatus: string
  serviceName: string
  serviceLabel?: string
  deployTime?: string
  lastStartTime?: string
}

// 工作流服务列表查询参数
export interface WorkflowServiceListQuery {
  pageNum: number
  pageSize: number
  serviceStatus?: string
  serviceName?: string
  serviceLabel?: string
  beginTime?: string
  endTime?: string
}

// 启停业务服务请求
export interface StartBusinessServiceRequest {
  id: string
  serviceStatus: string
}

export interface ModelServiceListQuery {
  pageNum: number
  pageSize: number
  algorithmTypeDictId: string
}
