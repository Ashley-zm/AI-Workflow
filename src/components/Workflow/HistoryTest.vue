<template>
  <div class="fixed bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border z-50">
    <h4 class="font-bold mb-2">历史记录测试</h4>
    <div class="space-y-2">
      <div class="flex gap-2">
        <button
          @click="store.undo"
          :disabled="!store.canUndo"
          class="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300 text-sm"
        >
          撤销 ({{ historyStore.currentIndex + 1 }}/{{ historyStore.history.length }})
        </button>
        <button
          @click="store.redo"
          :disabled="!store.canRedo"
          class="px-3 py-1 bg-green-500 text-white rounded disabled:bg-gray-300 text-sm"
        >
          重做
        </button>
      </div>
      <div class="text-xs text-gray-600">快捷键: Ctrl+Z 撤销, Ctrl+Y 重做</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkflowStore } from '@/stores/workflow'
import { useHistoryStore } from '@/stores/history'

const store = useWorkflowStore()
const historyStore = useHistoryStore()
</script>
