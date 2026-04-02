<template>
  <div class="min-h-screen bg-[#f2f5f9] px-4 py-6 md:px-8">
    <div class="mx-auto w-full max-w-[1280px]">
      <header class="mb-5">
        <h1 class="text-2xl font-bold text-slate-900">工作流</h1>
      </header>

      <section
        class="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:flex-row md:items-center md:justify-between"
      >
        <div class="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
          <label
            class="flex w-full max-w-[420px] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
          >
            <Search :size="16" class="text-slate-400" />
            <input
              v-model.trim="keyword"
              type="text"
              placeholder="请输入关键词搜索工作流名称、标签..."
              class="w-full border-none bg-transparent text-sm text-slate-700 outline-none"
            />
          </label>

          <select
            v-model="groupFilter"
            class="h-[38px] min-w-[160px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
          >
            <option value="all">全部分组</option>
            <option v-for="group in groups" :key="group" :value="group">
              {{ group }}
            </option>
          </select>

          <div class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              class="inline-flex h-8 items-center gap-1 rounded-md px-3 text-sm transition"
              :class="
                viewMode === 'card'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              "
              @click="viewMode = 'card'"
            >
              <LayoutGrid :size="14" />
              卡片
            </button>
            <button
              type="button"
              class="inline-flex h-8 items-center gap-1 rounded-md px-3 text-sm transition"
              :class="
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              "
              @click="viewMode = 'list'"
            >
              <List :size="14" />
              列表
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex h-9 items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-3 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
            @click="handleAddGroup"
          >
            <Plus :size="14" />
            添加分组
          </button>
          <button
            type="button"
            class="inline-flex h-9 items-center gap-1 rounded-md bg-blue-600 px-3 text-sm font-medium text-white transition hover:bg-blue-700"
            @click="openCreateDialog"
          >
            <Plus :size="14" />
            创建工作流
          </button>
        </div>
      </section>

      <section v-if="viewMode === 'card'" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="item in filteredWorkflows"
          :key="item.id"
          class="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <button
            type="button"
            class="block w-full cursor-pointer text-left"
            @click="openEditor(item.id)"
          >
            <div class="flex h-40 items-center justify-center bg-slate-50 p-4">
              <div class="preview-flow">
                <div class="preview-node"></div>
                <div class="preview-line"></div>
                <div class="preview-node"></div>
                <div class="preview-line"></div>
                <div class="preview-node"></div>
                <div class="preview-line"></div>
                <div class="preview-node"></div>
              </div>
            </div>
            <div class="space-y-2 border-t border-slate-100 p-4">
              <h2 class="line-clamp-1 text-[15px] font-semibold text-slate-900">{{ item.name }}</h2>
              <p class="inline-flex items-center gap-1 text-xs text-slate-500">
                <MapPin :size="12" />
                {{ item.location }}
              </p>
              <p class="line-clamp-1 text-sm text-slate-600">{{ item.description }}</p>
            </div>
          </button>

          <div class="absolute right-2 top-2">
            <el-dropdown trigger="click" @command="onCardCommand($event, item)">
              <button
                type="button"
                class="grid h-8 w-8 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                @click.stop
              >
                <EllipsisVertical :size="16" />
              </button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">编辑</el-dropdown-item>
                  <el-dropdown-item command="copy">复制</el-dropdown-item>
                  <el-dropdown-item command="move">移动到分组</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </article>
      </section>

      <section v-else class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <el-table
          :data="filteredWorkflows"
          class="workflow-table"
          empty-text="暂无匹配的工作流"
          header-cell-class-name="workflow-table-header"
        >
          <el-table-column label="工作流" min-width="280">
            <template #default="{ row }">
              <button type="button" class="workflow-name-button" @click="openEditor(row.id)">
                <p class="truncate text-sm font-semibold text-slate-900">{{ row.name }}</p>
                <p class="truncate text-xs text-slate-500">{{ row.description }}</p>
              </button>
            </template>
          </el-table-column>
          <el-table-column prop="group" label="分组" min-width="140" />
          <el-table-column prop="updatedAt" label="更新时间" min-width="180" />
          <el-table-column label="操作" width="120" align="right">
            <template #default="{ row }">
              <el-dropdown trigger="click" @command="onCardCommand($event, row)">
                <button
                  type="button"
                  class="rounded-md px-2 py-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  操作
                </button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">编辑</el-dropdown-item>
                    <el-dropdown-item command="copy">复制</el-dropdown-item>
                    <el-dropdown-item command="move">移动到分组</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </section>
    </div>
  </div>

  <el-dialog
    v-model="createDialogVisible"
    title="创建工作流"
    min-width="60%"
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

        <div class="template-list">
          <article
            v-for="template in visibleTemplates"
            :key="template.id"
            class="template-card"
            :class="{ selected: selectedTemplateId === template.id }"
            @click="selectedTemplateId = template.id"
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
            <p class="template-title">{{ template.name }}</p>
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
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreateWorkflow">创建工作流</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { EllipsisVertical, LayoutGrid, List, MapPin, Plus, Search } from 'lucide-vue-next'

type ViewMode = 'card' | 'list'
type CardCommand = 'edit' | 'copy' | 'move' | 'delete'
type TemplateCommand = 'edit' | 'delete'
type TemplateCategory = 'business' | 'algorithm'

interface WorkflowItem {
  id: string
  name: string
  group: string
  location: string
  description: string
  updatedAt: string
}

interface WorkflowTemplate {
  id: string
  name: string
  category: TemplateCategory
}

const router = useRouter()
const keyword = ref('')
const groupFilter = ref('all')
const viewMode = ref<ViewMode>('card')

const workflows = ref<WorkflowItem[]>([
  {
    id: 'wf-gas-scan-01',
    name: '燃气灶具检测工作流',
    group: '苏州港华',
    location: '苏州港华',
    description: '燃气灶具检测工作流配置',
    updatedAt: '2026-04-02 13:40',
  },
  {
    id: 'wf-gas-scan-02',
    name: '燃气灶具检测工作流',
    group: '深圳燃气',
    location: '深圳燃气',
    description: '燃气灶具检测工作流配置',
    updatedAt: '2026-04-01 20:15',
  },
  {
    id: 'wf-safety-03',
    name: '入户安检识别工作流',
    group: '重庆燃气',
    location: '重庆燃气',
    description: '检测安检照片中的关键动作和风险项',
    updatedAt: '2026-03-30 09:10',
  },
])

const templates = ref<WorkflowTemplate[]>([
  { id: 'tpl-blank', name: '空白模板', category: 'business' },
  { id: 'tpl-gas-tools', name: '灶具检测', category: 'business' },
  { id: 'tpl-gas-wave', name: '波纹管检测', category: 'business' },
  { id: 'tpl-detection', name: '目标检测', category: 'algorithm' },
  { id: 'tpl-classify', name: '图像分类', category: 'algorithm' },
])

const groups = computed(() => [...new Set(workflows.value.map((item) => item.group))])

const filteredWorkflows = computed(() => {
  const term = keyword.value.toLowerCase()
  return workflows.value.filter((item) => {
    const groupMatch = groupFilter.value === 'all' || item.group === groupFilter.value
    if (!groupMatch) return false
    if (!term) return true
    return [item.name, item.group, item.location, item.description].some((text) =>
      text.toLowerCase().includes(term),
    )
  })
})

const createDialogVisible = ref(false)
const templateCategory = ref<TemplateCategory>('business')
const selectedTemplateId = ref('tpl-blank')
const tagInput = ref('')
const workflowCodeManualEdited = ref(false)

const createForm = reactive({
  name: '',
  code: '',
  tags: ['徐州港华'],
  description: '',
})

const visibleTemplates = computed(() =>
  templates.value.filter((template) => template.category === templateCategory.value),
)

const activeTemplateName = computed(() => {
  return (
    templates.value.find((template) => template.id === selectedTemplateId.value)?.name ?? '空白模板'
  )
})

const formatNow = () => {
  const now = new Date()
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
}

const normalizeWorkflowField = (value: string) => {
  return value
    .replace(/[^\u4e00-\u9fa5A-Za-z0-9_.\-\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trimStart()
}

const validateWorkflowField = (value: string) =>
  /^(?![_\s])[A-Za-z0-9\u4e00-\u9fa5_.\-\s]+$/.test(value)

const openEditor = (id: string) => {
  router.push(`/workflow/editor/${id}`)
}

const handleAddGroup = () => {
  ElMessage.info('分组管理功能可在后端接口接入后扩展')
}

const openCreateDialog = () => {
  createDialogVisible.value = true
  templateCategory.value = 'business'
  selectedTemplateId.value = 'tpl-blank'
  workflowCodeManualEdited.value = false
  createForm.name = ''
  createForm.code = ''
  createForm.tags = ['徐州港华']
  createForm.description = ''
  tagInput.value = ''
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

const submitCreateWorkflow = () => {
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

  const id = `wf-${Date.now()}`
  workflows.value.unshift({
    id,
    name: createForm.name,
    group: createForm.tags[0] ?? '未分组',
    location: createForm.tags[0] ?? '未设置',
    description: createForm.description || `由 ${activeTemplateName.value} 创建`,
    updatedAt: formatNow(),
  })

  createDialogVisible.value = false
  ElMessage.success('工作流创建成功')
  openEditor(id)
}

const onCardCommand = (command: string | number | Record<string, unknown>, item: WorkflowItem) => {
  const action = String(command) as CardCommand
  if (action === 'edit') {
    openEditor(item.id)
    return
  }
  if (action === 'copy') {
    workflows.value.unshift({
      ...item,
      id: `wf-copy-${Date.now()}`,
      name: `${item.name}（副本）`,
      updatedAt: formatNow(),
    })
    ElMessage.success('已复制工作流')
    return
  }
  if (action === 'move') {
    ElMessage.info(`“${item.name}”移动分组功能待接入`)
    return
  }
  workflows.value = workflows.value.filter((workflow) => workflow.id !== item.id)
  ElMessage.success('已删除工作流')
}

const onTemplateCommand = (
  command: string | number | Record<string, unknown>,
  template: WorkflowTemplate,
) => {
  const action = String(command) as TemplateCommand
  if (action === 'edit') {
    ElMessage.info(`“${template.name}”模板编辑功能待接入`)
    return
  }
  ElMessage.info(`“${template.name}”模板删除功能待接入`)
}
</script>

<style scoped>
.preview-flow {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-node {
  width: 54px;
  height: 16px;
  border-radius: 4px;
  background: #ffffff;
  border: 1px solid #cfd8e3;
  box-shadow: 0 1px 2px rgb(15 23 42 / 8%);
}

.preview-line {
  width: 2px;
  height: 10px;
  background: #cbd5e1;
}

.workflow-name-button {
  width: 100%;
  text-align: left;
}

:deep(.workflow-table .el-table__cell) {
  padding-top: 10px;
  padding-bottom: 10px;
}

:deep(.workflow-table-header) {
  background: #f8fafc !important;
  color: #334155;
  font-weight: 600;
}

:deep(.workflow-create-dialog) {
  margin-top: 0 !important;
}

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

.wf-node::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 5px;
  width: 2px;
  height: 2px;
  border-radius: 999px;
  background: white;
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
  font-size: 20px;
  line-height: 1;
  transform: scale(0.66);
  transform-origin: center top;
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

  .template-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .template-list {
    grid-template-columns: 1fr;
  }
}
</style>
