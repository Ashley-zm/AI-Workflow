<template>
  <div class="absolute right-4 top-16 z-20 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg border border-slate-200">
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
      <div v-if="history.length === 0" class="flex items-center justify-center py-10 text-slate-500">
        <div class="flex flex-col items-center gap-2">
          <History :size="32" class="text-slate-300" />
          <span class="text-sm">暂无历史记录</span>
        </div>
      </div>

      <template v-else>
        <div class="mb-3 rounded border border-slate-200 bg-slate-50 p-2">
          <div class="mb-2 flex items-center justify-between text-xs text-slate-600">
            <span>共 {{ history.length }} 条记录</span>
            <span>当前：第 {{ currentIndex + 1 }} 条</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="item in filterOptions"
              :key="item.value"
              type="button"
              class="px-2 py-1 rounded text-xs border transition-colors"
              :class="
                activeFilter === item.value
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              "
              @click="activeFilter = item.value"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <div v-if="displayRecords.length === 0" class="flex items-center justify-center py-8 text-slate-500">
          <span class="text-sm">当前筛选条件下无记录</span>
        </div>

        <div v-else class="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
          <button
            v-for="record in displayRecords"
            :key="`${record.timestamp}-${record.sourceIndex}`"
            type="button"
            @click="handleSelectHistory(record.sourceIndex)"
            class="w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-colors"
            :class="
              record.sourceIndex === currentIndex
                ? 'bg-blue-50 border-blue-200'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            "
          >
            <div class="mt-0.5" :class="record.sourceIndex === currentIndex ? 'text-blue-500' : 'text-slate-400'">
              <component :is="getActionIcon(record.action)" :size="14" />
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <div
                  class="text-sm font-medium truncate"
                  :class="record.sourceIndex === currentIndex ? 'text-blue-800' : 'text-slate-700'"
                >
                  {{ getActionLabel(record.action) }}
                </div>
                <span
                  class="inline-flex items-center rounded px-1.5 py-0.5 text-[11px]"
                  :class="record.sourceIndex === currentIndex ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'"
                >
                  {{ getCategoryLabel(record.category) }}
                </span>
              </div>

              <div class="text-xs text-slate-500" :title="formatExactTime(record.timestamp)">
                {{ formatRelativeTime(record.timestamp) }}
              </div>

              <div class="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <span>{{ record.nodeCount }} 个节点</span>
                <span>{{ record.edgeCount }} 条边</span>
                <span v-if="record.nodeDiff !== 0" :class="record.nodeDiff > 0 ? 'text-emerald-600' : 'text-rose-600'">
                  节点{{ record.nodeDiff > 0 ? '+' : '' }}{{ record.nodeDiff }}
                </span>
                <span v-if="record.edgeDiff !== 0" :class="record.edgeDiff > 0 ? 'text-emerald-600' : 'text-rose-600'">
                  连线{{ record.edgeDiff > 0 ? '+' : '' }}{{ record.edgeDiff }}
                </span>
              </div>
            </div>

            <div v-if="record.sourceIndex === currentIndex" class="text-blue-500">
              <CheckCircle :size="14" />
            </div>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  CheckCircle,
  History,
  Link2,
  Move,
  Plus,
  Settings,
  Trash2,
  X,
  LayoutGrid,
} from 'lucide-vue-next'

interface HistoryRecord {
  state: {
    nodes: unknown[]
    edges: unknown[]
  }
  action: string
  timestamp: number
}

type ActionCategory = 'node' | 'edge' | 'layout' | 'system'
type FilterType = 'all' | ActionCategory

interface HistoryViewRecord extends HistoryRecord {
  sourceIndex: number
  category: ActionCategory
  nodeCount: number
  edgeCount: number
  nodeDiff: number
  edgeDiff: number
}

const props = defineProps<{
  history: HistoryRecord[]
  currentIndex: number
}>()

const emit = defineEmits<{
  close: []
  selectHistory: [index: number]
}>()

const activeFilter = ref<FilterType>('all')

const filterOptions: Array<{ label: string; value: FilterType }> = [
  { label: '全部', value: 'all' },
  { label: '节点', value: 'node' },
  { label: '连线', value: 'edge' },
  { label: '布局', value: 'layout' },
  { label: '系统', value: 'system' },
]

const getActionCategory = (action: string): ActionCategory => {
  const normalized = String(action || '').toLowerCase()
  if (normalized.includes('edge') || normalized.includes('connect')) return 'edge'
  if (normalized.includes('layout')) return 'layout'
  if (normalized.includes('node') || normalized.includes('drag')) return 'node'
  return 'system'
}

const getCategoryLabel = (category: ActionCategory) => {
  if (category === 'node') return '节点'
  if (category === 'edge') return '连线'
  if (category === 'layout') return '布局'
  return '系统'
}

const getActionLabel = (action: string) => {
  const normalized = String(action || '').toLowerCase()
  if (normalized === 'initial_state') return '初始化快照'
  if (normalized === 'add_node') return '新增节点'
  if (normalized === 'remove_node') return '删除节点'
  if (normalized === 'update_node') return '更新节点'
  if (normalized === 'node_drag') return '拖拽节点'
  if (normalized === 'add_edge') return '新增连线'
  if (normalized === 'remove_edge') return '删除连线'
  if (normalized === 'auto_layout') return '自动布局'
  return action || '未知操作'
}

const getActionIcon = (action: string) => {
  const normalized = String(action || '').toLowerCase()
  if (normalized === 'add_node' || normalized === 'add_edge') return Plus
  if (normalized === 'remove_node' || normalized === 'remove_edge') return Trash2
  if (normalized === 'node_drag') return Move
  if (normalized.includes('edge') || normalized.includes('connect')) return Link2
  if (normalized.includes('layout')) return LayoutGrid
  return Settings
}

const formatExactTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const formatRelativeTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = Date.now()
  const diff = now - date.getTime()

  if (diff < 60 * 1000) {
    return '刚刚'
  }
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))} 分钟前`
  }
  if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))} 小时前`
  }
  return formatExactTime(timestamp)
}

const allRecords = computed<HistoryViewRecord[]>(() => {
  return props.history.map((record, sourceIndex) => {
    const prev = props.history[sourceIndex - 1]
    const nodeCount = record.state?.nodes?.length ?? 0
    const edgeCount = record.state?.edges?.length ?? 0
    const prevNodeCount = prev?.state?.nodes?.length ?? nodeCount
    const prevEdgeCount = prev?.state?.edges?.length ?? edgeCount

    return {
      ...record,
      sourceIndex,
      category: getActionCategory(record.action),
      nodeCount,
      edgeCount,
      nodeDiff: nodeCount - prevNodeCount,
      edgeDiff: edgeCount - prevEdgeCount,
    }
  })
})

const displayRecords = computed(() => {
  const records = allRecords.value
  const filtered =
    activeFilter.value === 'all'
      ? records
      : records.filter((record) => record.category === activeFilter.value)
  return [...filtered].reverse()
})

const handleSelectHistory = (index: number) => {
  emit('selectHistory', index)
}
</script>
