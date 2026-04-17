<template>
  <div class="space-y-6">
    <div>
      <div class="flex items-center gap-2 mb-3">
        <div class="h-4 w-0.5 rounded-full bg-indigo-500"></div>
        <h3 class="text-sm font-semibold text-slate-800">条件配置</h3>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-4">
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-2">比较字段</label>
            <el-select
              v-model="config.condition"
              class="w-full"
              placeholder="请选择比较字段"
              @change="updateConfig"
            >
              <el-option
                v-for="option in fieldOptions"
                :key="option"
                :label="option"
                :value="option"
              />
            </el-select>
            <p class="mt-1 text-[11px] text-slate-500">来源：$steps.图像分类模型节点name.passed</p>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-2">操作符</label>
            <el-select v-model="config.operator" class="w-full" @change="updateConfig">
              <el-option label="==" value="==" />
              <el-option label="!=" value="!=" />
              <el-option label=">" value=">" />
              <el-option label=">=" value=">=" />
              <el-option label="<" value="<" />
              <el-option label="<=" value="<=" />
            </el-select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-2">期望值</label>
            <el-input
              v-model="config.expected_value"
              size="default"
              placeholder="0.8"
              @input="updateConfig"
            />
          </div>
        </div>

        <div
          v-if="fieldOptions.length === 0"
          class="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700"
        >
          暂无可选字段，请先将图像分类模型连接到该 If/Else 节点。
        </div>
      </div>
    </div>

    <div>
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="h-4 w-0.5 rounded-full bg-slate-500"></div>
          <h3 class="text-sm font-semibold text-slate-800">JSON 预览</h3>
        </div>
        <div class="flex items-center gap-3">
          <button
            class="text-xs text-slate-500 hover:text-slate-700 transition-colors"
            @click="isJsonPreviewCollapsed = !isJsonPreviewCollapsed"
          >
            {{ isJsonPreviewCollapsed ? '展开' : '收起' }}
          </button>
          <button
            class="text-xs text-blue-500 hover:text-blue-700 transition-colors"
            @click="copyJson"
          >
            复制 JSON
          </button>
        </div>
      </div>
      <div
        v-show="!isJsonPreviewCollapsed"
        class="rounded-lg bg-slate-900 p-4 border border-slate-700"
      >
        <pre class="text-xs text-slate-100 font-mono whitespace-pre-wrap">{{
          JSON.stringify(config, null, 2)
        }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useWorkflowStore } from '@/stores/workflow'

const props = defineProps<{
  modelValue: any
  nodeId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  'update:nodeConfig': [value: Record<string, any>]
}>()

const store = useWorkflowStore()

const getDefaultConfig = () => {
  return {
    condition: '',
    operator: '==',
    expected_value: true,
  }
}

const config = ref<Record<string, any>>(getDefaultConfig())
const isJsonPreviewCollapsed = ref(true)

const normalizeConfig = (value: unknown) => {
  const defaultConfig = getDefaultConfig()
  if (!value || typeof value !== 'object') return defaultConfig

  const source = Array.isArray(value)
    ? (value[0] as Record<string, any> | undefined)
    : Array.isArray((value as any).config)
      ? ((value as any).config[0] as Record<string, any> | undefined)
      : (value as Record<string, any>)

  if (!source || typeof source !== 'object') return defaultConfig

  return {
    condition: source.condition || source.field || defaultConfig.condition,
    operator: source.operator || defaultConfig.operator,
    expected_value: source.expected_value ?? source.value ?? defaultConfig.expected_value,
  }
}

const initializeConfig = () => {
  config.value = normalizeConfig(props.modelValue)
}

const emitConfig = () => {
  const value = JSON.parse(JSON.stringify(config.value)) as Record<string, any>
  emit('update:modelValue', value)
  emit('update:nodeConfig', value)
}

const updateConfig = () => {
  emitConfig()
}

const currentNodeId = computed(() => String(props.nodeId || ''))

const fieldOptions = computed<string[]>(() => {
  const id = currentNodeId.value
  if (!id) return []

  const sourceNodeIds = new Set(
    store.edges.filter((edge) => String(edge.target) === id).map((edge) => String(edge.source)),
  )

  return store.nodes
    .filter((node) => {
      return (
        sourceNodeIds.has(String(node.id)) &&
        (node.type === 'classification_model@v1' || node.type === 'classification-model')
      )
    })
    .map((node) => `$steps.${String((node as any).name || node.id)}.predictions.passed`)
    .filter((item) => item.length > 0)
})

const copyJson = () => {
  const json = JSON.stringify(config.value, null, 2)
  navigator.clipboard
    .writeText(json)
    .then(() => {
      ElMessage.success('已复制 JSON')
    })
    .catch(() => {
      ElMessage.error('复制失败')
    })
}

watch(
  fieldOptions,
  (list) => {
    if (!list.length) return
    const currentCondition = String(config.value?.condition || '')
    if (currentCondition && list.includes(currentCondition)) return
    config.value.condition = list[0]
    emitConfig()
  },
  { immediate: true },
)

watch(
  () => props.modelValue,
  () => {
    initializeConfig()
  },
  { deep: true, immediate: true },
)
</script>
