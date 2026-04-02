<template>
  <div
    class="absolute right-4 top-16 z-20 w-80 bg-white rounded-lg shadow-lg border border-slate-200"
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
        class="flex items-center justify-center py-8 text-slate-500"
      >
        <div class="flex items-center gap-2">
          <Loader2 :size="20" class="animate-spin" />
          <span>正在检查...</span>
        </div>
      </div>

      <div v-else-if="healthStatus === 'healthy'" class="space-y-3">
        <div class="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle :size="20" class="text-green-500" />
          <div>
            <div class="font-medium text-green-800">工作流健康</div>
            <div class="text-xs text-green-600">所有节点和连接都正常</div>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-slate-600">节点数量</span>
            <span class="font-medium text-slate-800">{{ nodeCount }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-600">连接数量</span>
            <span class="font-medium text-slate-800">{{ edgeCount }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-600">输入节点</span>
            <span class="font-medium text-slate-800">{{ inputNodeCount }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-600">输出节点</span>
            <span class="font-medium text-slate-800">{{ outputNodeCount }}</span>
          </div>
        </div>
      </div>

      <div v-else-if="healthStatus === 'warning'" class="space-y-3">
        <div class="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <AlertTriangle :size="20" class="text-yellow-500" />
          <div>
            <div class="font-medium text-yellow-800">存在警告</div>
            <div class="text-xs text-yellow-600">工作流可以运行，但可能存在问题</div>
          </div>
        </div>

        <div class="space-y-2 max-h-48 overflow-y-auto">
          <div
            v-for="(warning, index) in warnings"
            :key="index"
            class="flex items-start gap-2 p-2 bg-yellow-50 rounded border border-yellow-200"
          >
            <AlertTriangle :size="14" class="text-yellow-500 mt-0.5" />
            <span class="text-xs text-yellow-800">{{ warning }}</span>
          </div>
        </div>
      </div>

      <div v-else-if="healthStatus === 'error'" class="space-y-3">
        <div class="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
          <XCircle :size="20" class="text-red-500" />
          <div>
            <div class="font-medium text-red-800">存在错误</div>
            <div class="text-xs text-red-600">工作流无法运行，请修复以下问题</div>
          </div>
        </div>

        <div class="space-y-2 max-h-48 overflow-y-auto">
          <div
            v-for="(error, index) in errors"
            :key="index"
            class="flex items-start gap-2 p-2 bg-red-50 rounded border border-red-200"
          >
            <XCircle :size="14" class="text-red-500 mt-0.5" />
            <span class="text-xs text-red-800">{{ error }}</span>
          </div>
        </div>
      </div>

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
import { ref, computed } from 'vue'
import {
  Activity,
  X,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
} from 'lucide-vue-next'

const props = defineProps<{
  nodes: any[]
  edges: any[]
}>()

const emit = defineEmits<{
  close: []
  recheck: []
}>()

const healthStatus = ref<'checking' | 'healthy' | 'warning' | 'error'>('checking')
const warnings = ref<string[]>([])
const errors = ref<string[]>([])

const nodeCount = computed(() => props.nodes.length)
const edgeCount = computed(() => props.edges.length)
const inputNodeCount = computed(() => props.nodes.filter((n) => n.type === 'inputs').length)
const outputNodeCount = computed(() => props.nodes.filter((n) => n.type === 'outputs').length)

const performHealthCheck = () => {
  healthStatus.value = 'checking'
  warnings.value = []
  errors.value = []

  setTimeout(() => {
    let hasWarnings = false
    let hasErrors = false

    if (nodeCount.value === 0) {
      errors.value.push('工作流中没有节点')
      hasErrors = true
    }

    if (inputNodeCount.value === 0) {
      errors.value.push('缺少输入节点')
      hasErrors = true
    }

    if (outputNodeCount.value === 0) {
      errors.value.push('缺少输出节点')
      hasErrors = true
    }

    props.nodes.forEach((node) => {
      if (!node.data.config) {
        warnings.value.push(`节点 "${node.name}" 未配置`)
        hasWarnings = true
      }

      const hasIncomingEdges = props.edges.some((e) => e.target === node.id)
      const hasOutgoingEdges = props.edges.some((e) => e.source === node.id)

      if (node.type !== 'inputs' && !hasIncomingEdges) {
        warnings.value.push(`节点 "${node.name}" 没有输入连接`)
        hasWarnings = true
      }

      if (node.type !== 'outputs' && !hasOutgoingEdges) {
        warnings.value.push(`节点 "${node.name}" 没有输出连接`)
        hasWarnings = true
      }
    })

    if (hasErrors) {
      healthStatus.value = 'error'
    } else if (hasWarnings) {
      healthStatus.value = 'warning'
    } else {
      healthStatus.value = 'healthy'
    }
  }, 500)
}

defineExpose({
  performHealthCheck,
})
</script>
