<template>
  <div class="space-y-6">
    <div>
      <div class="flex items-center gap-2 mb-3">
        <div class="h-4 w-0.5 rounded-full bg-indigo-500"></div>
        <h3 class="text-sm font-semibold text-slate-800">条件配置</h3>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-4">
        <template v-if="isSwitchCase">
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-2">
              路由字段 <span class="text-red-500">*</span>
            </label>
            <el-input
              v-model="config[0].routeField"
              size="default"
              placeholder="例如: result.label"
              @input="updateConfig"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-2">Case 列表</label>
            <el-input
              v-model="caseText"
              type="textarea"
              :rows="5"
              placeholder="一行一个 case，格式: value => branchName"
              @change="handleCaseTextChange"
            />
            <p class="mt-1 text-[11px] text-slate-500">示例: pass => passed_branch</p>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-2">默认分支标签</label>
            <el-input
              v-model="config[0].defaultLabel"
              size="default"
              placeholder="default"
              @input="updateConfig"
            />
          </div>
        </template>

        <template v-else>
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-2">条件模式</label>
            <el-radio-group v-model="config[0].conditionMode" @change="updateConfig">
              <el-radio-button label="expression">表达式</el-radio-button>
              <el-radio-button label="compare">字段比较</el-radio-button>
            </el-radio-group>
          </div>

          <div v-if="config[0].conditionMode === 'expression'">
            <label class="block text-xs font-medium text-slate-700 mb-2">
              条件表达式 <span class="text-red-500">*</span>
            </label>
            <el-input
              v-model="config[0].expression"
              size="default"
              placeholder="例如: score >= 0.8 && label === 'cat'"
              @input="updateConfig"
            />
          </div>

          <div v-else class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-2">字段</label>
              <el-input
                v-model="config[0].field"
                size="default"
                placeholder="score"
                @input="updateConfig"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-2">操作符</label>
              <el-select v-model="config[0].operator" class="w-full" @change="updateConfig">
                <el-option label="==" value="==" />
                <el-option label="!=" value="!=" />
                <el-option label=">" value=">" />
                <el-option label=">=" value=">=" />
                <el-option label="<" value="<" />
                <el-option label="<=" value="<=" />
              </el-select>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-2">比较值</label>
              <el-input
                v-model="config[0].value"
                size="default"
                placeholder="0.8"
                @input="updateConfig"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-2">True 分支标签</label>
              <el-input
                v-model="config[0].trueLabel"
                size="default"
                placeholder="true"
                @input="updateConfig"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-2">False 分支标签</label>
              <el-input
                v-model="config[0].falseLabel"
                size="default"
                placeholder="false"
                @input="updateConfig"
              />
            </div>
          </div>
        </template>
      </div>
    </div>

    <div>
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="h-4 w-0.5 rounded-full bg-slate-500"></div>
          <h3 class="text-sm font-semibold text-slate-800">JSON 预览</h3>
        </div>
        <button class="text-xs text-blue-500 hover:text-blue-700 transition-colors" @click="copyJson">
          复制 JSON
        </button>
      </div>
      <div class="rounded-lg bg-slate-900 p-4 border border-slate-700">
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

interface SwitchCaseItem {
  value: string
  label: string
}

const props = defineProps<{
  modelValue: any[]
  nodeId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any[]]
  'update:nodeConfig': [value: any[]]
}>()

const store = useWorkflowStore()

const getDefaultConfig = (type: string) => {
  if (type === 'switch_case') {
    return [
      {
        routeField: '',
        cases: [] as SwitchCaseItem[],
        defaultLabel: 'default',
      },
    ]
  }

  return [
    {
      conditionMode: 'expression',
      expression: '',
      field: '',
      operator: '==',
      value: '',
      trueLabel: 'true',
      falseLabel: 'false',
    },
  ]
}

const config = ref<any[]>(getDefaultConfig('if_else'))
const caseText = ref('')

const currentNodeType = computed(() => {
  const node = store.nodes.find((item) => item.id === props.nodeId)
  return node?.type || 'if_else'
})

const isSwitchCase = computed(() => currentNodeType.value === 'switch_case')

const parseCaseText = (text: string): SwitchCaseItem[] => {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (line.includes('=>')) {
        const [rawValue = '', rawLabel = ''] = line.split('=>')
        const value = rawValue.trim()
        const label = rawLabel.trim() || value
        return { value, label }
      }
      if (line.includes(':')) {
        const [rawValue = '', rawLabel = ''] = line.split(':')
        const value = rawValue.trim()
        const label = rawLabel.trim() || value
        return { value, label }
      }
      return { value: line, label: line }
    })
}

const buildCaseText = (cases: SwitchCaseItem[]) => {
  return cases.map((item) => `${item.value} => ${item.label}`).join('\n')
}

const normalizeConfig = (value: any[] | undefined, type: string) => {
  if (!Array.isArray(value) || value.length === 0) {
    return getDefaultConfig(type)
  }

  const first = value[0] || {}

  if (type === 'switch_case') {
    const cases = Array.isArray(first.cases)
      ? first.cases
      : typeof first.cases === 'string'
        ? parseCaseText(first.cases)
        : []

    return [
      {
        routeField: first.routeField || '',
        cases,
        defaultLabel: first.defaultLabel || 'default',
      },
    ]
  }

  return [
    {
      conditionMode: first.conditionMode === 'compare' ? 'compare' : 'expression',
      expression: first.expression || '',
      field: first.field || '',
      operator: first.operator || '==',
      value: first.value ?? '',
      trueLabel: first.trueLabel || 'true',
      falseLabel: first.falseLabel || 'false',
    },
  ]
}

const initializeConfig = () => {
  config.value = normalizeConfig(props.modelValue, currentNodeType.value)
  if (isSwitchCase.value) {
    caseText.value = buildCaseText(config.value[0].cases || [])
  }
}

const emitConfig = () => {
  const value = JSON.parse(JSON.stringify(config.value))
  emit('update:modelValue', value)
  emit('update:nodeConfig', value)
}

const updateConfig = () => {
  emitConfig()
}

const handleCaseTextChange = () => {
  config.value[0].cases = parseCaseText(caseText.value)
  emitConfig()
}

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
  [() => props.modelValue, () => currentNodeType.value],
  () => {
    initializeConfig()
  },
  { deep: true, immediate: true },
)
</script>
