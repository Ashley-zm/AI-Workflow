<template>
  <div
    class="absolute right-4 top-16 z-20 w-80 bg-white rounded-lg shadow-lg border border-slate-200"
  >
    <div class="flex items-center justify-between p-4 border-b border-slate-200">
      <div class="flex items-center gap-2">
        <History :size="18" class="text-blue-500" />
        <h3 class="font-bold text-slate-800">历史操作记录</h3>
      </div>
      <button
        @click="$emit('close')"
        class="text-slate-500 hover:bg-slate-100 p-1 rounded-full transition-colors"
      >
        <X :size="18" />
      </button>
    </div>

    <div class="p-4">
      <div
        v-if="history.length === 0"
        class="flex items-center justify-center py-8 text-slate-500"
      >
        <div class="flex flex-col items-center gap-2">
          <History :size="32" class="text-slate-300" />
          <span class="text-sm">暂无历史记录</span>
        </div>
      </div>

      <div v-else class="space-y-2 max-h-96 overflow-y-auto">
        <div
          v-for="(record, index) in reversedHistory"
          :key="index"
          @click="handleSelectHistory(history.length - 1 - index)"
          class="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors"
          :class="
            history.length - 1 - index === currentIndex
              ? 'bg-blue-50 border border-blue-200'
              : 'bg-slate-50 border border-transparent hover:bg-slate-100'
          "
        >
          <div
            class="mt-0.5"
            :class="
              history.length - 1 - index === currentIndex
                ? 'text-blue-500'
                : 'text-slate-400'
            "
          >
            <component
              :is="getActionIcon(record.action)"
              :size="14"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div
              class="text-sm font-medium truncate"
              :class="
                history.length - 1 - index === currentIndex
                  ? 'text-blue-800'
                  : 'text-slate-700'
              "
            >
              {{ record.action }}
            </div>
            <div
              class="text-xs text-slate-500"
            >
              {{ formatTime(record.timestamp) }}
            </div>
            <div class="text-xs text-slate-400 mt-1">
              {{ record.state.nodes.length }} 个节点, {{ record.state.edges.length }} 条边
            </div>
          </div>
          <div
            v-if="history.length - 1 - index === currentIndex"
            class="text-blue-500"
          >
            <CheckCircle :size="14" />
          </div>
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-slate-200">
        <div class="flex items-center justify-between text-xs text-slate-500">
          <span>共 {{ history.length }} 条记录</span>
          <span>当前: 第 {{ currentIndex + 1 }} 条</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { History, X, CheckCircle, Plus, Trash2, Move, Link2, Settings } from 'lucide-vue-next'

const props = defineProps<{
  history: any[]
  currentIndex: number
}>()

const emit = defineEmits<{
  close: []
  selectHistory: [index: number]
}>()

const reversedHistory = computed(() => {
  return [...props.history].reverse()
})

const getActionIcon = (action: string) => {
  if (action.includes('添加') || action.includes('创建')) return Plus
  if (action.includes('删除') || action.includes('移除')) return Trash2
  if (action.includes('移动') || action.includes('拖拽')) return Move
  if (action.includes('连接') || action.includes('边')) return Link2
  return Settings
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)} 分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)} 小时前`
  } else {
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
}

const handleSelectHistory = (index: number) => {
  emit('selectHistory', index)
}
</script>
