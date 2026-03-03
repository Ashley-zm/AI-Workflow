import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Node, Edge } from '@vue-flow/core'

interface HistoryState {
  nodes: Node[]
  edges: Edge[]
}

interface HistoryRecord {
  state: HistoryState
  action: string
  timestamp: number
}

export const useHistoryStore = defineStore('history', () => {
  const history = ref<HistoryRecord[]>([])
  const currentIndex = ref(-1)
  const maxHistorySize = 50 // 最大历史记录数

  const canUndo = computed(() => currentIndex.value > 0)
  const canRedo = computed(() => currentIndex.value < history.value.length - 1)

  // 记录当前状态到历史
  const recordState = (nodes: Node[], edges: Edge[], action: string) => {
    console.log(`=== 记录状态: ${action} ===`)
    console.log(
      `记录前 - currentIndex: ${currentIndex.value}, history长度: ${history.value.length}`,
    )

    // 删除当前索引之后的历史记录（当用户撤销后做了新操作时）
    if (currentIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, currentIndex.value + 1)
      console.log(`清理后的history长度: ${history.value.length}`)
    }

    // 如果历史记录太多，删除最旧的记录
    if (history.value.length >= maxHistorySize) {
      history.value.shift()
      currentIndex.value--
      console.log(`达到最大记录数，删除最旧记录后的currentIndex: ${currentIndex.value}`)
    }

    // 添加新状态
    const newRecord: HistoryRecord = {
      state: {
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
      },
      action,
      timestamp: Date.now(),
    }

    history.value.push(newRecord)
    currentIndex.value++
    console.log(
      `记录后 - currentIndex: ${currentIndex.value}, history长度: ${history.value.length}`,
    )
  }

  // 撤销
  const undo = (): HistoryState | null => {
    console.log(`=== 执行撤销 ===`)
    console.log(`撤销前 - currentIndex: ${currentIndex.value}, canUndo: ${canUndo.value}`)

    if (!canUndo.value) {
      console.log('无法撤销，currentIndex <= 0')
      return null
    }

    // 先减少索引，然后返回新索引对应的状态
    currentIndex.value--
    const state = history.value[currentIndex.value]?.state || null
    console.log(`撤销后 - currentIndex: ${currentIndex.value}, 返回状态: ${state ? '有' : '无'}`)
    return state
  }

  // 重做
  const redo = (): HistoryState | null => {
    console.log(`=== 执行重做 ===`)
    console.log(`重做前 - currentIndex: ${currentIndex.value}, canRedo: ${canRedo.value}`)

    if (!canRedo.value) {
      console.log('无法重做，currentIndex >= history.length - 1')
      return null
    }

    currentIndex.value++
    const state = history.value[currentIndex.value]?.state || null
    console.log(`重做后 - currentIndex: ${currentIndex.value}, 返回状态: ${state ? '有' : '无'}`)
    return state
  }

  // 重置历史记录
  const reset = () => {
    history.value = []
    currentIndex.value = -1
  }

  // 获取当前状态（用于调试）
  const getCurrentState = (): HistoryState | null => {
    if (currentIndex.value >= 0 && currentIndex.value < history.value.length) {
      return history.value[currentIndex.value]?.state || null
    }
    return null
  }

  return {
    history,
    currentIndex,
    canUndo,
    canRedo,
    recordState,
    undo,
    redo,
    reset,
    getCurrentState,
  }
})
