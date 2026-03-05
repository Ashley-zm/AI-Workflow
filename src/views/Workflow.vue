<template>
  <div
    class="flex h-screen w-full overflow-hidden bg-slate-50"
    @drop="onDrop"
    @dragover.prevent
  >
    <div class="flex-1 h-full relative">
      <VueFlow
        class="basic-flow bg-white"
        v-model:nodes="nodesWithEvents"
        v-model:edges="store.edges"
        :node-types="nodeTypesWithEvents"
        @node-click="onNodeClick"
        @pane-click="onPaneClick"
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
        <Background pattern-color="#999" :gap="24" :size="1.5" />
        <MiniMap v-if="showMinimap" class="mini-map" :pannable="true" :zoomable="true" />
      </VueFlow>

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
      <FloatingButton
        @drag-start="onDragStart"
        @select-component="handleComponentSelect"
      />
    </div>

    <div
      v-if="store.selectedNode"
      class="w-96 rounded-lg border-l border-gray-200 shadow-2xl absolute right-0 top-10 z-10"
    >
      <PropertiesPanel />
    </div>

    <!-- 演示控制组件历史记录 -->
    <!-- <DemoControls /> -->

    <!-- 组件库选择弹窗 -->
    <ComponentLibraryModal
      ref="componentLibraryModal"
      @select-component="handleComponentSelect"
    />
  </div>
</template>

<script setup lang="ts">
import '@vue-flow/controls/dist/style.css'
import { VueFlow, useVueFlow, type NodeMouseEvent, type NodeTypesObject } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import { useWorkflowStore } from '@/stores/workflow'
import PropertiesPanel from '@/components/Workflow/PropertiesPanel/index.vue'
import FloatingButton from '@/components/Workflow/FloatingButton.vue'
import ControlBar from '@/components/Workflow/ControlBar.vue'
import { nodeTypes, getNodeType } from '@/components/Workflow/Nodes/nodeTypes'
import { onMounted, onUnmounted, ref, computed, markRaw } from 'vue'
// import DemoControls from '@/components/Workflow/DemoControls.vue'
import ComponentLibraryModal from '@/components/Workflow/ComponentLibraryModal.vue'
import EdgeWithButton from '@/components/Workflow/EdgeWithButton.vue'
import { MarkerType } from '@vue-flow/core'

const store = useWorkflowStore()
const { onInit, project, onConnect, addNodes, addEdges, viewport, fitView } = useVueFlow()

// 状态变量
const isLocked = ref(false)
const showMinimap = ref(false)

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
      onHandleClick: handleHandleClick,
    },
  }))
})

// 组件库弹窗引用
const componentLibraryModal = ref<InstanceType<typeof ComponentLibraryModal>>()

// 当前点击的handle信息
const currentHandleInfo = ref<{
  nodeId: string
  handleType: 'source' | 'target'
  position: { x: number; y: number }
} | null>(null)

// 创建带事件的节点类型
const nodeTypesWithEvents = computed(() => {
  const enhancedNodeTypes: any = {}

  Object.keys(nodeTypes).forEach((key) => {
    const nodeType: any = nodeTypes[key]
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
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#555',
    },
    style: {
      stroke: '#555',
    },
    animated: true,
    type: 'button',
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
    vueFlowInstance.setViewport({ ...viewport, zoom: 1, x: 300, y: 100 })
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
// 面板点击事件
const onPaneClick = (event: MouseEvent) => {
  console.log('点击面板:', event.clientX, event.clientY)
  // 清除选中节点
  store.setSelectedNode(null)
  // 关闭组件库弹窗
  componentLibraryModal.value?.close()
  // 清空当前handle信息
  currentHandleInfo.value = null
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
    name: nodeType.name,
    data:
      type === 'object_detection_model'
        ? {
            config: {
              imagePath: '',
              model: '',
              modelInfo: null,
            },
            onHandleClick: handleHandleClick,
          }
        : {
            onHandleClick: handleHandleClick,
          },
  }

  // 使用 store 的 addNode 方法来确保历史记录被正确记录
  store.addNode(newNode)
}
// 自动布局函数
const autoLayout = () => {
  console.log('自动布局函数被调用')
  const nodes = store.nodes
  const edges = store.edges
  
  console.log('节点数量:', nodes.length, '边数量:', edges.length)
  
  // 设置布局参数
  const verticalSpacing = 180 // 节点之间的垂直间距
  const horizontalSpacing = 300 // 节点之间的水平间距
  // 屏幕宽度的中间
  const startX = window.innerWidth / 4 // 起始X坐标（居中）
  console.log('起始X坐标:', window.innerWidth, startX);
  
  const startY = 0 // 起始Y坐标
  
  // 创建节点层级关系 - 完全基于边关系，不考虑原始位置
  const nodeLevels: Record<string, number> = {}
  const processedNodes: Record<string, boolean> = {}
  const nodeParents: Record<string, string[]> = {} // 记录每个节点的父节点
  const nodeChildren: Record<string, string[]> = {} // 记录每个节点的子节点
  
  // 重置所有节点的处理状态
  nodes.forEach(node => {
    processedNodes[node.id] = false
    nodeParents[node.id] = []
    nodeChildren[node.id] = []
  })
  
  // 根据边建立父子关系
  edges.forEach(edge => {
    if (!nodeParents[edge.target]) {
      nodeParents[edge.target] = []
    }
    if (!nodeChildren[edge.source]) {
      nodeChildren[edge.source] = []
    }
    nodeParents[edge.target]!.push(edge.source)
    nodeChildren[edge.source]!.push(edge.target)
  })
  
  // 优先找出类型为'inputs'的节点作为根节点
  const inputNodes = nodes.filter(node => node.type === 'inputs')
  console.log('输入节点:', inputNodes)
  
  // 为输入节点设置层级0
  inputNodes.forEach(node => {
    nodeLevels[node.id] = 0
    processedNodes[node.id] = true
  })
  
  // 如果没有inputs节点，找出没有入边的节点作为起始节点
  if (inputNodes.length === 0) {
    const noIncomingEdgeNodes = nodes.filter(node => {
      return !edges.some(edge => edge.target === node.id)
    })
    
    console.log('无入边节点:', noIncomingEdgeNodes)
    
    noIncomingEdgeNodes.forEach(node => {
      nodeLevels[node.id] = 0
      processedNodes[node.id] = true
    })
  }
  
  // 如果仍然没有起始节点（例如环形连接），选择第一个节点作为起始节点
  if (Object.keys(nodeLevels).length === 0 && nodes.length > 0) {
    const firstNode = nodes[0]
    if (firstNode) {
      nodeLevels[firstNode.id] = 0
      processedNodes[firstNode.id] = true
      console.log('选择第一个节点作为起始节点:', firstNode.id)
    }
  }
  
  // 使用BFS计算节点层级 - 完全基于边关系
  const queue: string[] = Object.keys(nodeLevels).filter(nodeId => nodeLevels[nodeId] === 0)
  
  while (queue.length > 0) {
    const currentNodeId = queue.shift()!
    const currentLevel = nodeLevels[currentNodeId]
    
    // 处理当前节点的所有子节点
    const children = nodeChildren[currentNodeId]
    if (children) {
      children.forEach(childNodeId => {
        if (!processedNodes[childNodeId]) {
          // 检查是否所有父节点都已处理
          const parents = nodeParents[childNodeId]
          if (parents) {
            const allParentsProcessed = parents.every(parentId => processedNodes[parentId])
            
            if (allParentsProcessed) {
              // 计算子节点的层级（所有父节点层级的最大值+1）
              const maxParentLevel = Math.max(...parents.map(parentId => nodeLevels[parentId] || 0))
              nodeLevels[childNodeId] = maxParentLevel + 1
              processedNodes[childNodeId] = true
              queue.push(childNodeId)
            }
          }
        }
      })
    }
  }
  
  // 为未处理的节点分配层级
  nodes.forEach(node => {
    if (!processedNodes[node.id]) {
      if (node.type === 'outputs') {
        // 输出节点放在最后
        const maxLevel = Math.max(...Object.values(nodeLevels), 0)
        nodeLevels[node.id] = maxLevel + 1
        processedNodes[node.id] = true
      } else {
        // 其他节点放在中间
        nodeLevels[node.id] = 1
        processedNodes[node.id] = true
      }
    }
  })
  
  console.log('节点层级:', nodeLevels)
  
  // 按层级分组节点
  const levels: Record<number, any[]> = {}
  Object.keys(nodeLevels).forEach(nodeId => {
    const level = nodeLevels[nodeId]
    if (level !== undefined && level !== null) {
      if (!levels[level]) {
        levels[level] = []
      }
      const node = nodes.find(n => n.id === nodeId)
      if (node) {
        levels[level].push(node)
      }
    }
  })
  
  // 按层级排序
  const sortedLevels = Object.keys(levels).map(Number).sort((a, b) => a - b)
  
  // 设置节点位置 - 完全重新计算位置，不考虑原始位置
  sortedLevels.forEach(level => {
    const levelNodes = levels[level]
    if (!levelNodes) {
      return
    }
    
    // 计算该层节点的位置
    const levelNodeCount = levelNodes.length
    const levelTotalWidth = (levelNodeCount - 1) * horizontalSpacing
    const levelStartX = startX - levelTotalWidth / 2
    
    // 对同层节点进行排序，使布局更加有序
    levelNodes.sort((a, b) => {
      // 如果两个节点有共同的父节点，按照父节点的顺序排列
      const aParents = nodeParents[a.id] || []
      const bParents = nodeParents[b.id] || []
      
      // 如果有共同的父节点，按照父节点的层级和位置排序
      const commonParent = aParents.find(parentId => bParents.includes(parentId))
      if (commonParent) {
        const parentLevel = nodeLevels[commonParent]
        if (parentLevel !== undefined) {
          const parentNodes = levels[parentLevel] || []
          const parentIndex = parentNodes.findIndex(n => n.id === commonParent)
          if (parentIndex !== -1) {
            // 根据父节点在层级中的位置确定子节点的相对顺序
            return 0
          }
        }
      }
      
      // 默认按节点ID排序
      return a.id.localeCompare(b.id)
    })
    
    levelNodes.forEach((node, index) => {
      if (!node) return
      
      // 计算节点位置 - 完全重新计算
      const x = levelStartX + index * horizontalSpacing
      const y = startY + level * verticalSpacing
      console.log('节点位置:', node.id, { x, y })
      // 更新节点位置 - 完全基于边关系的新位置
      node.position = {
        x,
        y
      }
    })
  })
  
  console.log('布局后的节点位置:', nodes.map(n => ({ id: n.id, position: n.position })))
  
  // 记录布局后的状态
  store.historyStore.recordState(store.nodes, store.edges, 'auto_layout')
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

// Handle点击事件处理
const handleHandleClick = (event: MouseEvent, handleType: 'source' | 'target', nodeId: string) => {
  console.log('Handle被点击:', {
    nodeId,
    handleType,
    position: { x: event.clientX, y: event.clientY },
  })

  // 保存当前handle信息
  currentHandleInfo.value = {
    nodeId,
    handleType,
    position: { x: event.clientX, y: event.clientY },
  }

  // 显示组件库弹窗
  componentLibraryModal.value?.show(currentHandleInfo.value, nodeId, event.clientX, event.clientY)
}

// 组件选择处理
const handleComponentSelect = (componentType: string, handleInfo: any) => {
  console.log('选择了组件类型:', componentType, '从handle:', handleInfo)

  if (!currentHandleInfo.value) return

  const { nodeId, handleType } = currentHandleInfo.value

  // 创建新节点
  const nodeType = getNodeType(componentType)
  if (!nodeType) return

  // 计算新节点的位置（在当前节点的右侧）
  const currentNode = store.nodes.find((n) => n.id === nodeId)
  if (!currentNode) return

  const newPosition = {
    x: currentNode.position.x + 300,
    y: currentNode.position.y + 200,
  }

  // 创建新节点
  const newNode = {
    id: `${componentType}_${Date.now()}`,
    type: nodeType.type,
    position: newPosition,
    name: nodeType.name,
    data:
      componentType === 'object_detection_model'
        ? {
            config: {
              imagePath: '',
              model: '',
              modelInfo: null,
            },
            onHandleClick: handleHandleClick,
          }
        : {
            onHandleClick: handleHandleClick,
          },
  }

  // 添加新节点
  addNodes([newNode])
  store.addNode(newNode)

  // 强制更新 nodesWithEvents 计算属性
  console.log('添加新节点后:', newNode)
  console.log('当前 store.nodes:', store.nodes)

  // 创建连接边
  if (handleType === 'source') {
    // 从当前节点连接到新节点
    const edge = {
      id: `edge_${Date.now()}`,
      source: nodeId,
      target: newNode.id,
      sourceHandle: null,
      targetHandle: null,
      animated: true,
      type: 'button',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#5e5e5eff',
      },
      style: {
        stroke: '#5e5e5eff',
      },
    }
    console.log('创建连接边:', edge)
    addEdges([edge])
    store.addEdge(edge)
  } else if (handleType === 'target') {
    // 从新节点连接到当前节点
    const edge = {
      id: `edge_${Date.now()}`,
      source: newNode.id,
      target: nodeId,
      sourceHandle: null,
      targetHandle: null,
      animated: true,
      type: 'button',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#5e5e5eff',
      },
      style: {
        stroke: '#5e5e5eff',
      },
    }
    console.log('创建连接边:', edge)
    addEdges([edge])
    store.addEdge(edge)
  }

  // 打印当前所有节点和边
  console.log('当前节点:', store.nodes)
  console.log('当前边:', store.edges)

  // 清空当前handle信息
  currentHandleInfo.value = null
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
  bottom: 70px !important;
  right: 10px !important;
  width: 200px !important;
  height: 150px !important;
  border: 1px solid #ccc !important;
  border-radius: 8px !important;
  background-color: rgba(255, 255, 255, 0.8) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}
</style>