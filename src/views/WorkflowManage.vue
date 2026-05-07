<template>
  <div class="min-h-screen bg-[#ffffff] px-4 py-6 md:px-8">
    <div class="mx-auto w-full">
      <section
        class="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:flex-row md:items-center md:justify-between"
      >
        <div class="flex flex-col gap-3 md:flex-row md:items-center">
          <el-select v-model="groupFilter" class="min-w-[150px]" placeholder="请选择分组">
            <el-option label="全部分组" value="all" />
            <el-option label="未分组" value="others" />
            <el-option
              v-for="group in groupOptions"
              :key="group.id"
              :label="group.groupName"
              :value="group.id"
            />
          </el-select>
          <label
            class="flex w-full max-w-[420px] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
          >
            <Search :size="16" class="text-slate-400" />
            <input
              v-model.trim="keyword"
              type="text"
              placeholder="请输入关键词搜索工作流名称、标签..."
              class="min-w-[250px] border-none bg-transparent text-sm text-slate-700 outline-none"
              @keyup.enter="handleSearch"
            />
          </label>
          <button
            type="button"
            class="inline-flex min-w-[80px] h-9 items-center cursor-pointer gap-1 rounded-md border border-blue-200 bg-blue-50 px-3 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
            @click="handleSearch"
          >
            <Search :size="14" />
            搜索
          </button>

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
            class="inline-flex min-w-[100px] h-9 items-center cursor-pointer gap-1 rounded-md border border-blue-200 bg-blue-50 px-3 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
            @click="handleAddGroup"
          >
            <Plus :size="14" />
            添加分组
          </button>
          <button
            type="button"
            class="inline-flex min-w-[120px] h-9 items-center cursor-pointer gap-1 rounded-md bg-blue-600 px-3 text-sm font-medium text-white transition hover:bg-blue-700"
            @click="createDialogVisible = true"
          >
            <Plus :size="14" />
            创建工作流
          </button>
        </div>
      </section>

      <el-empty
        class="w-full h-full"
        v-if="viewMode === 'card' && workflowItems.length === 0 && !workflowLoading"
        description="暂无工作流"
      >
      </el-empty>
      <el-scrollbar
        ref="gridScrollbarRef"
        v-if="viewMode === 'card'"
        v-loading="workflowLoading"
        element-loading-text="加载中..."
        max-height="calc(100vh - 120px)"
        min-height="400px"
        :distance="100"
        @end-reached="loadMore"
        @scroll="onGridScroll"
      >
        <section
          v-loading="workflowLoading"
          element-loading-text="加载中..."
          class="grid gap-3 sm:grid-cols-3 xl:grid-cols-4"
        >
          <article
            v-for="item in workflowItems"
            :key="item.id"
            class="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
          >
            <button
              type="button"
              class="block w-full cursor-pointer text-left"
              @click="openEditor(item.id)"
            >
              <div
                :ref="(el) => setPreviewContainerRef(item.id, el)"
                class="relative flex h-40 items-center justify-center bg-slate-50 z-1"
              >
                <VueFlow
                  :key="getPreviewFlowKey(item.id, item.workflowJsonData)"
                  class="preview-flow-canvas w-full h-full bg-slate-50"
                  :nodes="getNode(item.workflowJsonData)"
                  :edges="getEdge(item.workflowJsonData)"
                  :node-types="allNodeTypes"
                  :default-viewport="getPreviewViewport(item.id, item.workflowJsonData)"
                  :min-zoom="PREVIEW_MIN_ZOOM"
                  :max-zoom="PREVIEW_MAX_ZOOM"
                  :zoom-on-scroll="false"
                  :zoom-on-pinch="false"
                  :zoom-on-double-click="false"
                  :pan-on-drag="false"
                  :pan-on-scroll="false"
                  :nodes-draggable="false"
                  :nodes-connectable="false"
                  :connect-on-click="false"
                  :elements-selectable="false"
                >
                  <!-- 自定义边 （类型为按钮）-->
                  <template #edge-button="buttonEdgeProps">
                    <EdgeWithButton
                      :id="buttonEdgeProps.id"
                      :source-x="buttonEdgeProps.sourceX"
                      :source-y="buttonEdgeProps.sourceY"
                      :target-x="buttonEdgeProps.targetX"
                      :target-y="buttonEdgeProps.targetY"
                      :source-position="buttonEdgeProps.sourcePosition"
                      :target-position="buttonEdgeProps.targetPosition"
                      :source-handle="buttonEdgeProps.sourceHandleId"
                      :marker-end="buttonEdgeProps.markerEnd"
                      :style="buttonEdgeProps.style"
                    />
                  </template>
                </VueFlow>
              </div>
              <div class="space-y-2 border-t border-slate-100 p-4">
                <div class="flex items-center gap-2">
                  <span class="line-clamp-1 text-[14px] font-bold text-slate-700">
                    {{ item.workflowName }}
                  </span>
                  <el-tag type="primary" v-if="item.groupLabel != '未分组'">
                    {{ item.groupLabel }}
                  </el-tag>
                </div>
                <p class="inline-flex items-center gap-1 text-xs text-slate-500">
                  <span
                    class="inline-flex items-center gap-1 text-xs text-slate-500 border border-slate-200 rounded-md px-2 py-1.5"
                    v-for="tag in item.workflowClass.split(',')"
                    :key="tag"
                  >
                    <Tag :size="12" />
                    {{ tag }}
                  </span>
                </p>
                <p class="line-clamp-1 text-xs text-slate-600">{{ item.description || '-' }}</p>
              </div>
            </button>
            <div class="absolute right-2 top-42">
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
                    <el-dropdown-item command="edit"> 编辑 </el-dropdown-item>
                    <el-dropdown-item command="copy"> 复制 </el-dropdown-item>
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
                    <el-dropdown-item command="delete" divided> 删除 </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </article>
        </section>
        <div v-if="workflowItems.length > 0" class="grid-load-footer">
          <p v-if="gridLoadMoreLoading" class="grid-load-hint is-loading">加载中...</p>
          <p v-else-if="!gridHasMore" class="grid-load-hint">没有更多数据了</p>
          <p v-else class="grid-load-hint">滚动到底部加载更多</p>
        </div>
      </el-scrollbar>

      <section v-else class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <el-table
          v-loading="workflowLoading"
          element-loading-text="加载中..."
          max-height="calc(100vh - 180px)"
          :data="workflowItems"
          class="workflow-table"
          empty-text="暂无匹配的工作流"
          header-cell-class-name="workflow-table-header"
        >
          <el-table-column prop="workflowName" label="工作流名称" min-width="280">
            <template #default="{ row }">
              <p class="text-[#409eff] cursor-pointer" @click="openEditor(row.id)">
                {{ row.workflowName }}
              </p>
            </template>
          </el-table-column>
          <el-table-column prop="workflowClass" label="标签" min-width="140">
            <template #default="{ row }">
              <el-tag
                class="mr-1"
                type="primary"
                v-for="tag in row.workflowClass.split(',')"
                :key="tag"
              >
                {{ tag }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="groupLabel" label="分组" min-width="180">
            <template #default="{ row }">
              {{ row.groupLabel === '未分组' ? '-' : row.groupLabel }}
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" min-width="180" />
          <el-table-column label="操作" width="340">
            <template #default="{ row }">
              <div class="list-action-bar">
                <el-tooltip content="编辑工作流" placement="top">
                  <el-button type="primary" link :icon="Edit" @click="onCardCommand('edit', row)">
                  </el-button>
                </el-tooltip>
                <el-tooltip content="复制工作流" placement="top">
                  <el-button
                    type="primary"
                    link
                    @click="onCardCommand('copy', row)"
                    :icon="Copy"
                  ></el-button>
                </el-tooltip>

                <el-popover
                  placement="right-start"
                  trigger="click"
                  :width="180"
                  popper-class="move-group-popover"
                  @show="onListMoveGroupVisibleChange(true)"
                >
                  <template #reference>
                    <el-button type="primary" link :icon="Group" title="移动分组"></el-button>
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
                      <el-button
                        type="primary"
                        link
                        :icon="X"
                        title="删除分组"
                        @click.stop="handleDeleteGroup(group.id)"
                      >
                      </el-button>
                    </div>
                  </div>
                  <div v-else class="move-group-empty">暂无分组</div>
                </el-popover>

                <el-tooltip content="删除工作流" placement="top">
                  <el-button
                    type="primary"
                    link
                    :icon="Trash2"
                    @click="onCardCommand('delete', row)"
                  >
                  </el-button>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div class="flex justify-end border-t border-slate-100 px-4 py-3">
          <el-config-provider :locale="zhCn">
            <el-pagination
              :current-page="pageNum"
              :page-size="pageSize"
              :page-sizes="[15, 20, 50, 100]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              background
              @size-change="handleListPageSizeChange"
              @current-change="handleListPageChange"
            />
          </el-config-provider>
        </div>
      </section>
    </div>
  </div>

  <CreateWorkflowDialog
    v-model="createDialogVisible"
    :default-tag="defaultCreateTag"
    @created="handleWorkflowCreated"
  />
  <EditWorkflowBaseDialog
    v-model="editDialogVisible"
    :workflow-id="editingWorkflowId"
    @updated="handleWorkflowBaseUpdated"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, type ComponentPublicInstance } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {
  ChevronRight,
  EllipsisVertical,
  LayoutGrid,
  List,
  Tag,
  Plus,
  Search,
  X,
  Edit,
  Copy,
  Trash2,
  Group,
} from 'lucide-vue-next'
import { VueFlow, type Edge, type Node } from '@vue-flow/core'
import { groupApi, workflowApi } from '@/api'
import type { WorkflowEntity, WorkflowListQuery } from '@/types/workflow-api'
import CreateWorkflowDialog from '@/components/Workflow/CreateWorkflowDialog.vue'
import EditWorkflowBaseDialog from '@/components/Workflow/EditWorkflowBaseDialog.vue'
import EdgeWithButton from '@/components/Workflow/Edges/EdgeWithButton.vue'
import { allNodeTypes, getNodeEdgeType } from '@/components/Workflow/config/nodeTypes'

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

interface PreviewSize {
  width: number
  height: number
}

interface FlowViewport {
  x: number
  y: number
  zoom: number
}

const router = useRouter()
const keyword = ref('')
const groupFilter = ref('all')
const viewMode = ref<ViewMode>('card')
const createDialogVisible = ref(false)
const editDialogVisible = ref(false)
const editingWorkflowId = ref('')

const pageNum = ref(1)
const pageSize = ref(15)
const total = ref(0)

const workflowLoading = ref(false)
const gridLoadMoreLoading = ref(false)
const gridHasMore = ref(true)
const groupLoading = ref(false)
const activeActionMenuKey = ref('')
const workflows = ref<WorkflowEntity[]>([])
const groups = ref<GroupOption[]>([])
const gridScrollbarRef = ref<{ wrapRef?: HTMLElement } | null>(null)
const previewSizes = ref<Record<string, PreviewSize>>({})
const previewObservers = new Map<string, ResizeObserver>()

const PREVIEW_PADDING = 20
const PREVIEW_MIN_ZOOM = 0.05
const PREVIEW_MAX_ZOOM = 0.6
const DEFAULT_NODE_WIDTH = 250
const DEFAULT_NODE_HEIGHT = 110

const GRID_LOAD_TRIGGER_DISTANCE = 120

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
    const groupId = item.workflowGroup !== undefined ? String(item.workflowGroup) : ''
    const groupLabel = groupMap.value.get(groupId) || '未分组'
    return {
      ...item,
      id: String(item.id),
      groupLabel,
      workflowClass: item.workflowClass || '',
      updatedAt: item.updateTime || item.createTime || '-',
    }
  })
})

const updatePreviewSize = (workflowId: string, element: HTMLElement) => {
  const rect = element.getBoundingClientRect()
  const width = Math.round(rect.width)
  const height = Math.round(rect.height)
  if (!width || !height) return

  const previous = previewSizes.value[workflowId]
  if (previous && previous.width === width && previous.height === height) return

  previewSizes.value = {
    ...previewSizes.value,
    [workflowId]: { width, height },
  }
}

const setPreviewContainerRef = (
  workflowId: string,
  target: Element | ComponentPublicInstance | null,
) => {
  const previousObserver = previewObservers.get(workflowId)
  if (previousObserver) {
    previousObserver.disconnect()
    previewObservers.delete(workflowId)
  }

  if (!target) return

  const element = target instanceof HTMLElement ? target : ((target as any).$el as HTMLElement)
  if (!(element instanceof HTMLElement)) return

  updatePreviewSize(workflowId, element)

  if (typeof ResizeObserver === 'undefined') return
  const observer = new ResizeObserver(() => updatePreviewSize(workflowId, element))
  observer.observe(element)
  previewObservers.set(workflowId, observer)
}

const parseWorkflowJsonData = (value: unknown): Record<string, any> | null => {
  if (!value) return null
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as Record<string, any>
    } catch {
      return null
    }
  }
  if (typeof value === 'object') return value as Record<string, any>
  return null
}

const normalizePreviewNodes = (value: unknown): Node[] => {
  if (!Array.isArray(value)) return []
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item, index) => {
      const node = item as Record<string, any>
      const rawPosition = (node.position ?? {}) as Record<string, unknown>
      const x = Number(rawPosition.x)
      const y = Number(rawPosition.y)
      return {
        ...node,
        id: String(node.id ?? `preview_node_${index}`),
        type: String(node.type ?? 'default'),
        position: {
          x: Number.isFinite(x) ? x : 40 + index * 80,
          y: Number.isFinite(y) ? y : 80,
        },
      } as Node
    })
}

const normalizePreviewEdges = (value: unknown): Edge[] => {
  if (!Array.isArray(value)) return []
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item, index) => {
      const edge = item as Record<string, any>
      return {
        ...getNodeEdgeType(),
        ...edge,
        id: String(edge.id ?? `preview_edge_${index}`),
        source: String(edge.source ?? ''),
        target: String(edge.target ?? ''),
        type: String(edge.type ?? 'button'),
        animated: edge.animated ?? true,
      } as Edge
    })
    .filter((edge) => edge.source && edge.target)
}

const getNodeBounds = (nodes: Node[]) => {
  if (!nodes.length) return null

  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  nodes.forEach((node) => {
    const x = Number(node.position?.x ?? 0)
    const y = Number(node.position?.y ?? 0)
    if (!Number.isFinite(x) || !Number.isFinite(y)) return

    const width = Number(
      (node as any).dimensions?.width ?? (node as any).width ?? DEFAULT_NODE_WIDTH,
    )
    const height = Number(
      (node as any).dimensions?.height ?? (node as any).height ?? DEFAULT_NODE_HEIGHT,
    )

    const nodeWidth = Number.isFinite(width) && width > 0 ? width : DEFAULT_NODE_WIDTH
    const nodeHeight = Number.isFinite(height) && height > 0 ? height : DEFAULT_NODE_HEIGHT

    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x + nodeWidth)
    maxY = Math.max(maxY, y + nodeHeight)
  })

  if (![minX, minY, maxX, maxY].every((value) => Number.isFinite(value))) return null

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  }
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const getNode = (workflowJsonData: unknown) => {
  const parsed = parseWorkflowJsonData(workflowJsonData)
  return normalizePreviewNodes(parsed?.ui_metadata?.nodes)
}

const getEdge = (workflowJsonData: unknown) => {
  const parsed = parseWorkflowJsonData(workflowJsonData)
  return normalizePreviewEdges(parsed?.edges ?? parsed?.ui_metadata?.edges)
}

const getPreviewViewport = (workflowId: string, workflowJsonData: unknown): FlowViewport => {
  const size = previewSizes.value[workflowId]
  const nodes = getNode(workflowJsonData)
  const bounds = getNodeBounds(nodes)

  if (!size || !bounds) {
    return { x: 0, y: 0, zoom: PREVIEW_MIN_ZOOM }
  }

  const usableWidth = Math.max(1, size.width - PREVIEW_PADDING * 2)
  const usableHeight = Math.max(1, size.height - PREVIEW_PADDING * 2)
  const zoomByWidth = usableWidth / bounds.width
  const zoomByHeight = usableHeight / bounds.height
  const zoom = clamp(Math.min(zoomByWidth, zoomByHeight), PREVIEW_MIN_ZOOM, PREVIEW_MAX_ZOOM)

  const centerX = bounds.minX + bounds.width / 2
  const centerY = bounds.minY + bounds.height / 2
  const x = size.width / 2 - centerX * zoom
  const y = size.height / 2 - centerY * zoom

  return { x, y, zoom }
}

const getPreviewFlowKey = (workflowId: string, workflowJsonData: unknown) => {
  const size = previewSizes.value[workflowId]
  const viewport = getPreviewViewport(workflowId, workflowJsonData)
  const width = size?.width ?? 0
  const height = size?.height ?? 0
  return [
    workflowId,
    width,
    height,
    viewport.x.toFixed(2),
    viewport.y.toFixed(2),
    viewport.zoom.toFixed(4),
  ].join('_')
}
const loadMore = async () => {
  if (viewMode.value !== 'card') return
  if (workflowLoading.value || gridLoadMoreLoading.value || !gridHasMore.value) return

  pageNum.value += 1
  const loaded = await fetchWorkflowList({ append: true })
  if (!loaded) {
    pageNum.value = Math.max(1, pageNum.value - 1)
  }
}

const onGridScroll = () => {
  if (viewMode.value !== 'card') return
  if (workflowLoading.value || gridLoadMoreLoading.value || !gridHasMore.value) return

  const wrapEl = gridScrollbarRef.value?.wrapRef
  if (!wrapEl || wrapEl.scrollHeight <= wrapEl.clientHeight) return

  const distanceToBottom = wrapEl.scrollHeight - (wrapEl.scrollTop + wrapEl.clientHeight)
  if (distanceToBottom <= GRID_LOAD_TRIGGER_DISTANCE) {
    void loadMore()
  }
}

const fetchWorkflowList = async ({ append = false }: { append?: boolean } = {}) => {
  const isCardAppend = append && viewMode.value === 'card'

  if (!isCardAppend && viewMode.value === 'card' && pageNum.value > 1) {
    pageNum.value = 1
  }

  if (isCardAppend) {
    gridLoadMoreLoading.value = true
  } else {
    workflowLoading.value = true
    if (viewMode.value === 'card' && pageNum.value === 1) {
      gridHasMore.value = true
    }
  }

  try {
    const query: WorkflowListQuery = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    }
    if (keyword.value) query.keyword = keyword.value
    console.log('groupFilter.value', groupFilter.value)

    if (groupFilter.value !== 'all') query.groupId = groupFilter.value

    const response = await workflowApi.getWorkflowList(query)
    if (response.code !== 200) {
      ElMessage.error(response.msg || '加载工作流失败')
      return false
    }

    const incomingRows = response.rows || []
    total.value = response.total || 0

    workflows.value = isCardAppend ? [...workflows.value, ...incomingRows] : incomingRows
    gridHasMore.value = workflows.value.length < total.value
    return true
  } catch (error) {
    console.error(error)
    ElMessage.error('加载工作流失败，请稍后重试')
    return false
  } finally {
    if (isCardAppend) {
      gridLoadMoreLoading.value = false
    } else {
      workflowLoading.value = false
    }
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

const onListMoveGroupVisibleChange = (visible: boolean) => {
  if (!visible) return
  void fetchGroups()
}

const openEditor = (id: string) => {
  router.push(`/workflow/editor/${id}`)
}

const openEditDialog = (id: string) => {
  editingWorkflowId.value = id
  editDialogVisible.value = true
  closeActionMenu()
}

const handleWorkflowCreated = async (workflowId: string) => {
  await fetchWorkflowList()
  openEditor(workflowId)
}

const handleWorkflowBaseUpdated = async () => {
  await fetchWorkflowList()
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
  const currentGroupId = item.workflowGroup !== undefined ? String(item.workflowGroup) : ''
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
    openEditDialog(item.id)
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

const handleListPageChange = (nextPage: number) => {
  if (pageNum.value === nextPage) return
  pageNum.value = nextPage
  fetchWorkflowList()
}

const handleListPageSizeChange = (nextPageSize: number) => {
  if (pageSize.value === nextPageSize) return
  pageSize.value = nextPageSize
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

watch(viewMode, async (mode) => {
  if (mode !== 'card') return
  if (pageNum.value === 1) return
  pageNum.value = 1
  await fetchWorkflowList()
})

onMounted(async () => {
  await Promise.all([fetchGroups(), fetchWorkflowList()])
})

onUnmounted(() => {
  if (queryTimer) clearTimeout(queryTimer)
  previewObservers.forEach((observer) => observer.disconnect())
  previewObservers.clear()
})
</script>

<style scoped>
* {
  font-family: 'auto';
}
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

.list-action-bar {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.list-action-btn {
  border: none;
  background: transparent;
  font-size: 13px;
  line-height: 1;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.list-action-btn:hover {
  background: #f1f5f9;
  color: #276cff;
}

.list-action-btn.danger {
  color: #d81c1c;
}

.list-action-btn.danger:hover {
  /* background: #fef2f2; */
  color: rgb(233, 36, 36);
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

.grid-load-footer {
  display: flex;
  justify-content: center;
  padding: 12px 0 18px;
}

.grid-load-hint {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1;
}

.grid-load-hint.is-loading::before {
  content: '';
  width: 12px;
  height: 12px;
  border-radius: 999px;
  border: 2px solid #cbd5e1;
  border-top-color: #3b82f6;
  animation: grid-load-spin 0.8s linear infinite;
}

@keyframes grid-load-spin {
  to {
    transform: rotate(360deg);
  }
}

:deep(.workflow-table .el-table__cell) {
  padding: 14px 15px;
}

:deep(.workflow-table-header) {
  background: #f8fafc !important;
  color: #64748b;
  font-weight: 600;
  font-size: 13px;
}
</style>
