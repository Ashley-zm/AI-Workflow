<template>
  <div class="min-h-screen bg-[#ffffff] px-4 py-6 md:px-8">
    <div class="mx-auto w-full">
      <header class="mb-5">
        <h1 class="text-2xl font-bold text-slate-900">工作流</h1>
      </header>

      <section
        class="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:flex-row md:items-center md:justify-between"
      >
        <div class="flex flex-col gap-3 md:flex-row md:items-center">
          <label
            class="flex w-full max-w-[420px] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
          >
            <Search :size="16" class="text-slate-400" />
            <input
              v-model.trim="keyword"
              type="text"
              placeholder="请输入关键词搜索工作流名称、标签..."
              class="w-[250px] border-none bg-transparent text-sm text-slate-700 outline-none"
              @keyup.enter="handleSearch"
            />
          </label>
          <button
            type="button"
            class="inline-flex w-[180px] h-9 items-center cursor-pointer gap-1 rounded-md border border-blue-200 bg-blue-50 px-3 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
            @click="handleSearch"
          >
            <Search :size="14" />
            搜索
          </button>
          <el-select v-model="groupFilter" class="min-w-[160px]" placeholder="请选择分组">
            <el-option label="全部分组" value="all" />
            <el-option
              v-for="group in groupOptions"
              :key="group.id"
              :label="group.groupName"
              :value="group.id"
            />
          </el-select>

          <div class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              class="inline-flex h-8 w-[80px] items-center cursor-pointer gap-1 rounded-md px-3 text-sm transition"
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
              class="inline-flex h-8 w-[80px] items-center cursor-pointer gap-1 rounded-md px-3 text-sm transition"
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
            class="inline-flex h-9 items-center cursor-pointer gap-1 rounded-md border border-blue-200 bg-blue-50 px-3 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
            @click="handleAddGroup"
          >
            <Plus :size="14" />
            添加分组
          </button>
          <button
            type="button"
            class="inline-flex h-9 items-center cursor-pointer gap-1 rounded-md bg-blue-600 px-3 text-sm font-medium text-white transition hover:bg-blue-700"
            @click="createDialogVisible = true"
          >
            <Plus :size="14" />
            创建工作流
          </button>
        </div>
      </section>

      <section
        v-loading="workflowLoading"
        v-if="viewMode === 'card'"
        class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <article
          v-for="item in workflowItems"
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
              <h2 class="line-clamp-1 text-[15px] font-semibold text-slate-900">
                {{ item.workflowName }}
              </h2>
              <p class="inline-flex items-center gap-1 text-xs text-slate-500">
                <Tag :size="12" />
                {{ item.groupLabel }}
              </p>
              <p class="line-clamp-1 text-sm text-slate-600">{{ item.description || '-' }}</p>
            </div>
          </button>

          <div class="absolute right-2 top-2">
            <el-dropdown
              trigger="click"
              :visible="activeActionMenuKey === `card-${item.id}`"
              @visible-change="onCardActionMenuVisibleChange(item.id, $event)"
              @command="onCardCommand($event, item)"
            >
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
                  <el-dropdown-item class="move-group-dropdown-item" @click.stop>
                    <el-popover
                      placement="right-start"
                      trigger="hover"
                      :width="180"
                      popper-class="move-group-popover"
                      v-if="activeActionMenuKey"
                    >
                      <template #reference>
                        <div class="move-group-trigger">
                          <span>移动到分组</span>
                          <ChevronRight :size="14" />
                        </div>
                      </template>
                      <div v-if="groupLoading" class="move-group-empty">分组加载中...</div>
                      <div v-else-if="groupOptions.length" class="move-group-list">
                        <div
                          v-for="group in groupOptions"
                          :key="`move-${item.id}-${group.id}`"
                          class="move-group-option"
                          @click.stop="handleMoveToGroup(item, group.id)"
                        >
                          <span class="truncate">{{ group.groupName }}</span>
                          <button
                            type="button"
                            class="move-group-delete"
                            title="删除分组"
                            @click.stop="handleDeleteGroup(group.id)"
                          >
                            <X :size="12" />
                          </button>
                        </div>
                      </div>
                      <div v-else class="move-group-empty">暂无分组</div>
                    </el-popover>
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </article>
      </section>

      <section v-else class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <el-table
          v-loading="workflowLoading"
          :data="workflowItems"
          class="workflow-table"
          empty-text="暂无匹配的工作流"
          header-cell-class-name="workflow-table-header"
        >
          <el-table-column label="工作流" min-width="280">
            <template #default="{ row }">
              <button type="button" class="workflow-name-button" @click="openEditor(row.id)">
                <p class="truncate text-sm font-semibold text-slate-900">{{ row.workflowName }}</p>
                <p class="truncate text-xs text-slate-500">{{ row.description || '-' }}</p>
              </button>
            </template>
          </el-table-column>
          <el-table-column prop="groupLabel" label="分组" min-width="140" />
          <el-table-column prop="updatedAt" label="更新时间" min-width="180" />
          <el-table-column label="操作" width="120" align="right">
            <template #default="{ row }">
              <el-dropdown
                trigger="click"
                :visible="activeActionMenuKey === `list-${row.id}`"
                @visible-change="onListActionMenuVisibleChange(row.id, $event)"
                @command="onCardCommand($event, row)"
              >
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
                    <el-dropdown-item class="move-group-dropdown-item" @click.stop>
                      <el-popover
                        placement="right-start"
                        trigger="hover"
                        :width="180"
                        popper-class="move-group-popover"
                        v-if="activeActionMenuKey"
                      >
                        <template #reference>
                          <div class="move-group-trigger">
                            <span>移动到分组</span>
                            <ChevronRight :size="14" />
                          </div>
                        </template>
                        <div v-if="groupLoading" class="move-group-empty">分组加载中...</div>
                        <div v-else-if="groupOptions.length" class="move-group-list">
                          <div
                            v-for="group in groupOptions"
                            :key="`move-${row.id}-${group.id}`"
                            class="move-group-option"
                            @click.stop="handleMoveToGroup(row, group.id)"
                          >
                            <span class="truncate">{{ group.groupName }}</span>
                            <button
                              type="button"
                              class="move-group-delete"
                              title="删除分组"
                              @click.stop="handleDeleteGroup(group.id)"
                            >
                              <X :size="12" />
                            </button>
                          </div>
                        </div>
                        <div v-else class="move-group-empty">暂无分组</div>
                      </el-popover>
                    </el-dropdown-item>
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

  <CreateWorkflowDialog
    v-model="createDialogVisible"
    :default-tag="defaultCreateTag"
    @created="handleWorkflowCreated"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ChevronRight,
  EllipsisVertical,
  LayoutGrid,
  List,
  Tag,
  Plus,
  Search,
  X,
} from 'lucide-vue-next'
import { groupApi, workflowApi } from '@/api'
import type { WorkflowEntity, WorkflowListQuery } from '@/types'
import CreateWorkflowDialog from '@/components/Workflow/CreateWorkflowDialog.vue'

type ViewMode = 'card' | 'list'
type CardCommand = 'edit' | 'copy' | 'delete'

interface GroupOption {
  id: string
  groupName: string
}

interface WorkflowViewItem extends WorkflowEntity {
  id: string
  groupLabel: string
  updatedAt: string
}

const router = useRouter()
const keyword = ref('')
const groupFilter = ref('all')
const viewMode = ref<ViewMode>('card')
const createDialogVisible = ref(false)

const pageNum = ref(1)
const pageSize = ref(20)

const workflowLoading = ref(false)
const groupLoading = ref(false)
const activeActionMenuKey = ref('')
const workflows = ref<WorkflowEntity[]>([])
const groups = ref<GroupOption[]>([])

const groupOptions = computed(() => groups.value)

const groupMap = computed(() => {
  return new Map(groupOptions.value.map((item) => [item.id, item.groupName]))
})

const defaultCreateTag = computed(() => {
  if (groupFilter.value === 'all') return ''
  return groupMap.value.get(groupFilter.value) ?? ''
})

const workflowItems = computed<WorkflowViewItem[]>(() => {
  return workflows.value.map((item) => {
    const groupId = item.workflowGroupId !== undefined ? String(item.workflowGroupId) : ''
    const groupLabel = groupMap.value.get(groupId) || item.workflowClass || '未分组'
    return {
      ...item,
      id: String(item.id),
      groupLabel,
      updatedAt: item.updateTime || item.createTime || '-',
    }
  })
})

const fetchWorkflowList = async () => {
  workflowLoading.value = true
  try {
    const query: WorkflowListQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    }
    if (keyword.value) query.keyword = keyword.value
    if (groupFilter.value !== 'all') query.groupId = groupFilter.value

    const response = await workflowApi.getWorkflowList(query)
    if (response.code !== 200) {
      ElMessage.error(response.msg || '加载工作流失败')
      return
    }

    workflows.value = response.rows || []
  } catch (error) {
    console.error(error)
    ElMessage.error('加载工作流失败，请稍后重试')
  } finally {
    workflowLoading.value = false
  }
}

const fetchGroups = async () => {
  groupLoading.value = true
  try {
    const response = await groupApi.getGroupList()
    if (response.code !== 200) {
      ElMessage.error(response.msg || '加载分组失败')
      return
    }
    groups.value = (response.data || []).map((item) => ({
      id: String(item.id),
      groupName: item.groupName,
    }))
  } catch (error) {
    console.error(error)
    ElMessage.error('加载分组失败，请稍后重试')
  } finally {
    groupLoading.value = false
  }
}

const handleActionMenuVisibleChange = (visible: boolean, menuKey: string) => {
  if (visible) {
    activeActionMenuKey.value = menuKey
    void fetchGroups()
    return
  }
  if (activeActionMenuKey.value === menuKey) {
    activeActionMenuKey.value = ''
  }
}

const closeActionMenu = () => {
  activeActionMenuKey.value = ''
}

const onCardActionMenuVisibleChange = (id: string, visible: boolean) => {
  handleActionMenuVisibleChange(visible, `card-${id}`)
}

const onListActionMenuVisibleChange = (id: string, visible: boolean) => {
  handleActionMenuVisibleChange(visible, `list-${id}`)
}

const openEditor = (id: string) => {
  router.push(`/workflow/editor/${id}`)
}

const handleWorkflowCreated = async (workflowId: string) => {
  await fetchWorkflowList()
  openEditor(workflowId)
}

const handleAddGroup = async () => {
  try {
    const promptResult = (await ElMessageBox.prompt('请输入分组名称', '添加分组', {
      inputPlaceholder: '例如：苏州港华',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })) as { value?: string }
    const groupName = (promptResult.value || '').trim()
    if (!groupName) return
    const response = await groupApi.addGroup({ groupName })
    if (response.code !== 200) {
      ElMessage.error(response.msg || '添加分组失败')
      return
    }
    ElMessage.success('分组创建成功')
    await fetchGroups()
  } catch (error) {
    if (String(error).includes('cancel')) return
    console.error(error)
    ElMessage.error('添加分组失败，请稍后重试')
  }
}

const handleMoveToGroup = async (item: WorkflowViewItem, groupId: string) => {
  closeActionMenu()
  const currentGroupId = item.workflowGroupId !== undefined ? String(item.workflowGroupId) : ''
  if (currentGroupId === String(groupId)) return

  try {
    const response = await groupApi.workflowAddGroup({
      workflowId: item.id,
      groupId: String(groupId),
    })
    if (response.code !== 200) {
      ElMessage.error(response.msg || '移动失败')
      return
    }
    ElMessage.success('移动成功')
    await fetchWorkflowList()
  } catch (error) {
    console.error(error)
    ElMessage.error('移动失败，请稍后重试')
  }
}

const handleDeleteGroup = async (groupId: string) => {
  closeActionMenu()
  try {
    await ElMessageBox.confirm(
      '确认删除该分组？删除后，该分组所有工作流将归属到【未分组】！',
      '删除分组',
      {
        type: 'warning',
        confirmButtonText: '确认',
        cancelButtonText: '取消',
      },
    )
    const response = await groupApi.deleteGroup(String(groupId))
    if (response.code !== 200) {
      ElMessage.error(response.msg || '删除分组失败')
      return
    }

    if (groupFilter.value === String(groupId)) {
      groupFilter.value = 'all'
    }

    ElMessage.success('删除分组成功')
    await Promise.all([fetchGroups(), fetchWorkflowList()])
  } catch (error) {
    if (String(error).includes('cancel')) return
    console.error(error)
    ElMessage.error('删除分组失败，请稍后重试')
  }
}
const onCardCommand = async (
  command: string | number | Record<string, unknown>,
  item: WorkflowViewItem,
) => {
  const action = String(command ?? '') as CardCommand | ''

  if (action === 'edit') {
    openEditor(item.id)
    return
  }

  if (action === 'copy') {
    try {
      const response = await workflowApi.copyWorkflow(item.id)
      if (response.code !== 200) {
        ElMessage.error(response.msg || '复制失败')
        return
      }
      ElMessage.success('复制成功')
      await fetchWorkflowList()
    } catch (error) {
      console.error(error)
      ElMessage.error('复制失败，请稍后重试')
    }
    return
  }

  if (action !== 'delete') {
    return
  }

  try {
    await ElMessageBox.confirm(`确认删除工作流「${item.workflowName}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    const response = await workflowApi.deleteWorkflow(item.id)
    if (response.code !== 200) {
      ElMessage.error(response.msg || '删除失败')
      return
    }
    ElMessage.success('删除成功')
    await fetchWorkflowList()
  } catch (error) {
    if (String(error).includes('cancel')) return
    console.error(error)
    ElMessage.error('删除失败，请稍后重试')
  }
}

let queryTimer: ReturnType<typeof setTimeout> | undefined

const handleSearch = () => {
  if (queryTimer) clearTimeout(queryTimer)
  pageNum.value = 1
  fetchWorkflowList()
}

watch([keyword, groupFilter], () => {
  if (queryTimer) clearTimeout(queryTimer)
  queryTimer = setTimeout(() => {
    pageNum.value = 1
    fetchWorkflowList()
  }, 300)
})

onMounted(async () => {
  await Promise.all([fetchGroups(), fetchWorkflowList()])
})

onUnmounted(() => {
  if (queryTimer) clearTimeout(queryTimer)
})
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

:deep(.move-group-popover) {
  padding: 8px;
}

.move-group-trigger {
  display: flex;
  min-width: 150px;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.move-group-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 150px;
}

.move-group-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-radius: 6px;
  padding: 6px 8px;
  cursor: pointer;
}

.move-group-option:hover {
  background: #f1f5f9;
}

.move-group-delete {
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.move-group-delete:hover {
  color: #ef4444;
}

.move-group-empty {
  min-width: 150px;
  color: #94a3b8;
  font-size: 12px;
  padding: 6px 8px;
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
</style>
