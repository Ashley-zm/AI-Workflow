<template>
  <div class="flex h-screen w-full overflow-hidden bg-slate-50" @drop="onDrop" @dragover.prevent>
    <Sidebar @drag-start="onDragStart" />

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
        <Background pattern-color="#999" :gap="24" :size="1.5" />
        <Controls
          position="top-left"
          class="!m-4 p-1 bg-white rounded-lg shadow-md border border-gray-200"
        >
          <ControlButton title="撤销 (Ctrl+Z)" @click="handleUndoClick" :disabled="!store.canUndo">
            <Undo2 :size="16" />
          </ControlButton>
          <ControlButton title="重做 (Ctrl+Y)" @click="handleRedoClick" :disabled="!store.canRedo">
            <Redo2 :size="16" />
          </ControlButton>
          <ControlButton title="重新排列节点位置" @click="updatePos">
            <RefreshCcw :size="16" />
          </ControlButton>
        </Controls>
      </VueFlow>
    </div>

    <div v-if="store.selectedNode" class="w-96 border-l border-gray-200 shadow-2xl relative z-10">
      <PropertiesPanel />
    </div>

    <!-- 演示控制组件 -->
    <!-- <DemoControls /> -->

    <!-- 组件库选择弹窗 -->
    <ComponentLibraryModal ref="componentLibraryModal" @select-component="handleComponentSelect" />
  </div>
</template>

<script setup lang="ts">
import '@vue-flow/controls/dist/style.css'
import { VueFlow, useVueFlow, type NodeMouseEvent, type NodeTypesObject } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { ControlButton, Controls } from '@vue-flow/controls'
import { useWorkflowStore } from '@/stores/workflow'
import PropertiesPanel from '@/components/Workflow/PropertiesPanel/index.vue'
import Sidebar from '@/components/Workflow/Sidebar.vue'
import { RefreshCcw, Undo2, Redo2 } from 'lucide-vue-next'
import { nodeTypes, getNodeType } from '@/components/Workflow/Nodes/nodeTypes'
import { onMounted, onUnmounted, ref, computed, markRaw } from 'vue'
// import DemoControls from '@/components/Workflow/DemoControls.vue'
import EdgeWithButton from '@/components/Workflow/Edges/EdgeWithButton.vue'
import CustomEdge from '@/components/Workflow/Edges/CustomEdge.vue'
import CustomConnectionLine from '@/components/Workflow/Edges/CustomConnectionLine.vue'
import ComponentLibraryModal from '@/components/Workflow/ComponentLibraryModal.vue'

const store = useWorkflowStore()
const { onInit, project, onConnect, addNodes, addEdges } = useVueFlow()

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
  // 确保 config 存在，防止报错
  // if (!event.node.data.config) {
  //   if (event.node.type === 'object_detection_model') {
  //     event.node.data.config = {
  //       imagePath: '',
  //       model: '',
  //       modelInfo: null,
  //     }
  //   } else {
  //     event.node.data.config = { prompt: '', model: 'gpt-3.5-turbo' }
  //   }
  // }
  console.log('点击节点:', event.node.id, event.node.type, event.node.data.config)
  store.setSelectedNode(event.node.id)
}

// --- 拖拽逻辑 ---
const onDragStart = (event: DragEvent, type: string) => {
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
const updatePos = () => {
  const nodes = store.nodes
  nodes.forEach((node) => {
    node.position = {
      x: Math.random() * 500,
      y: Math.random() * 500,
    }
  })
  // 记录重排后的状态
  store.historyStore.recordState(store.nodes, store.edges, 'rearrange_nodes')
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
</style>
