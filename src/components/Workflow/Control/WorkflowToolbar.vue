<template>
  <div>
    <div class="absolute right-4 top-4 z-20 flex items-center gap-2">
      <div
        class="flex items-center gap-1 rounded-lg bg-white border border-slate-200 shadow-sm p-2"
      >
        <Tooltip text="保存工作流 (Ctrl+S)" position="bottom">
          <button
            @click="handleSaveWorkflow"
            :disabled="saveSubmitting"
            class="p-2 border border-gray-300 rounded-md hover:bg-slate-100 text-gray-600 flex items-center gap-1 cursor-pointer"
          >
            <Save :size="16" />
            <span class="ml-1 text-xs font-medium">
              {{ saveSubmitting ? '保存中...' : '保存' }}
            </span>
          </button>
        </Tooltip>

        <Tooltip text="设置模板" position="bottom">
          <button
            @click="openTemplateDialog"
            class="p-2 border border-gray-300 rounded-md hover:bg-slate-100 text-gray-600 flex items-center gap-1 cursor-pointer"
          >
            <FileText :size="16" />
            <span class="ml-1 text-xs font-medium">模板</span>
          </button>
        </Tooltip>
        <!-- <Tooltip text="导出工作流" position="bottom">
          <button
            @click="$emit('export')"
            class="p-2 rounded hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-800"
          >
            <Download :size="16" />
          </button>
        </Tooltip>

        <Tooltip text="导入工作流" position="bottom">
          <button
            @click="$emit('import')"
            class="p-2 rounded hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-800"
          >
            <Upload :size="16" />
          </button>
        </Tooltip> -->

        <div class="w-px h-6 bg-slate-200"></div>

        <Tooltip text="历史操作记录" position="bottom">
          <button
            @click="$emit('toggleHistory')"
            class="p-2 rounded hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-800"
          >
            <History :size="16" />
          </button>
        </Tooltip>

        <div class="w-px h-6 bg-slate-200"></div>

        <Tooltip text="图健康检查" position="bottom">
          <button
            @click="$emit('healthCheck')"
            class="p-2 rounded hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-800"
          >
            <Activity :size="16" />
          </button>
        </Tooltip>

        <!-- <Tooltip text="清空画布" position="bottom">
          <button
            @click="$emit('clearCanvas')"
            class="p-2 rounded hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-800"
          >
            <Trash2 :size="16" />
          </button>
        </Tooltip> -->

        <div class="w-px h-6 bg-slate-200"></div>

        <Tooltip text="调试工作流" position="bottom">
          <button
            @click="$emit('debug')"
            class="p-2 rounded bg-blue-500 hover:bg-blue-600 transition-colors text-white flex items-center gap-1"
          >
            <Play :size="16" />
            <span class="text-xs font-medium">调试运行</span>
          </button>
        </Tooltip>
        <Tooltip text="发布服务" position="bottom">
          <button
            @click="handleDeployService"
            :disabled="deploySubmitting || saveSubmitting"
            class="p-2 rounded bg-green-500 hover:bg-green-600 transition-colors text-white flex items-center gap-1"
          >
            <Cloud :size="16" />
            <span class="ml-1 text-xs font-medium">
              {{ deploySubmitting ? '发布中...' : '发布服务' }}
            </span>
          </button>
        </Tooltip>

        <!-- <Tooltip text="设置" position="bottom">
          <button
            @click="$emit('openSettings')"
            class="p-2 rounded hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-800"
          >
            <Settings :size="16" />
          </button>
        </Tooltip> -->

        <Tooltip text="帮助" position="bottom">
          <button
            @click="$emit('openHelp')"
            class="p-2 rounded hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-800"
          >
            <HelpCircle :size="16" />
          </button>
        </Tooltip>
      </div>
    </div>

    <el-dialog
      v-model="templateDialogVisible"
      title="创建模板"
      width="480px"
      :close-on-click-modal="false"
      @closed="resetTemplateForm"
    >
      <el-form
        ref="templateFormRef"
        :model="templateForm"
        :rules="templateRules"
        label-position="top"
      >
        <el-form-item label="模板名称" prop="templateName" required>
          <el-input v-model.trim="templateForm.templateName" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="模板类型" prop="templateType" required>
          <el-select
            v-model="templateForm.templateType"
            placeholder="请选择模板类型"
            class="w-full"
            clearable
          >
            <el-option label="业务模板" :value="1" />
            <el-option label="算法模板" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="templateDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="templateSubmitting" @click="submitTemplate">
          创建模板
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Edge, Node } from '@vue-flow/core'
import {
  Save,
  // Download,
  // Upload,
  Cloud,
  Play,
  Activity,
  Trash2,
  Settings,
  HelpCircle,
  History,
  FileText,
} from 'lucide-vue-next'
import Tooltip from './Tooltip.vue'
import { templateApi, workflowApi } from '@/api'
import type {
  AddOrUpdateTemplateRequest,
  AddOrUpdateWorkflowRequest,
  TemplateType,
} from '@/types/workflow-api'
import { useWorkflowStore } from '@/stores/workflow'

const store = useWorkflowStore()

const emit = defineEmits<{
  save: []
  export: []
  import: []
  healthCheck: []
  clearCanvas: []
  debug: []
  openSettings: []
  openHelp: []
  toggleHistory: []
}>()

const props = withDefaults(
  defineProps<{
    nodes?: Node[]
    edges?: Edge[]
  }>(),
  {
    nodes: () => [],
    edges: () => [],
  },
)

const templateDialogVisible = ref(false)
const templateSubmitting = ref(false)
const saveSubmitting = ref(false)
const deploySubmitting = ref(false)
const templateFormRef = ref<FormInstance>()

const templateForm = reactive<AddOrUpdateTemplateRequest>({
  templateName: '',
  templateType: 1,
  templateJsonData: {},
})

const templateRules: FormRules = {
  templateName: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  templateType: [{ required: true, message: '请选择模板类型', trigger: 'change' }],
}

const openTemplateDialog = () => {
  templateDialogVisible.value = true
}

const buildWorkflowSavePayload = (): AddOrUpdateWorkflowRequest | null => {
  const currentWorkflow = store.workflowInfo
  const id = String(currentWorkflow.id ?? '').trim()
  const workflowName = String(currentWorkflow.workflowName ?? '').trim()
  const workflowId = String(currentWorkflow.workflowId ?? '').trim()
  const workflowClass = String(currentWorkflow.workflowClass ?? '').trim()

  if (!id) {
    ElMessage.warning('工作流信息未加载完成，请稍后再试')
    return null
  }
  if (!workflowName || !workflowId || !workflowClass) {
    ElMessage.warning('工作流基础信息不完整，无法保存')
    return null
  }

  return {
    id,
    workflowName,
    workflowId,
    workflowClass,
    description: currentWorkflow.description,
    workflowJsonData: store.getSaveWorkflowData(),
  }
}

const saveWorkflowInternal = async (options?: { silentSuccess?: boolean }) => {
  if (saveSubmitting.value) return false

  const payload = buildWorkflowSavePayload()
  if (!payload) return false

  saveSubmitting.value = true
  try {
    const response = await workflowApi.addOrUpdateWorkflow(payload)
    if (response.code !== 200) {
      ElMessage.error(response.msg || '保存工作流失败')
      return false
    }

    if (!options?.silentSuccess) {
      ElMessage.success('保存工作流成功')
    }
    emit('save')
    return true
  } catch (error) {
    console.error(error)
    ElMessage.error('保存工作流失败，请稍后重试')
    return false
  } finally {
    saveSubmitting.value = false
  }
}

const handleSaveWorkflow = async () => {
  await saveWorkflowInternal()
}

const handleDeployService = async () => {
  if (deploySubmitting.value) return
  if (saveSubmitting.value) return
  const id = String(store.workflowInfo.id ?? '').trim()
  if (!id) {
    ElMessage.warning('工作流信息未加载完成，无法发布服务')
    return
  }

  deploySubmitting.value = true
  try {
    const saveOk = await saveWorkflowInternal({ silentSuccess: true })
    if (!saveOk) return

    const deployedResponse = await workflowApi.isWorkflowDeployed(id)
    if (deployedResponse.code !== 200) {
      ElMessage.error(deployedResponse.msg || '校验发布状态失败')
      return
    }

    if (deployedResponse.data) {
      try {
        await ElMessageBox.confirm(
          '发布后，将覆盖该工作流已发布的服务，确认发布吗？',
          '提示',
          {
            confirmButtonText: '确认发布',
            cancelButtonText: '取消',
            type: 'warning',
          },
        )
      } catch {
        return
      }
    }

    const response = await workflowApi.deployWorkflow(id)
    if (response.code !== 200) {
      ElMessage.error(response.msg || '发布服务失败')
      return
    }

    ElMessage.success('发布服务成功')
  } catch (error) {
    console.error(error)
    ElMessage.error('发布服务失败，请稍后重试')
  } finally {
    deploySubmitting.value = false
  }
}

const isSaveHotkey = (event: KeyboardEvent) => {
  const key = event.key?.toLowerCase?.()
  const isLetterS = key === 's' || event.code === 'KeyS'
  return isLetterS && (event.ctrlKey || event.metaKey) && !event.altKey
}

const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (!isSaveHotkey(event)) return
  if (event.isComposing) return
  if (event.repeat) return
  if (saveSubmitting.value) return
  if (templateDialogVisible.value) return

  event.preventDefault()
  void handleSaveWorkflow()
}

const resetTemplateForm = () => {
  templateForm.templateName = ''
  templateForm.templateType = 1
  templateForm.templateJsonData = {}
  templateFormRef.value?.clearValidate()
}

const submitTemplate = async () => {
  const valid = await templateFormRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }

  const payload: AddOrUpdateTemplateRequest = {
    templateName: templateForm.templateName,
    templateType: templateForm.templateType as TemplateType,
    templateJsonData: store.getSaveWorkflowData(),
  }

  templateSubmitting.value = true
  try {
    const response = await templateApi.addOrUpdateTemplate(payload)
    if (response.code !== 200) {
      ElMessage.error(response.msg || '创建模板失败')
      return
    }
    ElMessage.success('创建模板成功')
    templateDialogVisible.value = false
  } catch (error) {
    console.error(error)
    ElMessage.error('创建模板失败，请稍后重试')
  } finally {
    templateSubmitting.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>
