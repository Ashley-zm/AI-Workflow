<template>
  <div
    class="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg border z-50"
  >
    <div class="flex items-center gap-4">
      <h3 class="font-bold text-gray-800">演示控制</h3>

      <div class="flex gap-2">
        <button
          @click="addTestNode"
          class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          添加节点
        </button>
        <button
          @click="updateTestConfig"
          class="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
        >
          更新配置
        </button>
        <button
          @click="handleUndo"
          :disabled="!store.canUndo"
          class="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 disabled:bg-gray-300"
        >
          撤销
        </button>
        <button
          @click="handleRedo"
          :disabled="!store.canRedo"
          class="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 disabled:bg-gray-300"
        >
          重做
        </button>
      </div>

      <div class="text-xs text-gray-600">
        历史: {{ historyStore.currentIndex + 1 }} / {{ historyStore.history.length }}
      </div>
      <div class="text-xs text-gray-500">操作: {{ currentAction }}</div>
      <button
        @click="showHistoryDetails = !showHistoryDetails"
        class="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
      >
        历史详情
      </button>
    </div>

    <div class="mt-2 text-xs text-gray-500">快捷键: Ctrl+Z 撤销, Ctrl+Y 重做</div>

    <!-- 历史记录详情 -->
    <div
      v-if="showHistoryDetails"
      class="mt-3 p-3 bg-gray-50 rounded text-xs max-h-40 overflow-y-auto"
    >
      <div class="font-bold mb-2">历史记录详情:</div>
      <div
        v-for="(record, index) in historyStore.history"
        :key="index"
        :class="['p-1 rounded', index === historyStore.currentIndex ? 'bg-blue-100' : 'bg-white']"
      >
        {{ index + 1 }}. {{ record.action }} - {{ new Date(record.timestamp).toLocaleTimeString() }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkflowStore } from '@/stores/workflow'
import { useHistoryStore } from '@/stores/history'
import { useVueFlow } from '@vue-flow/core'
import { ref, watch } from 'vue'

const store = useWorkflowStore()
const historyStore = useHistoryStore()
const { project, addNodes } = useVueFlow()

const currentAction = ref('就绪')
const showHistoryDetails = ref(false)

// 监听历史记录变化
watch(
  () => historyStore.currentIndex,
  (newIndex) => {
    console.log('历史记录索引变化:', newIndex, '总长度:', historyStore.history.length)
    console.log('canUndo:', store.canUndo, 'canRedo:', store.canRedo)
    if (newIndex >= 0 && historyStore.history[newIndex]) {
      currentAction.value = historyStore.history[newIndex].action
      console.log('当前操作:', historyStore.history[newIndex].action)
    } else {
      currentAction.value = '无历史记录'
    }
  },
)

const handleUndo = () => {
  console.log('=== 执行撤销操作 ===')
  console.log('撤销前状态:')
  console.log('- currentIndex:', historyStore.currentIndex)
  console.log('- history长度:', historyStore.history.length)
  console.log('- canUndo:', store.canUndo)
  console.log('- canRedo:', store.canRedo)

  store.undo()

  console.log('撤销后状态:')
  console.log('- currentIndex:', historyStore.currentIndex)
  console.log('- history长度:', historyStore.history.length)
  console.log('- canUndo:', store.canUndo)
  console.log('- canRedo:', store.canRedo)
}

const handleRedo = () => {
  console.log('=== 执行重做操作 ===')
  console.log('重做前状态:')
  console.log('- currentIndex:', historyStore.currentIndex)
  console.log('- history长度:', historyStore.history.length)
  console.log('- canUndo:', store.canUndo)
  console.log('- canRedo:', store.canRedo)

  store.redo()

  console.log('重做后状态:')
  console.log('- currentIndex:', historyStore.currentIndex)
  console.log('- history长度:', historyStore.history.length)
  console.log('- canUndo:', store.canUndo)
  console.log('- canRedo:', store.canRedo)
}

const addTestNode = () => {
  const position = project({ x: 400 + Math.random() * 200, y: 200 + Math.random() * 200 })
  const newNode = {
    id: `test_node_${Date.now()}`,
    type: 'model',
    position,
    label: `测试节点 ${historyStore.history.length}`,
    data: {
      config: {
        prompt: `这是测试节点 ${historyStore.history.length} 的提示词`,
        model: 'gpt-3.5-turbo',
      },
    },
  }

  console.log('=== 添加测试节点 ===')
  console.log('添加前状态:')
  console.log('- currentIndex:', historyStore.currentIndex)
  console.log('- history长度:', historyStore.history.length)
  console.log('- canUndo:', store.canUndo)
  console.log('- canRedo:', store.canRedo)

  addNodes([newNode])

  console.log('添加后状态:')
  console.log('- currentIndex:', historyStore.currentIndex)
  console.log('- history长度:', historyStore.history.length)
  console.log('- canUndo:', store.canUndo)
  console.log('- canRedo:', store.canRedo)
}

// 测试配置更新
const updateTestConfig = () => {
  const nodes = store.nodes
  if (nodes.length > 0) {
    const lastNode = nodes[nodes.length - 1]
    if (lastNode?.id) {
      store.updateNode(lastNode.id, {
        ...lastNode,
        data: {
          ...lastNode.data,
          config: {
            ...lastNode.data.config,
            prompt: `更新后的提示词 - ${Date.now()}`,
            model: 'gpt-4',
          },
        },
      })
    }
  }
}
</script>
