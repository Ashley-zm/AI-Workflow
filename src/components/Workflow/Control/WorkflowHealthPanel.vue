<template>
  <div
    class="absolute right-4 top-16 z-20 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg border border-slate-200"
  >
    <div class="flex items-center justify-between p-4 border-b border-slate-200">
      <div class="flex items-center gap-2">
        <Activity :size="18" class="text-blue-500" />
        <h3 class="font-bold text-slate-800">图健康检查</h3>
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
        v-if="healthStatus === 'checking'"
        class="flex items-center justify-center py-10 text-slate-500"
      >
        <div class="flex items-center gap-2">
          <Loader2 :size="20" class="animate-spin" />
          <span>正在检查...</span>
        </div>
      </div>

      <template v-else>
        <div
          class="mb-3 rounded-lg border p-3"
          :class="{
            'bg-green-50 border-green-200': healthStatus === 'healthy',
            'bg-yellow-50 border-yellow-200': healthStatus === 'warning',
            'bg-red-50 border-red-200': healthStatus === 'error',
          }"
        >
          <div class="flex items-start gap-2">
            <CheckCircle
              v-if="healthStatus === 'healthy'"
              :size="18"
              class="text-green-500 mt-0.5"
            />
            <AlertTriangle
              v-else-if="healthStatus === 'warning'"
              :size="18"
              class="text-yellow-500 mt-0.5"
            />
            <XCircle v-else :size="18" class="text-red-500 mt-0.5" />
            <div>
              <div
                class="font-medium"
                :class="{
                  'text-green-800': healthStatus === 'healthy',
                  'text-yellow-800': healthStatus === 'warning',
                  'text-red-800': healthStatus === 'error',
                }"
              >
                {{ summaryTitle }}
              </div>
              <div
                class="text-xs"
                :class="{
                  'text-green-600': healthStatus === 'healthy',
                  'text-yellow-700': healthStatus === 'warning',
                  'text-red-700': healthStatus === 'error',
                }"
              >
                {{ summaryDesc }}
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="hasChangesSinceLastCheck"
          class="mb-3 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700"
        >
          当前画布有变更，建议重新执行健康检查。
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs mb-3">
          <div class="rounded border border-slate-200 px-2 py-2">
            <span class="text-slate-500">节点总数</span>
            <div class="text-sm font-semibold text-slate-800">{{ nodeCount }}</div>
          </div>
          <div class="rounded border border-slate-200 px-2 py-2">
            <span class="text-slate-500">连线总数</span>
            <div class="text-sm font-semibold text-slate-800">{{ edgeCount }}</div>
          </div>
          <div class="rounded border border-slate-200 px-2 py-2">
            <span class="text-slate-500">输入节点</span>
            <div class="text-sm font-semibold text-slate-800">{{ inputNodeCount }}</div>
          </div>
          <div class="rounded border border-slate-200 px-2 py-2">
            <span class="text-slate-500">输出节点</span>
            <div class="text-sm font-semibold text-slate-800">{{ outputNodeCount }}</div>
          </div>
        </div>

        <div v-if="errors.length" class="mb-3">
          <div class="mb-1 text-xs font-semibold text-red-700">错误（{{ errors.length }}）</div>
          <div class="max-h-40 overflow-y-auto space-y-2 pr-1">
            <div
              v-for="(error, index) in errors"
              :key="`err-${index}`"
              class="rounded border border-red-200 bg-red-50 px-2 py-1.5 text-xs text-red-800"
            >
              {{ error }}
            </div>
          </div>
        </div>

        <div v-if="warnings.length" class="mb-3">
          <div class="mb-1 text-xs font-semibold text-yellow-700">警告（{{ warnings.length }}）</div>
          <div class="max-h-40 overflow-y-auto space-y-2 pr-1">
            <div
              v-for="(warning, index) in warnings"
              :key="`warn-${index}`"
              class="rounded border border-yellow-200 bg-yellow-50 px-2 py-1.5 text-xs text-yellow-800"
            >
              {{ warning }}
            </div>
          </div>
        </div>

        <div v-if="suggestions.length" class="mb-3">
          <div class="mb-1 text-xs font-semibold text-slate-700">修复建议</div>
          <div class="space-y-1">
            <div
              v-for="(suggestion, index) in suggestions"
              :key="`suggest-${index}`"
              class="rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700"
            >
              {{ index + 1 }}. {{ suggestion }}
            </div>
          </div>
        </div>

        <div class="text-[11px] text-slate-400">最近检查：{{ lastCheckedAt || '-' }}</div>
      </template>

      <div class="mt-4 pt-4 border-t border-slate-200">
        <button
          @click="$emit('recheck')"
          class="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          重新检查
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Activity, X, CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-vue-next'
import { useWorkflowStore } from '@/stores/workflow'

defineEmits<{
  close: []
  recheck: []
}>()

const store = useWorkflowStore()
const {
  workflowHealthStatus: healthStatus,
  workflowHealthWarnings: warnings,
  workflowHealthErrors: errors,
  workflowHealthSuggestions: suggestions,
  workflowHealthLastCheckedAt: lastCheckedAt,
  workflowHealthHasChangesSinceLastCheck: hasChangesSinceLastCheck,
  workflowHealthNodeCount: nodeCount,
  workflowHealthEdgeCount: edgeCount,
  workflowHealthInputNodeCount: inputNodeCount,
  workflowHealthOutputNodeCount: outputNodeCount,
  workflowHealthSummaryTitle: summaryTitle,
  workflowHealthSummaryDesc: summaryDesc,
} = storeToRefs(store)
</script>
