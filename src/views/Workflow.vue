<template>
  <div
    class="relative flex h-screen w-full overflow-hidden bg-slate-50"
    @drop="onDrop"
    @dragover.prevent
  >
    <button
      type="button"
      class="absolute min-w-[200px] top-2 left-5 z-10 flex items-center gap-2 bg-white px-4 py-3 rounded-md border border-gray-200 cursor-pointer shadow-md"
      @click="handleBackClick"
    >
      <ChevronLeft :size="18" />
      <span class="font-size-[14px] text-slate-600">{{ backButtonText }}</span>
    </button>
    <div class="flex-1 relative inset-0 z-1 h-full w-full">
      <VueFlow
        class="basic-flow bg-white absolute z-2 top-0 left-0 right-0 bottom-0 overflow-auto"
        :nodes="nodesWithEvents"
        :edges="edgesWithEvents"
        :node-types="nodeTypesWithEvents"
        @node-click="onNodeClick"
        @pane-click="onPaneClick"
        @pane-drag="onPaneDrag"
        @nodes-change="onNodesChange"
        @edges-change="onEdgesChange"
        @node-drag-stop="onNodeDragStop"
        :default-viewport="{ zoom: 0.5 }"
        :min-zoom="0.2"
        :max-zoom="4"
        :pan-on-drag="!isLocked"
        :nodes-draggable="!isLocked"
        :nodes-connectable="!isLocked"
        :elements-selectable="!isLocked"
      >
        <template #edge-custom="customEdgeProps">
          <!--  -->
          <CustomEdge
            :id="customEdgeProps.id"
            :source-x="customEdgeProps.sourceX"
            :source-y="customEdgeProps.sourceY"
            :target-x="customEdgeProps.targetX"
            :target-y="customEdgeProps.targetY"
            :source-position="customEdgeProps.sourcePosition"
            :target-position="customEdgeProps.targetPosition"
            :data="customEdgeProps.data"
            :marker-end="customEdgeProps.markerEnd"
            :style="customEdgeProps.style"
          />
        </template>
        <template #edge-button="buttonEdgeProps">
          <EdgeWithButton
            :id="buttonEdgeProps.id"
            :source-x="buttonEdgeProps.sourceX"
            :source-y="buttonEdgeProps.sourceY"
            :target-x="buttonEdgeProps.targetX"
            :target-y="buttonEdgeProps.targetY"
            :source-position="buttonEdgeProps.sourcePosition"
            :target-position="buttonEdgeProps.targetPosition"
            :marker-end="buttonEdgeProps.markerEnd"
            :style="buttonEdgeProps.style"
          />
        </template>
        <template #connection-line="{ sourceX, sourceY, targetX, targetY }">
          <CustomConnectionLine
            :source-x="sourceX"
            :source-y="sourceY"
            :target-x="targetX"
            :target-y="targetY"
          />
        </template>
        <Background />
        <MiniMap v-if="showMinimap" class="mini-map" :pannable="true" :zoomable="true" />
      </VueFlow>

      <!-- 右上角工具栏 -->
      <WorkflowToolbar
        class="absolute top-0 right-2 z-10 w-[550px]"
        :nodes="store.nodes"
        :edges="store.edges"
        @save="handleSave"
        @export="handleExport"
        @import="handleImport"
        @health-check="handleHealthCheck"
        @clear-canvas="handleClearCanvas"
        @debug="handleDebug"
        @open-settings="handleOpenSettings"
        @open-help="handleOpenHelp"
        @toggle-history="toggleHistory"
      />
      <!-- 调试面板 -->
      <WorkflowDebugPanel
        v-if="isDebugVisible"
        class="absolute right-4 top-18 z-3"
        :nodes="store.nodes"
        :edges="store.edges"
        :selected-node="store.selectedNode"
        :history-length="store.historyStore.history.length"
        @close="toggleDebug"
        @recheck="handleRecheck"
      />

      <!-- 健康检查面板 -->
      <WorkflowHealthPanel
        v-if="isHealthCheckVisible"
        class="absolute right-4 top-18 z-4"
        @close="toggleHealthCheck"
        @recheck="handleRecheck"
      />

      <!-- 历史记录面板 -->
      <WorkflowHistoryPanel
        v-if="isHistoryVisible"
        class="absolute right-4 top-18 z-5"
        :history="store.historyStore.history"
        :current-index="store.historyStore.currentIndex"
        @close="toggleHistory"
        @select-history="handleSelectHistory"
      />

      <!-- 底部 控制栏 -->
      <ControlBar
        class="absolute bottom-0 left-0 right-0 z-2"
        :can-undo="store.canUndo"
        :can-redo="store.canRedo"
        :is-locked="isLocked"
        :show-minimap="showMinimap"
        @undo="handleUndoClick"
        @redo="handleRedoClick"
        @auto-layout="autoLayout"
        @zoom-in="handleZoomIn"
        @zoom-out="handleZoomOut"
        @toggle-lock="toggleLock"
        @toggle-minimap="toggleMinimap"
        @fit-view="handleFitView"
      />

      <!-- 浮动按钮 -->
      <FloatingButton @drag-start="onDragStart" />

      <!-- 属性面板 -->
      <div
        v-if="store.selectedNode"
        class="w-96 rounded-lg border-l border-gray-200 shadow-2xl absolute right-0 top-20 z-5"
      >
        <PropertiesPanel />
      </div>
    </div>

    <!-- <HistoryControl /> -->
    <!-- 组件库 -->
    <ComponentLibraryModal ref="componentLibraryModal" @select-component="handleComponentSelect" />
  </div>
</template>

<script setup lang="ts">
import '@vue-flow/controls/dist/style.css'
import { ChevronLeft } from 'lucide-vue-next'
import {
  applyEdgeChanges,
  applyNodeChanges,
  VueFlow,
  useVueFlow,
  type EdgeChange,
  type Edge,
  type Node,
  type NodeChange,
  type NodeMouseEvent,
} from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import { workflowApi } from '@/api'
import { useWorkflowStore } from '@/stores/workflow'
import type { WorkflowEntity } from '@/types/workflow-api'
import PropertiesPanel from '@/components/Workflow/PropertiesPanel/index.vue'
import FloatingButton from '@/components/Workflow/FloatingButton.vue'
import ControlBar from '@/components/Workflow/Control/ControlBar.vue'
import WorkflowToolbar from '@/components/Workflow/Control/WorkflowToolbar.vue'
import WorkflowHealthPanel from '@/components/Workflow/Control/WorkflowHealthPanel.vue'
import WorkflowHistoryPanel from '@/components/Workflow/Control/WorkflowHistoryPanel.vue'
import { allNodeTypes, getNodeType } from '@/components/Workflow/config/nodeTypes'
// import HistoryControl from '@/components/Workflow/HistoryControl.vue'
import EdgeWithButton from '@/components/Workflow/Edges/EdgeWithButton.vue'
import CustomEdge from '@/components/Workflow/Edges/CustomEdge.vue'
import CustomConnectionLine from '@/components/Workflow/Edges/CustomConnectionLine.vue'
import ComponentLibraryModal from '@/components/Workflow/ComponentLibraryModal.vue'
// import { getNodeEdgeType } from '@/components/Workflow/config/nodeTypes'
import WorkflowDebugPanel from '@/components/Workflow/Debug/WorkflowDebugPanel.vue'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, onUnmounted, ref, computed, markRaw, nextTick, watch } from 'vue'

const store = useWorkflowStore()
const route = useRoute()
const router = useRouter()
const { onInit, project, onConnect, fitView, viewport, setViewport } = useVueFlow()
const isFlowReady = ref(false)

const DEFAULT_WORKFLOW_NODES: Node[] = [
  {
    id: 'inputs',
    type: 'inputs',
    name: 'Inputs',
    position: { x: 100, y: 300 },
    data: [],
  } as Node,
  {
    id: 'outputs',
    type: 'outputs',
    name: 'Outputs',
    position: { x: 500, y: 300 },
    data: [],
  } as Node,
]

const DEFAULT_VIEWPORT = {
  x: 0,
  y: 0,
  zoom: 1,
}

const cloneWithJson = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const createDefaultNodes = (): Node[] => cloneWithJson(DEFAULT_WORKFLOW_NODES)

const parseWorkflowJsonData = (value: unknown): Record<string, any> | null => {
  if (!value) return null
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as Record<string, any>
    } catch (error) {
      console.warn('Parse workflowJson data failed:', error)
      return null
    }
  }
  if (typeof value === 'object') {
    return value as Record<string, any>
  }
  return null
}

const normalizeNodes = (value: unknown): Node[] => {
  if (!Array.isArray(value)) return createDefaultNodes()

  const nodes = value
    .filter((item) => item && typeof item === 'object')
    .map((item, index) => {
      const node = item as Record<string, any>
      const rawPosition = (node.position ?? node.ui_position ?? {}) as Record<string, unknown>
      const x = Number(rawPosition.x)
      const y = Number(rawPosition.y)
      return {
        ...node,
        id: String(node.id ?? `node_${index}`),
        type: String(node.type ?? 'custom'),
        name: String(node.name ?? `node_${index}`),
        position: {
          x: Number.isFinite(x) ? x : 100 + index * 80,
          y: Number.isFinite(y) ? y : 200,
        },
      } as Node
    })

  return nodes.length > 0 ? nodes : createDefaultNodes()
}

const normalizeEdges = (value: unknown): Edge[] => {
  if (!Array.isArray(value)) return []

  return value
    .filter((item) => item && typeof item === 'object')
    .map((item, index) => {
      const edge = item as Record<string, any>
      return {
        ...edge,
        id: String(edge.id ?? `edge_${index}`),
        source: String(edge.source ?? ''),
        target: String(edge.target ?? ''),
      } as Edge
    })
    .filter((item) => item.source && item.target)
}

const normalizeViewport = (value: unknown) => {
  const viewportInfo = (value ?? {}) as Record<string, unknown>
  const x = Number(viewportInfo.x)
  const y = Number(viewportInfo.y)
  const zoom = Number(viewportInfo.zoom)

  return {
    x: Number.isFinite(x) ? x : DEFAULT_VIEWPORT.x,
    y: Number.isFinite(y) ? y : DEFAULT_VIEWPORT.y,
    zoom: Number.isFinite(zoom) ? zoom : DEFAULT_VIEWPORT.zoom,
  }
}

const normalizeWorkflowJsonForStore = (value: unknown) => {
  const parsed = parseWorkflowJsonData(value)
  if (!parsed) return undefined

  const uiMetadata = (parsed.ui_metadata ?? {}) as Record<string, unknown>
  return {
    ...parsed,
    edges: Array.isArray(parsed.edges) ? parsed.edges : [],
    ui_metadata: {
      ...uiMetadata,
      nodes: Array.isArray(uiMetadata.nodes) ? uiMetadata.nodes : [],
      viewport: normalizeViewport(uiMetadata.viewport),
    },
  }
}

const applyViewportToCanvas = async (nextViewport: { x: number; y: number; zoom: number }) => {
  store.setViewportInfo(nextViewport)
  if (!isFlowReady.value) return
  try {
    await setViewport(nextViewport)
  } catch (error) {
    console.warn('Apply viewport to canvas failed:', error)
  }
}

const applyWorkflowCanvas = async (workflow: WorkflowEntity) => {
  const workflowJsonData = parseWorkflowJsonData(workflow.workflowJsonData)

  if (!workflowJsonData) {
    store.nodes = createDefaultNodes()
    store.edges = []
    await nextTick()
    await applyViewportToCanvas(DEFAULT_VIEWPORT)
    store.initializeHistory()
    return
  }
  console.log('workflowJsonData', workflowJsonData)
  const uiMetadata = (workflowJsonData.ui_metadata ?? {}) as Record<string, unknown>
  store.nodes = normalizeNodes(uiMetadata.nodes)
  store.edges = normalizeEdges(workflowJsonData.edges)
  await nextTick()
  await applyViewportToCanvas(normalizeViewport(uiMetadata.viewport))
  store.initializeHistory()
}

const syncViewportInfo = () => {
  store.setViewportInfo({
    x: viewport.value.x,
    y: viewport.value.y,
    zoom: viewport.value.zoom,
  })
}

const normalizeRouteId = (id: unknown) => {
  if (Array.isArray(id)) return String(id[0] ?? '')
  if (id === undefined || id === null) return ''
  return String(id)
}

const loadWorkflowInfo = async () => {
  const id = normalizeRouteId(route.params.id)
  if (!id) {
    store.setWorkflowInfo()
    await applyWorkflowCanvas(store.workflowInfo)
    return
  }

  try {
    const response = await workflowApi.getWorkflowInfo(id)
    const workflowInfo = response.data as WorkflowEntity | undefined
    if (response.code !== 200 || !workflowInfo) {
      console.warn(`Load workflow info failed: ${response.msg}`)
      return
    }

    const normalizedWorkflowInfo: WorkflowEntity = {
      ...workflowInfo,
      workflowJsonData: normalizeWorkflowJsonForStore(workflowInfo.workflowJsonData),
    }
    store.setWorkflowInfo(normalizedWorkflowInfo)
    await applyWorkflowCanvas(normalizedWorkflowInfo)
  } catch (error) {
    console.error('鑾峰彇宸ヤ綔娴佽鎯呭紓甯?', error)
  }
}

const backButtonText = computed(() => store.workflowInfo.workflowName || '返回')
const NODE_WIDTH = 300
const NODE_HEIGHT = 80
const NODE_HORIZONTAL_GAP = 80
const NODE_VERTICAL_GAP = 60
const NODE_COLUMN_STEP = NODE_WIDTH + NODE_HORIZONTAL_GAP
const NODE_ROW_STEP = NODE_HEIGHT + NODE_VERTICAL_GAP

const handleBackClick = async () => {
  document.exitFullscreen()
  if (window.history.length > 1) {
    await router.back()
    return
  }
  await router.push({ name: 'workflow-manage' })
}

// 璇存槑
const isLocked = ref(false)
const showMinimap = ref(true)
const isDebugVisible = ref(false)
const isHealthCheckVisible = ref(false)
const isHistoryVisible = ref(false)

const toggleDebug = () => {
  isDebugVisible.value = !isDebugVisible.value
  if (isDebugVisible.value) {
    handleRecheck()
  }
}

const toggleHealthCheck = () => {
  isHealthCheckVisible.value = !isHealthCheckVisible.value
  if (isHealthCheckVisible.value) {
    handleRecheck()
  }
}

const toggleHistory = () => {
  isHistoryVisible.value = !isHistoryVisible.value
}

// 保存工作流
const handleSave = () => {
  console.log('Save workflow')
}

const handleExport = () => {
  console.log('Export workflow')
}

const handleImport = () => {
  console.log('Import workflow')
}

const handleHealthCheck = () => {
  isHealthCheckVisible.value = true
  handleRecheck()
}

const handleRecheck = () => {
  store.performWorkflowHealthCheck()
}

const handleClearCanvas = () => {
  console.log('Clear canvas')
}

const handleDebug = () => {
  console.log('Debug workflow')
  toggleDebug()
}

const handleOpenSettings = () => {
  console.log('Open settings')
}

const handleOpenHelp = () => {
  console.log('Open help')
}

const handleSelectHistory = (index: number) => {
  const state = store.historyStore.history[index]?.state
  if (state) {
    store.nodes = state.nodes
    store.edges = state.edges
    store.historyStore.currentIndex = index
  }
}

// 璇存槑
const handleZoomIn = () => {
  viewport.value.zoom = Math.min(viewport.value.zoom + 0.1, 4)
  syncViewportInfo()
}

const handleZoomOut = () => {
  viewport.value.zoom = Math.max(viewport.value.zoom - 0.1, 0.2)
  syncViewportInfo()
}

const handleFitView = () => {
  // 璇存槑
  fitView({ padding: 0.2 })
}

// 节点事件
const nodesWithEvents = computed(() => store.nodes as Node[])
// 边事件
const edgesWithEvents = computed(() => store.edges as Edge[])

const onNodesChange = (changes: NodeChange[]) => {
  store.nodes = (applyNodeChanges as any)(changes, store.nodes) as Node[]
}

const onEdgesChange = (changes: EdgeChange[]) => {
  store.edges = (applyEdgeChanges as any)(changes, store.edges) as Edge[]
}

// 组件库
const componentLibraryModal = ref<InstanceType<typeof ComponentLibraryModal>>()

// 节点类型事件
const nodeTypesWithEvents = computed(() => {
  const enhancedNodeTypes: any = {}

  Object.keys(allNodeTypes).forEach((key) => {
    const nodeType: any = allNodeTypes[key]
    enhancedNodeTypes[key] = markRaw({
      ...nodeType,
      inheritAttrs: false,
    })
  })

  return enhancedNodeTypes
})

// 工具栏
console.log('Workflow  store:', store)
console.log('canUndo:', store.canUndo)
console.log('canRedo:', store.canRedo)

// 键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
  // Ctrl-Z
  if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
    event.preventDefault()
    store.undo()
  }
  // Ctrl-Y
  else if (
    (event.ctrlKey && event.key === 'y') ||
    (event.ctrlKey && event.shiftKey && event.key === 'z')
  ) {
    event.preventDefault()
    store.redo()
  }
}
// 连接事件
onConnect((connection) => {
  console.log('连接事件:', connection)
  // 连接事件
  const edge = {
    id: `edge_${Date.now()}`,
    source: connection.source,
    target: connection.target,
  }
  store.addEdge(edge)
})
// 初始化事件
onMounted(() => {
  document.documentElement.requestFullscreen()
  window.addEventListener('keydown', handleKeyDown)
  // 初始化事件
  onInit((vueFlowInstance) => {
    isFlowReady.value = true
    // 初始化事件
    const currentViewport = vueFlowInstance.getViewport()
    console.log('初始化事件:', currentViewport)
    void loadWorkflowInfo()
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  document.exitFullscreen()
  store.nodes = store.nodes.map((node) => ({
    ...node,
    selected: false,
  })) as Node[]
  store.setSelectedNode(null)
  store.clearCurrentHandleInfo()
  componentLibraryModal.value?.close()
})

watch(
  () => route.params.id,
  () => {
    void loadWorkflowInfo()
  },
)

watch(
  () => viewport.value,
  () => {
    syncViewportInfo()
  },
  { deep: true },
)

// 点击节点事件
const onNodeClick = (event: NodeMouseEvent) => {
  console.log('点击节点事件:', event.node.id, event.node.type, event.node.data)
  store.setSelectedNode(event.node.id)
}

// 拖拽开始事件
const onDragStart = (event: DragEvent, type: string) => {
  console.log('拖拽开始事件:', type)
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', type)
    event.dataTransfer.effectAllowed = 'move'
  }
}
// 璇存槑
const onPaneClick = (event: MouseEvent) => {
  console.log('点击画布事件:', event.clientX, event.clientY)
  store.setSelectedNode(null)
  componentLibraryModal.value?.close()
  store.clearCurrentHandleInfo()
}
// 拖拽画布事件
const onPaneDrag = (event: MouseEvent) => {
  console.log('拖拽画布事件:', event.clientX, event.clientY)
  store.clearCurrentHandleInfo()
}
// 拖拽结束事件
const onDrop = (event: DragEvent) => {
  const type = event.dataTransfer?.getData('application/vueflow')
  if (!type) return
  const position = project({ x: event.clientX, y: event.clientY })
  const nodeObj = getNodeType(type)
  if (!nodeObj) return
  const step = store.nodes.filter((n) => n.type === nodeObj.type).length

  const newNode = {
    id: step ? `${nodeObj.type}_${step}` : `${nodeObj.type}`,
    type: nodeObj.type,
    name: step ? `${nodeObj.name}_${step}` : nodeObj.name,
    position,
    data: {},
  }
  store.addNode(newNode)
}
// 自动布局事件
const autoLayout = async () => {
  const nodes = store.nodes
  const edges = store.edges
  if (!nodes.length) return

  // 自动布局事件
  const startX = 120
  const startY = 80
  const horizontalSpacing = NODE_COLUMN_STEP
  const verticalSpacing = NODE_ROW_STEP

  const nodeById = new Map(nodes.map((node) => [node.id, node]))
  const indegree = new Map<string, number>()
  const nodeParents = new Map<string, string[]>()
  const nodeChildren = new Map<string, string[]>()
  const nodeLevels = new Map<string, number>()

  nodes.forEach((node) => {
    indegree.set(node.id, 0)
    nodeParents.set(node.id, [])
    nodeChildren.set(node.id, [])
  })

  edges.forEach((edge) => {
    if (!nodeById.has(edge.source) || !nodeById.has(edge.target)) return
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1)
    nodeParents.get(edge.target)?.push(edge.source)
    nodeChildren.get(edge.source)?.push(edge.target)
  })

  const queue: string[] = []
  nodes.forEach((node) => {
    if ((indegree.get(node.id) ?? 0) === 0) {
      nodeLevels.set(node.id, 0)
      queue.push(node.id)
    }
  })

  // 自动布局事件
  if (!queue.length && nodes[0]) {
    nodeLevels.set(nodes[0].id, 0)
    queue.push(nodes[0].id)
  }

  // 自动布局事件
  while (queue.length) {
    const currentNodeId = queue.shift()!
    const currentLevel = nodeLevels.get(currentNodeId) ?? 0

    for (const childNodeId of nodeChildren.get(currentNodeId) ?? []) {
      nodeLevels.set(childNodeId, Math.max(nodeLevels.get(childNodeId) ?? 0, currentLevel + 1))
      const nextInDegree = (indegree.get(childNodeId) ?? 0) - 1
      indegree.set(childNodeId, nextInDegree)
      if (nextInDegree === 0) queue.push(childNodeId)
    }
  }

  // 自动布局事件
  let maxAssignedLevel = Math.max(...Array.from(nodeLevels.values()), 0)
  nodes.forEach((node) => {
    if (!nodeLevels.has(node.id)) {
      maxAssignedLevel += 1
      nodeLevels.set(node.id, maxAssignedLevel)
    }
  })

  const currentMaxLevel = Math.max(...Array.from(nodeLevels.values()), 0)
  nodes.forEach((node) => {
    if (node.type !== 'outputs') return

    const parentLevels = (nodeParents.get(node.id) ?? []).map(
      (parentId) => nodeLevels.get(parentId) ?? 0,
    )
    if (parentLevels.length) {
      nodeLevels.set(node.id, Math.max(...parentLevels) + 1)
      return
    }

    nodeLevels.set(node.id, currentMaxLevel + 1)
  })

  const levels = new Map<number, string[]>()
  nodeLevels.forEach((level, nodeId) => {
    if (!levels.has(level)) levels.set(level, [])
    levels.get(level)?.push(nodeId)
  })

  const sortedLevels = Array.from(levels.keys()).sort((a, b) => a - b)
  const yOrderByNodeId = new Map<string, number>()

  sortedLevels.forEach((level) => {
    const levelNodeIds = levels.get(level) ?? []
    const usedRows = new Set<number>()

    levelNodeIds.sort((a, b) => {
      const aParents = nodeParents.get(a) ?? []
      const bParents = nodeParents.get(b) ?? []

      const avg = (values: number[]) =>
        values.length
          ? values.reduce((sum, value) => sum + value, 0) / values.length
          : Number.POSITIVE_INFINITY

      const aScore = avg(aParents.map((parentId) => yOrderByNodeId.get(parentId) ?? 0))
      const bScore = avg(bParents.map((parentId) => yOrderByNodeId.get(parentId) ?? 0))

      if (aScore !== bScore) return aScore - bScore
      return a.localeCompare(b)
    })

    const findNearestFreeRow = (desiredRow: number) => {
      const normalizedDesiredRow = Math.max(0, desiredRow)
      if (!usedRows.has(normalizedDesiredRow)) return normalizedDesiredRow

      for (let step = 1; step <= levelNodeIds.length + 20; step += 1) {
        const lower = normalizedDesiredRow - step
        const upper = normalizedDesiredRow + step

        if (lower >= 0 && !usedRows.has(lower)) return lower
        if (!usedRows.has(upper)) return upper
      }

      return normalizedDesiredRow + usedRows.size
    }

    levelNodeIds.forEach((nodeId, index) => {
      const node = nodeById.get(nodeId)
      if (!node) return

      const parentRows = (nodeParents.get(nodeId) ?? [])
        .map((parentId) => yOrderByNodeId.get(parentId))
        .filter((row): row is number => row !== undefined)
      const desiredRow =
        parentRows.length > 0
          ? Math.round(parentRows.reduce((sum, row) => sum + row, 0) / parentRows.length)
          : index
      const rowIndex = findNearestFreeRow(desiredRow)

      usedRows.add(rowIndex)
      yOrderByNodeId.set(nodeId, rowIndex)
      node.position = {
        x: startX + level * horizontalSpacing,
        y: startY + rowIndex * verticalSpacing,
      }
    })
  })

  store.historyStore.recordState(store.nodes, store.edges, 'auto_layout')
  await nextTick()
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })
  fitView({ padding: 0.25 })
}

// 开启/关闭锁
const toggleLock = () => {
  isLocked.value = !isLocked.value
}

// 打开/关闭最小地图
const toggleMinimap = () => {
  showMinimap.value = !showMinimap.value
}

// 节点拖动停止事件
const onNodeDragStop = (event: NodeMouseEvent) => {
  console.log('节点拖动停止事件:', event.node.id, event.node.position)
  const nodeId = String(event.node.id)
  const nextPosition = {
    x: Number(event.node.position?.x ?? 0),
    y: Number(event.node.position?.y ?? 0),
  }
  store.nodes = store.nodes.map((node) =>
    String(node.id) === nodeId
      ? ({
          ...node,
          position: nextPosition,
        } as Node)
      : node,
  ) as Node[]
  store.historyStore.recordState(store.nodes, store.edges, 'node_drag')
}

// 撤销操作
const handleUndoClick = () => {
  console.log('Workflow undo clicked')
  console.log('canUndo:', store.canUndo)
  console.log('store:', store)
  store.undo()
}

const handleRedoClick = () => {
  console.log('Workflow redo clicked')
  console.log('canRedo:', store.canRedo)
  store.redo()
}

watch(
  () => store.currentHandleInfo,
  (newVal) => {
    if (newVal) {
      componentLibraryModal.value?.show(newVal.position.x, newVal.position.y)
    }
  },
)

// 解析新节点位置
const resolveNewNodePosition = (
  anchorNode: { id: string | number; position: { x: number; y: number } },
  handleType: 'source' | 'target',
) => {
  const nodes = store.nodes
  const edges = store.edges
  const direction = handleType === 'source' ? 1 : -1
  const columnGap = NODE_COLUMN_STEP
  const rowGap = NODE_ROW_STEP
  const minDeltaX = NODE_WIDTH + 20
  const minDeltaY = NODE_HEIGHT + 20
  const anchorX = anchorNode.position.x
  const anchorY = anchorNode.position.y

  const minX = Math.min(...nodes.map((node) => node.position.x), anchorX)
  const minY = Math.min(...nodes.map((node) => node.position.y), anchorY)

  const toColumnIndex = (x: number) => Math.round((x - minX) / columnGap)
  const toRowIndex = (y: number) => Math.round((y - minY) / rowGap)
  const fromColumnIndex = (index: number) => minX + index * columnGap
  const fromRowIndex = (index: number) => minY + index * rowGap

  const anchorColumnIndex = toColumnIndex(anchorX)
  const preferredColumnIndex = anchorColumnIndex + direction

  const relatedYValues =
    handleType === 'source'
      ? edges
          .filter((edge) => edge.source === anchorNode.id)
          .map((edge) => nodes.find((node) => node.id === edge.target)?.position.y)
          .filter((y): y is number => typeof y === 'number')
      : edges
          .filter((edge) => edge.target === anchorNode.id)
          .map((edge) => nodes.find((node) => node.id === edge.source)?.position.y)
          .filter((y): y is number => typeof y === 'number')

  const avg = (list: number[]) => list.reduce((sum, value) => sum + value, 0) / list.length
  const targetY = relatedYValues.length ? avg(relatedYValues) : anchorY
  const baseRowIndex = toRowIndex(targetY)

  const rowOffsets: number[] = [0]
  for (let i = 1; i <= 12; i += 1) {
    rowOffsets.push(i, -i)
  }

  const candidateColumnIndices: number[] = []
  for (let step = 0; step <= 10; step += 1) {
    const primary = preferredColumnIndex + direction * step
    if (!candidateColumnIndices.includes(primary)) {
      candidateColumnIndices.push(primary)
    }
    const secondary = preferredColumnIndex - direction * (step + 1)
    if (!candidateColumnIndices.includes(secondary)) {
      candidateColumnIndices.push(secondary)
    }
  }

  const isOccupied = (x: number, y: number) =>
    nodes.some((node) => {
      return Math.abs(node.position.x - x) < minDeltaX && Math.abs(node.position.y - y) < minDeltaY
    })

  for (const columnIndex of candidateColumnIndices) {
    const x = fromColumnIndex(columnIndex)
    for (const rowOffset of rowOffsets) {
      const y = fromRowIndex(baseRowIndex + rowOffset)
      if (!isOccupied(x, y)) {
        return { x, y }
      }
    }
  }

  return {
    x: anchorX + direction * columnGap,
    y: anchorY + rowGap,
  }
}
// 选择组件事件
const handleComponentSelect = (componentType: string) => {
  console.log('选择组件:', componentType)
  if (!store.currentHandleInfo) return

  const { nodeId } = store.currentHandleInfo

  // 获取组件类型对象
  const nodeObj = getNodeType(componentType)
  if (!nodeObj) return
  console.log('nodeObj:', nodeObj)
  // 获取当前节点对象
  const currentNode = store.nodes.find((n) => n.id === nodeId)
  if (!currentNode) return

  const newPosition = resolveNewNodePosition(currentNode, 'source')
  // 计算新节点的唯一ID
  const step = store.nodes.filter((n) => n.type === nodeObj.type).length
  console.log('allNodes-step:', step, store.nodes)

  // 创建新节点
  const newNode = {
    id: step ? `${nodeObj.type}_${step}` : `${nodeObj.type}`,
    type: nodeObj.type,
    name: step ? `${nodeObj.name}_${step}` : nodeObj.name,
    position: newPosition,
    data: {},
  }

  // 添加新节点
  store.addNode(newNode)
  // 添加新边
  const edge = {
    id: `edge_${Date.now()}`,
    source: nodeId,
    target: newNode.id,
  }
  store.addEdge(edge)

  // 打印新节点和边的信息
  console.log('新节点:', store.nodes)
  console.log('新边:', store.edges)

  // 清除当前节点信息
  store.clearCurrentHandleInfo()
}
</script>

<style>
/* 组件选择动画效果 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* 组件选择地图 */
.mini-map {
  position: absolute !important;
  /* bottom: 70px !important; */
  right: 10px !important;
  width: 200px !important;
  height: 150px !important;
  border: 1px solid #ccc !important;
  border-radius: 8px !important;
  background-color: rgba(255, 255, 255, 0.8) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}
</style>
