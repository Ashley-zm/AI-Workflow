<template>
  <el-dialog
    v-model="dialogVisible"
    title="创建工作流"
    width="60%"
    destroy-on-close
    class="workflow-create-dialog"
  >
    <div class="create-dialog-layout">
      <aside class="template-side">
        <div class="template-tabs">
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

        <div v-loading="templateLoading" class="template-list">
          <article
            v-for="template in visibleTemplates"
            :key="String(template.id)"
            class="template-card"
            :class="{ selected: selectedTemplateId === String(template.id) }"
            @click="selectedTemplateId = String(template.id)"
          >
            <div class="template-card-toolbar">
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
        </div>
      </aside>

      <main class="create-form">
        <div class="form-item">
          <label class="form-label"><span class="required">*</span>工作流名称</label>
          <p class="form-hint">
            支持中文、英文、数字、中划线、下划线、空格、点号，不能以下划线或空格开头
          </p>
          <el-input
            v-model.trim="createForm.name"
            placeholder="请输入"
            maxlength="50"
            @input="onWorkflowNameInput"
          />
        </div>

        <div class="form-item">
          <label class="form-label"><span class="required">*</span>工作流ID</label>
          <p class="form-hint">根据工作流名称自动生成，可修改</p>
          <el-input
            v-model.trim="createForm.code"
            placeholder="根据工作流名称自动生成，可修改"
            maxlength="60"
            @input="onWorkflowCodeInput"
          />
        </div>

        <div class="form-item">
          <label class="form-label"><span class="required">*</span>标签</label>
          <p class="form-hint">添加自定义标签，如归属业主、地区等</p>
          <div class="tag-row">
            <el-tag
              v-for="tag in createForm.tags"
              :key="tag"
              closable
              class="workflow-tag"
              @close="removeTag(tag)"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-model.trim="tagInput"
              class="tag-input"
              placeholder="请输入标签，回车添加"
              @keyup.enter="appendTag"
            />
          </div>
        </div>

        <div class="form-item">
          <label class="form-label">描述：</label>
          <el-input
            v-model.trim="createForm.description"
            type="textarea"
            :rows="4"
            maxlength="100"
            show-word-limit
            placeholder="请输入（简要描述工作流信息）"
          />
        </div>
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
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { EllipsisVertical } from 'lucide-vue-next'
import { templateApi, workflowApi } from '@/api'
import type { AddOrUpdateWorkflowRequest, TemplateEntity, TemplateType } from '@/types'

type TemplateCategory = 'business' | 'algorithm'
type TemplateCommand = 'delete'

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

const templatesByType = reactive<Record<TemplateCategory, TemplateEntity[]>>({
  business: [],
  algorithm: [],
})

const createForm = reactive({
  name: '',
  code: '',
  tags: [] as string[],
  description: '',
})

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const visibleTemplates = computed(() => templatesByType[templateCategory.value])

const selectedTemplate = computed(() => {
  return visibleTemplates.value.find((item) => String(item.id) === selectedTemplateId.value)
})

const normalizeWorkflowField = (value: string) => {
  return value
    .replace(/[^\u4e00-\u9fa5A-Za-z0-9_.\-\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trimStart()
}

const validateWorkflowField = (value: string) =>
  /^(?![_\s])[A-Za-z0-9\u4e00-\u9fa5_.\-\s]+$/.test(value)

const resetCreateForm = () => {
  workflowCodeManualEdited.value = false
  createForm.name = ''
  createForm.code = ''
  createForm.description = ''
  createForm.tags = props.defaultTag ? [props.defaultTag] : []
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
  createForm.name = normalizeWorkflowField(value)
}

const onWorkflowCodeInput = (value: string) => {
  workflowCodeManualEdited.value = true
  createForm.code = normalizeWorkflowField(value)
}

watch(
  () => createForm.name,
  (value) => {
    if (workflowCodeManualEdited.value) return
    createForm.code = normalizeWorkflowField(value).replace(/\s+/g, '-').toLowerCase()
  },
)

watch(
  () => props.defaultTag,
  (tag) => {
    if (!dialogVisible.value) return
    if (!tag) return
    if (createForm.tags.length === 0) {
      createForm.tags = [tag]
    }
  },
)

watch(dialogVisible, async (visible) => {
  if (!visible) return
  resetCreateForm()
  templateCategory.value = 'business'
  if (templatesByType.business.length === 0) {
    await fetchTemplates('business')
  } else {
    selectedTemplateId.value = String(templatesByType.business[0]?.id || '')
  }
})

watch(templateCategory, async (value) => {
  if (!dialogVisible.value) return
  if (templatesByType[value].length === 0) {
    await fetchTemplates(value)
  } else {
    selectedTemplateId.value = String(templatesByType[value][0]?.id || '')
  }
})

const appendTag = () => {
  const nextTag = normalizeWorkflowField(tagInput.value).trim()
  if (!nextTag) return
  if (createForm.tags.includes(nextTag)) {
    ElMessage.warning('标签已存在')
    return
  }
  createForm.tags.push(nextTag)
  tagInput.value = ''
}

const removeTag = (targetTag: string) => {
  createForm.tags = createForm.tags.filter((tag) => tag !== targetTag)
}

const submitCreateWorkflow = async () => {
  if (!createForm.name) {
    ElMessage.error('请填写工作流名称')
    return
  }
  if (!validateWorkflowField(createForm.name)) {
    ElMessage.error('工作流名称格式不正确')
    return
  }
  if (!createForm.code) {
    ElMessage.error('请填写工作流ID')
    return
  }
  if (!validateWorkflowField(createForm.code)) {
    ElMessage.error('工作流ID格式不正确')
    return
  }
  if (createForm.tags.length === 0) {
    ElMessage.error('请至少添加一个标签')
    return
  }

  const templateJsonData = selectedTemplate.value?.templateJsonData
  const workflowJsonData =
    typeof templateJsonData === 'string'
      ? templateJsonData
      : JSON.stringify(templateJsonData || {}, null, 2)

  const payload: AddOrUpdateWorkflowRequest = {
    workflowName: createForm.name,
    workflowId: createForm.code,
    workflowClass: createForm.tags.join(','),
    description: createForm.description,
    workflowJsonData,
  }

  creating.value = true
  try {
    const response = await workflowApi.addOrUpdateWorkflow(payload)
    if (response.code !== 200) {
      ElMessage.error(response.msg || '创建工作流失败')
      return
    }
    ElMessage.success('创建成功')
    dialogVisible.value = false
    emit('created', createForm.code)
  } catch (error) {
    console.error(error)
    ElMessage.error('创建工作流失败，请稍后重试')
  } finally {
    creating.value = false
  }
}

const onTemplateCommand = async (
  command: string | number | Record<string, unknown>,
  template: TemplateEntity,
) => {
  const action = String(command) as TemplateCommand
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
  font-weight: 600;
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
  display: inline-flex;
  border-radius: 6px;
  background: #f3f6fa;
  padding: 2px;
}

.template-tab {
  min-width: 92px;
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
  gap: 14px;
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

.form-label {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

.required {
  margin-right: 2px;
  color: #ef4444;
}

.form-hint {
  margin-bottom: 7px;
  font-size: 12px;
  color: #6b7280;
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

.workflow-tag {
  border-color: #ffd8a8;
  background: #fff3e0;
  color: #92400e;
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
