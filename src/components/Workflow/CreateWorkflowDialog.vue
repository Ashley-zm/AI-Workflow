<template>
  <div>
    <el-dialog
      v-model="dialogVisible"
      title="创建工作流"
      width="60%"
      destroy-on-close
      class="workflow-create-dialog"
    >
      <div class="create-dialog-layout">
        <aside class="template-side">
          <div class="template-tabs flex justify-center gap-2">
            <button
              type="button"
              class="template-tab"
              :class="{ active: templateCategory === 'business' }"
              @click="templateCategory = 'business'"
            >
              业务模板
            </button>
            <button
              type="button"
              class="template-tab"
              :class="{ active: templateCategory === 'algorithm' }"
              @click="templateCategory = 'algorithm'"
            >
              算法模板
            </button>
          </div>

          <el-scrollbar max-height="450px">
            <div v-loading="templateLoading" class="template-list">
              <template v-if="visibleTemplates.length > 0">
                <article
                  v-for="template in visibleTemplates"
                  :key="String(template.id)"
                  class="template-card"
                  :class="{ selected: selectedTemplateId === String(template.id) }"
                  @click="selectedTemplateId = String(template.id)"
                >
                  <div v-if="!isTemplateLocked(template)" class="template-card-toolbar">
                    <el-dropdown trigger="click" @command="onTemplateCommand($event, template)">
                      <button
                        type="button"
                        class="grid h-6 w-6 place-items-center rounded text-slate-500 hover:bg-slate-100"
                        @click.stop
                      >
                        <EllipsisVertical :size="14" />
                      </button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="edit">编辑</el-dropdown-item>
                          <el-dropdown-item command="delete">删除</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                  <div class="template-preview">
                    <div class="template-workflow-icon">
                      <span class="wf-node n1"></span>
                      <span class="wf-node n2"></span>
                      <span class="wf-node n3"></span>
                      <span class="wf-ring"></span>
                    </div>
                    <div class="template-mini-flow">
                      <div class="mini-node"></div>
                      <div class="mini-node"></div>
                      <div class="mini-node"></div>
                    </div>
                  </div>
                  <p class="template-title">{{ template.templateName }}</p>
                </article>
              </template>
              <template v-else>
                <el-empty description="暂无模板" />
              </template>
            </div>
          </el-scrollbar>
        </aside>

        <main>
          <el-form
            ref="createFormRef"
            :model="createForm"
            :rules="formRules"
            label-position="top"
            class="create-form"
          >
            <el-form-item class="form-item" prop="workflowName" label="工作流名称" :required="true">
              <p class="form-hint">
                支持中文、英文、数字、中划线、下划线、空格、点号，不能以下划线或空格开头
              </p>
              <el-input
                v-model.trim="createForm.workflowName"
                placeholder="请输入"
                maxlength="50"
                @input="onWorkflowNameInput"
              />
            </el-form-item>

            <el-form-item class="form-item" prop="workflowId" label="工作流ID" :required="true">
              <p class="form-hint">根据工作流名称自动生成，可修改</p>
              <el-input
                v-model.trim="createForm.workflowId"
                placeholder="根据工作流名称自动生成，可修改"
                maxlength="60"
                @input="onWorkflowCodeInput"
              />
            </el-form-item>

            <el-form-item class="form-item" prop="workflowClass" label="标签" :required="true">
              <p class="form-hint w-full">添加自定义标签，如归属业主、地区等</p>
              <div class="tag-row">
                <el-tag
                  v-for="tag in workflowClassTags"
                  :key="tag"
                  closable
                  @close="removeTag(tag)"
                >
                  {{ tag }}
                </el-tag>
                <el-input
                  v-model.trim="tagInput"
                  class="tag-input"
                  placeholder="请输入标签，回车添加"
                  @keyup.enter="appendTag"
                  @blur="appendTag"
                />
              </div>
            </el-form-item>

            <el-form-item class="form-item" prop="description" label="描述">
              <el-input
                v-model.trim="createForm.description"
                type="textarea"
                :rows="4"
                maxlength="100"
                show-word-limit
                placeholder="请输入（简要描述工作流信息）"
              />
            </el-form-item>
          </el-form>
        </main>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="creating" @click="submitCreateWorkflow">
            创建工作流
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="editTemplateDialogVisible"
      title="编辑模板"
      width="420px"
      append-to-body
      :close-on-click-modal="false"
      class="template-edit-dialog"
      @closed="resetEditTemplateForm"
    >
      <el-form
        ref="editTemplateFormRef"
        :model="editTemplateForm"
        :rules="editTemplateFormRules"
        label-position="top"
      >
        <el-form-item label="模板名称" prop="templateName" required>
          <el-input
            v-model.trim="editTemplateForm.templateName"
            placeholder="请输入模板名称"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="模板类型" prop="templateType" required>
          <el-select
            v-model="editTemplateForm.templateType"
            class="w-full"
            placeholder="请选择模板类型"
          >
            <el-option label="业务模板" :value="1" />
            <el-option label="算法模板" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editTemplateDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="editTemplateSubmitting" @click="submitEditTemplate">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { EllipsisVertical } from 'lucide-vue-next'
import { hasBaiduTranslateConfig, templateApi, translateZhToEn, workflowApi } from '@/api'
import type {
  AddOrUpdateTemplateRequest,
  AddOrUpdateWorkflowRequest,
  TemplateEntity,
  TemplateType,
} from '@/types/workflow-api'

type TemplateCategory = 'business' | 'algorithm'
type TemplateCommand = 'delete' | 'edit'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    defaultTag?: string
  }>(),
  {
    defaultTag: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  created: [workflowId: string]
}>()

const templateLoading = ref(false)
const creating = ref(false)
const templateCategory = ref<TemplateCategory>('business')
const selectedTemplateId = ref('')
const tagInput = ref('')
const workflowCodeManualEdited = ref(false)
const createFormRef = ref<FormInstance>()
const editTemplateDialogVisible = ref(false)
const editTemplateSubmitting = ref(false)
const editTemplateFormRef = ref<FormInstance>()
const editingTemplateId = ref('')
const editingTemplateJsonData = ref<Record<string, any>>({})
const editingTemplateOriginalCategory = ref<TemplateCategory>('business')
let workflowIdTranslateTimer: ReturnType<typeof setTimeout> | null = null
let workflowIdTranslateSequence = 0
let hasShownTranslateConfigWarning = false

const templatesByType = reactive<Record<TemplateCategory, TemplateEntity[]>>({
  business: [],
  algorithm: [],
})

const createForm = reactive({
  workflowName: '',
  workflowId: '',
  workflowClass: '',
  description: '',
})
const workflowClassTags = ref<string[]>([])
const editTemplateForm = reactive<{
  templateName: string
  templateType: TemplateType | undefined
}>({
  templateName: '',
  templateType: undefined,
})

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const visibleTemplates = computed(() => templatesByType[templateCategory.value])

const selectedTemplate = computed(() => {
  return visibleTemplates.value.find((item) => String(item.id) === selectedTemplateId.value)
})

const isTemplateLocked = (template: TemplateEntity) => {
  const name = String(template.templateName ?? '')
    .trim()
    .toLowerCase()
  return name === 'blank template'
  // return name === '空白模板' || name === 'blank template'
}

const normalizeWorkflowField = (value: string) => {
  return value
    .replace(/[^\u4e00-\u9fa5A-Za-z0-9_.\-\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trimStart()
}

const normalizeWorkflowId = (value: string) => {
  return value
    .toLowerCase()
    .replace(/[^A-Za-z0-9_.\-\s]/g, ' ')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^[-_]+/, '')
    .replace(/[-_]+$/, '')
    .slice(0, 60)
}

const clearWorkflowIdTranslateTimer = () => {
  if (!workflowIdTranslateTimer) return
  clearTimeout(workflowIdTranslateTimer)
  workflowIdTranslateTimer = null
}

const getWorkflowIdFallback = (name: string) => {
  return normalizeWorkflowId(name) || `workflow-${Date.now()}`
}

const translateWorkflowNameToId = async (name: string) => {
  const requestSequence = ++workflowIdTranslateSequence
  const normalizedName = normalizeWorkflowField(name).trim()

  if (!normalizedName) {
    createForm.workflowId = ''
    return
  }
  if (!hasBaiduTranslateConfig) {
    if (!hasShownTranslateConfigWarning) {
      ElMessage.warning('未配置百度翻译 AppID/AppKey，已使用非翻译规则生成工作流ID')
      hasShownTranslateConfigWarning = true
    }
    createForm.workflowId = getWorkflowIdFallback(normalizedName)
    return
  }

  try {
    const translatedName = await translateZhToEn(normalizedName)
    if (workflowCodeManualEdited.value) return
    if (requestSequence !== workflowIdTranslateSequence) return

    createForm.workflowId = getWorkflowIdFallback(translatedName || normalizedName)
  } catch (error) {
    if (workflowCodeManualEdited.value) return
    if (requestSequence !== workflowIdTranslateSequence) return

    createForm.workflowId = getWorkflowIdFallback(normalizedName)
    console.warn('Workflow ID translation failed, fallback was used.', error)
  }
}

const validateWorkflowField = (value: string) =>
  /^(?![_\s])[A-Za-z0-9\u4e00-\u9fa5_.\-\s]+$/.test(value)

const validateWorkflowName = (
  _rule: any,
  value: string,
  callback: (error?: string | Error) => void,
) => {
  if (!value) {
    callback(new Error('请填写工作流名称'))
    return
  }
  if (!validateWorkflowField(value)) {
    callback(new Error('工作流名称格式不正确'))
    return
  }
  callback()
}

const validateWorkflowId = (
  _rule: any,
  value: string,
  callback: (error?: string | Error) => void,
) => {
  if (!value) {
    callback(new Error('请填写工作流ID'))
    return
  }
  if (!validateWorkflowField(value)) {
    callback(new Error('工作流ID格式不正确'))
    return
  }
  callback()
}

const validateWorkflowClass = (
  _rule: any,
  value: string,
  callback: (error?: string | Error) => void,
) => {
  if (!value || value.split(',').filter((item) => item.trim()).length === 0) {
    callback(new Error('请至少添加一个标签'))
    return
  }
  callback()
}

const formRules: FormRules = {
  workflowName: [{ validator: validateWorkflowName, trigger: ['blur', 'change'] }],
  workflowId: [{ validator: validateWorkflowId, trigger: ['blur', 'change'] }],
  workflowClass: [{ validator: validateWorkflowClass, trigger: ['blur', 'change'] }],
  description: [{ max: 100, message: '描述不能超过100个字符', trigger: 'blur' }],
}
const editTemplateFormRules: FormRules = {
  templateName: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  templateType: [{ required: true, message: '请选择模板类型', trigger: 'change' }],
}

const syncWorkflowClass = () => {
  createForm.workflowClass = workflowClassTags.value.join(',')
}

const resetCreateForm = () => {
  workflowCodeManualEdited.value = false
  createForm.workflowName = ''
  createForm.workflowId = ''
  createForm.workflowClass = ''
  createForm.description = ''
  workflowClassTags.value = props.defaultTag ? [props.defaultTag] : []
  syncWorkflowClass()
  tagInput.value = ''
}

const fetchTemplates = async (category: TemplateCategory) => {
  templateLoading.value = true
  try {
    const templateType: TemplateType = category === 'business' ? 1 : 2
    const response = await templateApi.getTemplateList({
      templateType,
      pageNum: 1,
      pageSize: 100,
    })
    if (response.code !== 200) {
      ElMessage.error(response.msg || '加载模板失败')
      return
    }
    templatesByType[category] = response.rows || []
    selectedTemplateId.value = String(templatesByType[category][0]?.id || '')
  } catch (error) {
    console.error(error)
    ElMessage.error('加载模板失败，请稍后重试')
  } finally {
    templateLoading.value = false
  }
}

const onWorkflowNameInput = (value: string) => {
  createForm.workflowName = normalizeWorkflowField(value)
}

const onWorkflowCodeInput = (value: string) => {
  workflowCodeManualEdited.value = true
  workflowIdTranslateSequence += 1
  clearWorkflowIdTranslateTimer()
  createForm.workflowId = normalizeWorkflowField(value)
}

const formatNowForWorkflowName = () => {
  const now = new Date()
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(
    now.getHours(),
  )}${pad(now.getMinutes())}${pad(now.getSeconds())}`
}

const syncWorkflowNameByTemplate = () => {
  if (!dialogVisible.value) return
  const templateName = selectedTemplate.value?.templateName
  if (!templateName) return
  createForm.workflowName = normalizeWorkflowField(`${templateName}_${formatNowForWorkflowName()}`)
  createFormRef.value?.clearValidate(['workflowName', 'workflowId'])
}

watch(
  () => createForm.workflowName,
  (value) => {
    if (workflowCodeManualEdited.value) return
    clearWorkflowIdTranslateTimer()

    const normalizedName = normalizeWorkflowField(value)
    if (!normalizedName) {
      workflowIdTranslateSequence += 1
      createForm.workflowId = ''
      return
    }

    workflowIdTranslateTimer = setTimeout(() => {
      void translateWorkflowNameToId(normalizedName)
    }, 320)
  },
)

watch(
  () => props.defaultTag,
  (tag) => {
    if (!dialogVisible.value) return
    if (!tag) return
    if (workflowClassTags.value.length === 0) {
      workflowClassTags.value = [tag]
      syncWorkflowClass()
      createFormRef.value?.clearValidate('workflowClass')
    }
  },
)

watch(dialogVisible, async (visible) => {
  if (!visible) {
    workflowIdTranslateSequence += 1
    clearWorkflowIdTranslateTimer()
    return
  }
  resetCreateForm()
  await nextTick()
  createFormRef.value?.clearValidate()
  templateCategory.value = 'business'
  if (templatesByType.business.length === 0) {
    await fetchTemplates('business')
  } else {
    selectedTemplateId.value = String(templatesByType.business[0]?.id || '')
  }
  syncWorkflowNameByTemplate()
})

watch(templateCategory, async (value) => {
  if (!dialogVisible.value) return
  if (templatesByType[value].length === 0) {
    await fetchTemplates(value)
  } else {
    selectedTemplateId.value = String(templatesByType[value][0]?.id || '')
  }
  syncWorkflowNameByTemplate()
})

watch(
  () => selectedTemplate.value?.templateName,
  () => {
    syncWorkflowNameByTemplate()
  },
)

const appendTag = () => {
  const nextTag = normalizeWorkflowField(tagInput.value).trim()
  if (!nextTag) return
  if (workflowClassTags.value.includes(nextTag)) {
    ElMessage.warning('标签已存在')
    return
  }
  workflowClassTags.value.push(nextTag)
  syncWorkflowClass()
  createFormRef.value?.clearValidate('workflowClass')
  tagInput.value = ''
}

const removeTag = (targetTag: string) => {
  workflowClassTags.value = workflowClassTags.value.filter((tag) => tag !== targetTag)
  syncWorkflowClass()
  createFormRef.value?.validateField('workflowClass').catch(() => undefined)
}

const submitCreateWorkflow = async () => {
  const valid = await createFormRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }

  const templateJsonData = selectedTemplate.value?.templateJsonData
  const payload: AddOrUpdateWorkflowRequest = {
    workflowName: createForm.workflowName,
    workflowId: createForm.workflowId,
    workflowClass: createForm.workflowClass,
    description: createForm.description,
    workflowJsonData: templateJsonData,
  }

  creating.value = true
  try {
    const response = await workflowApi.addOrUpdateWorkflow(payload)
    if (response.code !== 200 || !response.data) {
      ElMessage.error(response.msg || '创建工作流失败')
      return
    }

    ElMessage.success('创建成功')
    console.log('创建成功', response.data)
    dialogVisible.value = false
    emit('created', response.data as string)
  } catch (error) {
    console.error(error)
    ElMessage.error('创建工作流失败，请稍后重试')
  } finally {
    creating.value = false
  }
}

const openEditTemplateDialog = async (template: TemplateEntity) => {
  editingTemplateId.value = String(template.id)
  editingTemplateJsonData.value = template.templateJsonData || {}
  editingTemplateOriginalCategory.value =
    Number(template.templateType) === 2 ? 'algorithm' : 'business'
  editTemplateForm.templateName = template.templateName || ''
  editTemplateForm.templateType = Number(template.templateType) === 2 ? 2 : 1
  editTemplateDialogVisible.value = true
  await nextTick()
  editTemplateFormRef.value?.clearValidate()
}

const resetEditTemplateForm = () => {
  editingTemplateId.value = ''
  editingTemplateJsonData.value = {}
  editingTemplateOriginalCategory.value = 'business'
  editTemplateForm.templateName = ''
  editTemplateForm.templateType = undefined
  editTemplateFormRef.value?.clearValidate()
}

const submitEditTemplate = async () => {
  const valid = await editTemplateFormRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }
  if (!editingTemplateId.value) {
    ElMessage.error('模板ID无效')
    return
  }

  const payload: AddOrUpdateTemplateRequest = {
    id: editingTemplateId.value,
    templateName: editTemplateForm.templateName,
    templateType: editTemplateForm.templateType as TemplateType,
    templateJsonData: editingTemplateJsonData.value || {},
  }

  editTemplateSubmitting.value = true
  try {
    const response = await templateApi.addOrUpdateTemplate(payload)
    if (response.code !== 200) {
      ElMessage.error(response.msg || '编辑模板失败')
      return
    }

    ElMessage.success('编辑模板成功')
    editTemplateDialogVisible.value = false

    const currentCategory = templateCategory.value
    const editedCategory: TemplateCategory =
      editTemplateForm.templateType === 2 ? 'algorithm' : 'business'
    if (editingTemplateOriginalCategory.value !== editedCategory) {
      templatesByType[editedCategory] = []
    }
    await fetchTemplates(currentCategory)
  } catch (error) {
    console.error(error)
    ElMessage.error('编辑模板失败，请稍后重试')
  } finally {
    editTemplateSubmitting.value = false
  }
}

const onTemplateCommand = async (
  command: string | number | Record<string, unknown>,
  template: TemplateEntity,
) => {
  if (isTemplateLocked(template)) {
    ElMessage.warning('空白模板不支持编辑或删除')
    return
  }

  const action = String(command) as TemplateCommand
  if (action === 'edit') {
    await openEditTemplateDialog(template)
    return
  }
  if (action !== 'delete') return

  try {
    await ElMessageBox.confirm(`确认删除模板「${template.templateName}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    const response = await templateApi.deleteTemplate(String(template.id))
    if (response.code !== 200) {
      ElMessage.error(response.msg || '删除模板失败')
      return
    }
    ElMessage.success('模板删除成功')
    await fetchTemplates(templateCategory.value)
  } catch (error) {
    if (String(error).includes('cancel')) return
    console.error(error)
    ElMessage.error('删除模板失败，请稍后重试')
  }
}
</script>

<style scoped>
:deep(.workflow-create-dialog .el-dialog) {
  max-width: 1060px;
  border-radius: 10px;
}

:deep(.workflow-create-dialog .el-dialog__header) {
  margin-right: 0;
  border-bottom: 1px solid #d9e2ef;
  padding: 14px 18px;
}

:deep(.workflow-create-dialog .el-dialog__title) {
  font-size: 16px;
  /* font-weight: 600; */
  color: #111827;
}

:deep(.workflow-create-dialog .el-dialog__body) {
  padding: 0;
}

:deep(.workflow-create-dialog .el-dialog__footer) {
  border-top: 1px solid #d9e2ef;
  padding: 12px 16px;
}

.create-dialog-layout {
  display: grid;
  grid-template-columns: 288px 1fr;
  min-height: 520px;
}

.template-side {
  border-right: 1px solid #d9e2ef;
  background: #fcfdff;
  padding: 14px 16px;
}

.template-tabs {
  margin-bottom: 12px;
  border-radius: 6px;
  background: #f3f6fa;
  padding: 2px;
}

.template-tab {
  width: 50%;
  border: none;
  background: transparent;
  border-radius: 5px;
  height: 30px;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
}

.template-tab.active {
  background: #e8f1ff;
  color: #2563eb;
  font-weight: 600;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.template-card {
  border: 1px solid #cfdbea;
  border-radius: 8px;
  background: #fff;
  padding: 10px 12px 12px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgb(15 23 42 / 8%);
}

.template-card.selected {
  border-color: #4f9dff;
  box-shadow: 0 0 0 1px #4f9dff;
}

.template-card-toolbar {
  display: flex;
  justify-content: flex-end;
}

.template-preview {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.template-workflow-icon {
  position: relative;
  width: 88px;
  height: 68px;
  flex-shrink: 0;
}

.wf-ring {
  position: absolute;
  left: 20px;
  top: 15px;
  width: 46px;
  height: 46px;
  border: 6px solid #c8d8f5;
  border-radius: 999px;
}

.wf-node {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #3b82f6;
  border: 4px solid #dce8ff;
}

.wf-node.n1 {
  left: 34px;
  top: 0;
}

.wf-node.n2 {
  left: 8px;
  top: 36px;
}

.wf-node.n3 {
  left: 60px;
  top: 36px;
}

.template-mini-flow {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
}

.mini-node {
  width: 100%;
  height: 12px;
  border-radius: 4px;
  border: 1px solid #d6deea;
  background: #fff;
}

.template-title {
  margin-top: 10px;
  text-align: center;
  color: #0f172a;
  font-weight: 600;
}

.create-form {
  padding: 18px 14px 6px 12px;
}

.form-item {
  margin-bottom: 16px;
}

.required {
  margin-right: 2px;
  color: #ef4444;
}

.form-hint {
  margin: -8px 0 5px 0;
  font-size: 12px;
  color: #9ba1ad;
  line-height: 1.5;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.tag-input {
  width: 200px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 1024px) {
  .create-dialog-layout {
    grid-template-columns: 1fr;
  }

  .template-side {
    border-right: 0;
    border-bottom: 1px solid #d9e2ef;
  }
}
</style>
