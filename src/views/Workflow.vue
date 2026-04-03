<template>
  <div class="flex h-screen w-full overflow-hidden bg-slate-50" @drop="onDrop" @dragover.prevent>
    <button
      type="button"
      class="absolute min-w-[200px] top-2 left-5 z-50 flex items-center gap-2 bg-white px-4 py-3 rounded-md border-b border-gray-200 cursor-pointer shadow-md"
      @click="handleBackClick"
    >
      <ChevronLeft :size="18" class="text-blue-500" />
      <span class="font-medium text-slate-600 hover:text-blue-500">{{ backButtonText }}</span>
    </button>
    <div class="flex-1 h-full relative">
      <VueFlow
        class="basic-flow bg-white"
        v-model:nodes="nodesWithEvents"
        v-model:edges="edgesWithEvents"
        :node-types="nodeTypesWithEvents"
        @node-click="onNodeClick"
        @pane-click="onPaneClick"
        @pane-drag="onPaneDrag"
        @node-drag-stop="onNodeDragStop"
        :default-viewport="{ zoom: 0.5 }"
        fit-view-on-init
        :min-zoom="0.2"
        :max-zoom="4"
        :pan-on-drag="!isLocked"
        :nodes-draggable="!isLocked"
        :nodes-connectable="!isLocked"
        :elements-selectable="!isLocked"
      >
        <!-- 自定义边渲染器，用于渲染自定义边 -->
        <template #edge-custom="customEdgeProps">
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
        <!-- 自定义边按钮渲染器，用于渲染自定义边按钮 -->
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
        <!-- 自定义连接线渲染器，用于渲染自定义连接线 -->
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

      <!-- 工作流工具栏（右上角） -->
      <WorkflowToolbar
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

      <!-- 调试信息面板组件 -->
      <WorkflowDebugPanel
        v-if="isDebugVisible"
        class="absolute right-4 top-16 z-20"
        :nodes="store.nodes"
        :edges="store.edges"
        :selected-node="store.selectedNode"
        :history-length="store.historyStore.history.length"
        @close="toggleDebug"
        @start-debug="handleStartDebug"
      />

      <!-- 健康检查面板 -->
      <WorkflowHealthPanel
        v-if="isHealthCheckVisible"
        ref="healthPanelRef"
        class="absolute right-4 top-16 z-20"
        :nodes="store.nodes"
        :edges="store.edges"
        @close="toggleHealthCheck"
        @recheck="handleRecheck"
      />

      <!-- 历史操作记录面板 -->
      <WorkflowHistoryPanel
        v-if="isHistoryVisible"
        class="absolute right-4 top-16 z-20"
        :history="store.historyStore.history"
        :current-index="store.historyStore.currentIndex"
        @close="toggleHistory"
        @select-history="handleSelectHistory"
      />

      <!-- 控制按钮栏 -->
      <ControlBar
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

      <!-- 悬浮按钮组件 -->
      <FloatingButton @drag-start="onDragStart" />
    </div>

    <div
      v-if="store.selectedNode"
      class="w-96 rounded-lg border-l border-gray-200 shadow-2xl absolute right-0 top-20 z-10"
    >
      <PropertiesPanel />
    </div>

    <!-- 演示控制组件历史记录 -->
    <!-- <HistoryControl /> -->

    <!-- 组件库选择弹窗 -->
    <ComponentLibraryModal ref="componentLibraryModal" @select-component="handleComponentSelect" />
  </div>
</template>

<script setup lang="ts">
import '@vue-flow/controls/dist/style.css'
import { ChevronLeft } from 'lucide-vue-next'
import { VueFlow, useVueFlow, type NodeMouseEvent, type NodeTypesObject } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import { useWorkflowStore } from '@/stores/workflow'
import PropertiesPanel from '@/components/Workflow/PropertiesPanel/index.vue'
import FloatingButton from '@/components/Workflow/FloatingButton.vue'
import ControlBar from '@/components/Workflow/Control/ControlBar.vue'
import WorkflowToolbar from '@/components/Workflow/Control/WorkflowToolbar.vue'
import WorkflowHealthPanel from '@/components/Workflow/Control/WorkflowHealthPanel.vue'
import WorkflowHistoryPanel from '@/components/Workflow/Control/WorkflowHistoryPanel.vue'
import { allNodeTypes, getNodeType } from '@/components/Workflow/config/nodeTypes'
import { onMounted, onUnmounted, ref, computed, markRaw, nextTick } from 'vue'
// import HistoryControl from '@/components/Workflow/HistoryControl.vue'
import EdgeWithButton from '@/components/Workflow/Edges/EdgeWithButton.vue'
import CustomEdge from '@/components/Workflow/Edges/CustomEdge.vue'
import CustomConnectionLine from '@/components/Workflow/Edges/CustomConnectionLine.vue'
import ComponentLibraryModal from '@/components/Workflow/ComponentLibraryModal.vue'
// import { getNodeEdgeType } from '@/components/Workflow/config/nodeTypes'
import WorkflowDebugPanel from '@/components/Workflow/Debug/WorkflowDebugPanel.vue'
import { useRouter } from 'vue-router'
import { watch } from 'vue'

const store = useWorkflowStore()
const router = useRouter()
const { onInit, project, onConnect, fitView, viewport } = useVueFlow()

const backButtonText = '\u8fd4\u56de\u5de5\u4f5c\u6d41\u7ba1\u7406'
const NODE_WIDTH = 300
const NODE_HEIGHT = 80
const NODE_HORIZONTAL_GAP = 80
const NODE_VERTICAL_GAP = 60
const NODE_COLUMN_STEP = NODE_WIDTH + NODE_HORIZONTAL_GAP
const NODE_ROW_STEP = NODE_HEIGHT + NODE_VERTICAL_GAP

const handleBackClick = async () => {
  if (window.history.length > 1) {
    await router.back()
    return
  }
  await router.push({ name: 'workflow-manage' })
}

// 状态变量
const isLocked = ref(false)
const showMinimap = ref(true)
const isDebugVisible = ref(false)
const isHealthCheckVisible = ref(false)
const isHistoryVisible = ref(false)
const healthPanelRef = ref<InstanceType<typeof WorkflowHealthPanel> | null>(null)

const toggleDebug = () => {
  isDebugVisible.value = !isDebugVisible.value
}

const toggleHealthCheck = () => {
  isHealthCheckVisible.value = !isHealthCheckVisible.value
  if (isHealthCheckVisible.value && healthPanelRef.value) {
    healthPanelRef.value.performHealthCheck()
  }
}

const toggleHistory = () => {
  isHistoryVisible.value = !isHistoryVisible.value
}

// 工作流工具栏处理函数
const handleSave = () => {
  console.log('保存工作流')
}

const handleExport = () => {
  console.log('导出工作流')
}

const handleImport = () => {
  console.log('导入工作流')
}

const handleHealthCheck = () => {
  isHealthCheckVisible.value = true
  setTimeout(() => {
    if (healthPanelRef.value) {
      healthPanelRef.value.performHealthCheck()
    }
  }, 100)
}

const handleRecheck = () => {
  if (healthPanelRef.value) {
    healthPanelRef.value.performHealthCheck()
  }
}

const handleClearCanvas = () => {
  console.log('清空画布')
}

const handleDebug = () => {
  console.log('调试工作流')
  toggleDebug()
}

const handleOpenSettings = () => {
  console.log('打开设置')
}

const handleOpenHelp = () => {
  console.log('打开帮助')
}

const handleSelectHistory = (index: number) => {
  console.log('选择历史记录:', index)
  const state = store.historyStore.history[index]?.state
  if (state) {
    store.nodes = state.nodes
    store.edges = state.edges
    store.historyStore.currentIndex = index
  }
}

// 放大/缩小/适合视图函数
const handleZoomIn = () => {
  viewport.value.zoom = Math.min(viewport.value.zoom + 0.1, 4)
}

const handleZoomOut = () => {
  viewport.value.zoom = Math.max(viewport.value.zoom - 0.1, 0.2)
}

const handleFitView = () => {
  // 使用VueFlow的fitView功能
  fitView({ padding: 0.2 })
}

// 修改节点数据以包含事件处理器
const nodesWithEvents = computed(() => {
  return store.nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      // onHandleClick: handleHandleClick,
    },
  }))
})
// 修改边数据以包含事件处理器
const edgesWithEvents = computed(() => {
  return store.edges.map((edge) => ({
    ...edge,
  }))
})

// 组件库弹窗引用
const componentLibraryModal = ref<InstanceType<typeof ComponentLibraryModal>>()

// 当前点击的handle信息

// 创建带事件的节点类型
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

// 调试信息
console.log('Workflow组件初始化 - store:', store)
console.log('canUndo:', store.canUndo)
console.log('canRedo:', store.canRedo)

// 键盘快捷键处理
const handleKeyDown = (event: KeyboardEvent) => {
  // Ctrl+Z 撤销
  if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
    event.preventDefault()
    store.undo()
  }
  // Ctrl+Y 重做 或 Ctrl+Shift+Z 重做
  else if (
    (event.ctrlKey && event.key === 'y') ||
    (event.ctrlKey && event.shiftKey && event.key === 'z')
  ) {
    event.preventDefault()
    store.redo()
  }
}
// 连接边事件处理
onConnect((connection) => {
  console.log('连接边:', connection)
  // 使用 store 的 addEdge 方法来确保历史记录被正确记录
  const edge = {
    id: `edge_${Date.now()}`,
    source: connection.source,
    target: connection.target,
    // sourceHandle: connection.sourceHandle,
    // targetHandle: connection.targetHandle,
    // ...getNodeEdgeType(),
  }
  store.addEdge(edge)
})
// 添加和移除键盘事件监听
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  // 初始化 VueFlow 实例
  onInit((vueFlowInstance) => {
    // 获取当前视图状态
    const viewport = vueFlowInstance.getViewport()
    // 设置zoom为0.5 xy居中
    vueFlowInstance.setViewport({ ...viewport, zoom: 1, x: 500, y: 100 })
    console.log('当前视图状态:', viewport)
    // 初始化历史记录
    console.log('初始化VueFlow，准备初始化历史记录')
    store.initializeHistory()
    console.log('历史记录初始化完成 - 记录数:', store.historyStore.history.length)
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// 节点点击事件
const onNodeClick = (event: NodeMouseEvent) => {
  console.log('点击节点:', event.node.id, event.node.type, event.node.data.config)
  store.setSelectedNode(event.node.id)
}

// --- 拖拽逻辑 ---
const onDragStart = (event: DragEvent, type: string) => {
  console.log('拖拽开始:', type)
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', type)
    event.dataTransfer.effectAllowed = 'move'
  }
}
// 工作流视图面板点击事件
const onPaneClick = (event: MouseEvent) => {
  console.log('点击面板:', event.clientX, event.clientY)
  // 清除选中节点
  store.setSelectedNode(null)
  // 关闭组件库弹窗
  componentLibraryModal.value?.close()
  // 清空当前handle信息
  store.clearCurrentHandleInfo()
}
// 工作流视图面板拖拽事件
const onPaneDrag = (event: MouseEvent) => {
  // !!!!!不生效
  console.log('拖拽面板:', event.clientX, event.clientY)
  store.clearCurrentHandleInfo()
}
// 组件库弹窗点击事件
const onDrop = (event: DragEvent) => {
  const type = event.dataTransfer?.getData('application/vueflow')
  if (!type) return
  const position = project({ x: event.clientX, y: event.clientY })
  const nodeType = getNodeType(type)
  if (!nodeType) return
  // 创建新节点，初始化空的 config，并添加handle点击事件处理器
  const newNode = {
    id: `${type}_${Date.now()}`,
    type: nodeType.type,
    position,
    data: {
      nodeTag: nodeType.type,
      config: [],
    },
  }
  store.addNode(newNode)
}
// 自动布局函数
const autoLayout = async () => {
  const nodes = store.nodes
  const edges = store.edges
  if (!nodes.length) return

  // 左到右布局，保证节点间不遮挡
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

  // 处理全环等极端情况
  if (!queue.length && nodes[0]) {
    nodeLevels.set(nodes[0].id, 0)
    queue.push(nodes[0].id)
  }

  // 拓扑遍历：子节点层级 = 父节点层级 + 1
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

  // 补齐未分配层级的节点（断开图/环）
  let maxAssignedLevel = Math.max(...Array.from(nodeLevels.values()), 0)
  nodes.forEach((node) => {
    if (!nodeLevels.has(node.id)) {
      maxAssignedLevel += 1
      nodeLevels.set(node.id, maxAssignedLevel)
    }
  })

  // 输出节点固定在最右列
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

  // 层内按父节点重心排序，然后按固定间距摆放，避免遮挡
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

// 切换锁定状态
const toggleLock = () => {
  isLocked.value = !isLocked.value
}

// 切换迷你地图显示状态
const toggleMinimap = () => {
  showMinimap.value = !showMinimap.value
}

// 节点拖拽结束事件
const onNodeDragStop = (event: any) => {
  console.log('节点拖拽结束:', event.node.id, event.node.position)
  // 记录拖拽后的状态
  store.historyStore.recordState(store.nodes, store.edges, 'node_drag')
}

// 撤销和重做点击处理
const handleUndoClick = () => {
  console.log('Workflow撤销按钮被点击')
  console.log('canUndo:', store.canUndo)
  console.log('store:', store)
  store.undo()
}

const handleRedoClick = () => {
  console.log('Workflow重做按钮被点击')
  console.log('canRedo:', store.canRedo)
  store.redo()
}

// 开始调试（从调试面板触发）
const handleStartDebug = (payload: {
  inputValues: Record<string, any>
  nodes: any[]
  edges: any[]
}) => {
  console.log('开始调试，输入数据：', payload.inputValues)
  console.log('当前节点：', payload.nodes)
  console.log('当前边：', payload.edges)
  // 这里可以对接实际推理 / 执行逻辑，例如调用后端 API 触发一次 workflow 运行
}
watch(
  () => store.currentHandleInfo,
  (newVal) => {
    if (newVal) {
      componentLibraryModal.value?.show(newVal.position.x, newVal.position.y)
    }
  },
)

// 组件选择处理
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
// 弹框组件库-选择处理
const handleComponentSelect = (componentType: string) => {
  console.log('选择了组件类型:', componentType)
  if (!store.currentHandleInfo) return

  const { nodeId } = store.currentHandleInfo

  // 创建新节点
  const nodeType = getNodeType(componentType)
  if (!nodeType) return
  console.log('nodeType:', nodeType)
  // 计算新节点的位置（在当前节点的右侧）
  const currentNode = store.nodes.find((n) => n.id === nodeId)
  if (!currentNode) return

  const newPosition = resolveNewNodePosition(currentNode, 'source')
  // 过滤
  const step = store.nodes.filter((n) => n.data.label === 'steps').length + 1
  // 获取所有node
  console.log('allNodes-step:', step)

  // 创建新节点
  const newNode = {
    id: `$${nodeType.name}_1`,
    type: nodeType.type,
    position: newPosition,
    data: {
      label: 'steps',
      config: [],
    },
  }

  // 添加新节点
  store.addNode(newNode)
  // 创建连接边
  // 从当前节点连接到新节点
  const edge = {
    id: `edge_${Date.now()}`,
    source: nodeId,
    target: newNode.id,
    // ...getNodeEdgeType(),
  }
  store.addEdge(edge)

  // 打印当前所有节点和边
  console.log('当前节点:', store.nodes)
  console.log('当前边:', store.edges)

  // 清空当前handle信息
  store.clearCurrentHandleInfo()
}
</script>

<style>
/* 右侧面板滑出动画 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* 迷你地图样式 */
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
