import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Node, Edge } from '@vue-flow/core'
import { useHistoryStore } from './history'
// import { MarkerType } from '@vue-flow/core'
export const useWorkflowStore = defineStore('workflow', () => {
  const historyStore = useHistoryStore()

  // 初始化历史记录
  const initializeHistory = () => {
    historyStore.reset()
    // 记录初始状态
    historyStore.recordState(nodes.value, edges.value, 'initial_state')
  }

  // 节点 默认存在一个起始节点，一个结束节点
  const nodes = ref<Node[]>([
    {
      id: '$inputs',
      type: 'inputs',
      position: { x: 100, y: 300 },
      data: { nodeTag: 'inputs', config: [] },
    },
    {
      id: '$outputs',
      type: 'outputs',
      position: { x: 500, y: 300 },
      data: { nodeTag: 'outputs', config: [] },
    },
  ])
  // 边
  const edges = ref<Edge[]>([])
  const selectedNode = ref<Node | null>(null)
  const currentHandleInfo = ref<{
    nodeId: string
    position: { x: number; y: number }
  } | null>(null)
  // 添加节点
  const addNode = (node: Node) => {
    nodes.value.push(node)
    // 记录操作后的状态
    historyStore.recordState(nodes.value, edges.value, 'add_node')
  }

  // 删除节点
  const removeNode = (nodeId: string) => {
    nodes.value = nodes.value.filter((n) => n.id !== nodeId)
    edges.value = edges.value.filter((e) => e.source !== nodeId && e.target !== nodeId)
    // 记录操作后的状态
    historyStore.recordState(nodes.value, edges.value, 'remove_node')
  }

  // 更新节点数据
  const updateNode = (nodeId: string, config: any) => {
    const node = nodes.value.find((n) => n.id === nodeId)
    if (node) {
      node.data.config = config
      // 记录操作后的状态
      historyStore.recordState(nodes.value, edges.value, 'update_node')
    }
  }

  // 添加边
  const addEdge = (edge: Edge) => {
    edges.value.push(edge)
    // 记录操作后的状态
    historyStore.recordState(nodes.value, edges.value, 'add_edge')
  }

  // 删除边
  const removeEdge = (edgeId: string) => {
    edges.value = edges.value.filter((e) => e.id !== edgeId)
    // 记录操作后的状态
    historyStore.recordState(nodes.value, edges.value, 'remove_edge')
  }

  // 设置当前选中的节点（用于右侧属性面板显示）
  const setSelectedNode = (nodeId: string | null) => {
    selectedNode.value = nodes.value.find((n) => n.id === nodeId) || null
  }
  const setCurrentHandleInfo = (nodeId: string, event: MouseEvent) => {
    currentHandleInfo.value = {
      nodeId,
      position: { x: event.clientX, y: event.clientY },
    }
  }
  const clearCurrentHandleInfo = () => {
    currentHandleInfo.value = null
  }

  // 撤销操作
  const undo = () => {
    console.log('workflow.undo() 被调用')
    try {
      const previousState = historyStore.undo()
      console.log('撤销获取到的状态:', previousState)
      if (previousState) {
        nodes.value = previousState.nodes
        edges.value = previousState.edges
        // 撤销后清除选中状态
        selectedNode.value = null
        console.log('撤销操作完成')
        return true
      } else {
        console.log('没有可撤销的状态')
        return false
      }
    } catch (error) {
      console.error('撤销操作出错:', error)
      return false
    }
  }

  // 重做操作
  const redo = () => {
    console.log('workflow.redo() 被调用')
    try {
      const nextState = historyStore.redo()
      console.log('重做获取到的状态:', nextState)
      if (nextState) {
        nodes.value = nextState.nodes
        edges.value = nextState.edges
        // 重做后清除选中状态
        selectedNode.value = null
        console.log('重做操作完成')
        return true
      } else {
        console.log('没有可重做的状态')
        return false
      }
    } catch (error) {
      console.error('重做操作出错:', error)
      return false
    }
  }

  // 获取历史记录状态
  const canUndo = computed(() => historyStore.canUndo)
  const canRedo = computed(() => historyStore.canRedo)

  const getEdges = computed(() => edges.value)
  const getNodes = computed(() => nodes.value)

  return {
    nodes,
    edges,
    selectedNode,
    canUndo,
    canRedo,
    historyStore, // 导出historyStore以便外部访问
    getEdges,
    getNodes,
    currentHandleInfo,
    addNode,
    removeNode,
    updateNode,
    addEdge,
    removeEdge,
    setSelectedNode,
    undo,
    redo,
    initializeHistory,
    setCurrentHandleInfo,
    clearCurrentHandleInfo,
  }
})
