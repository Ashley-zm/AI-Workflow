<template>
  <div class="flex flex-col">
    <div class="flex-1 overflow-y-auto space-y-4">
      <div
        v-if="sourceNodes.length > 0"
        class="flex items-center gap-2 rounded-full px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-medium"
      >
        <CheckCircle :size="14" />
        已连接 {{ sourceNodes.length }} 个节点
      </div>

      <!-- Basic Config -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="h-4 w-0.5 rounded-full bg-purple-500"></div>
            <h3 class="text-sm font-semibold text-slate-800">输出字段配置</h3>
          </div>
          <div class="text-xs text-slate-500">{{ outputFields.length }} 个字段</div>
        </div>

        <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <div class="space-y-2">
            <div class="text-xs font-medium text-slate-600">可选择数据（按节点分组）</div>
            <div
              v-if="selectorGroups.length === 0"
              class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700"
            >
              暂无可用selector，请先连接包含数据的输入/步骤节点。
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="group in selectorGroups"
                :key="group.nodeId"
                class="rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <div class="mb-2 flex items-center gap-2">
                  <span class="text-xs font-medium text-slate-700">{{ group.nodeName }}</span>
                  <el-tag size="small" type="info" class="!text-[10px]">{{
                    group.nodeType
                  }}</el-tag>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="option in group.options"
                    :key="option.value"
                    class="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                    :disabled="isSelectorSelected(option.value)"
                    @click="addOutputFieldBySelector(option.value)"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-1 border-t border-slate-200">
            <div class="mb-2 text-xs font-medium text-slate-600">已新增字段</div>
            <div
              v-for="(field, index) in outputFields"
              :key="index"
              class="mb-2 rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <div class="mb-2 flex items-center justify-between">
                <div class="text-xs font-medium text-slate-500">字段 #{{ index + 1 }}</div>
                <el-button
                  type="danger"
                  text
                  :disabled="outputFields.length <= 1"
                  @click="removeOutputField(index)"
                >
                  删除
                </el-button>
              </div>
              <div class="grid grid-cols-1 gap-2">
                <div>
                  <label class="mb-1 block text-[11px] text-slate-500">name</label>
                  <el-input v-model="field.name" @blur="updateOutputConfig" />
                </div>
                <div>
                  <label class="mb-1 block text-[11px] text-slate-500">selector</label>
                  <el-input :model-value="field.selector" disabled />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Data -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="h-4 w-0.5 rounded-full bg-blue-500"></div>
            <h3 class="text-sm font-semibold text-slate-800">输入数据</h3>
          </div>
          <div class="flex items-center gap-2">
            <el-button
              v-if="sourceNodes.length > 0"
              size="small"
              type="primary"
              @click="exportAllData"
              class="!text-xs"
            >
              <Download :size="14" class="mr-1" />
              导出全部
            </el-button>
          </div>
        </div>

        <div v-if="sourceNodes.length > 0" class="space-y-3">
          <div
            v-for="(node, index) in sourceNodes"
            :key="index"
            class="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden hover:border-purple-300 transition-all hover:shadow-md"
          >
            <div
              class="flex items-center justify-between bg-gradient-to-r from-slate-50 to-white px-4 py-3 border-b border-slate-200 cursor-pointer"
              @click="toggleNodeExpand(node.id)"
            >
              <div class="flex items-center gap-3">
                <div
                  class="h-8 w-8 rounded-lg flex items-center justify-center shadow-sm bg-slate-500"
                >
                  <component :is="getNodeTypeIcon(node.type)" :size="16" class="text-white" />
                </div>
                <div>
                  <div class="text-sm font-semibold text-slate-800">
                    {{ node.data?.label || node.type }}
                  </div>
                  <div class="flex items-center gap-2 text-[11px] text-slate-500">
                    <el-tag size="small" type="info" class="!text-[10px]">
                      ID: {{ node.id }}
                    </el-tag>
                    <el-tag size="small" :type="getNodeStatusType(node)" class="!text-[10px]">
                      {{ getNodeStatusText(node) }}
                    </el-tag>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <ChevronDown
                  :size="16"
                  class="text-slate-400 transition-transform"
                  :class="{ 'rotate-180': expandedNodes.has(node.id) }"
                />
              </div>
            </div>

            <div v-show="expandedNodes.has(node.id)" class="p-4 space-y-3">
              <div class="grid grid-cols-3 gap-3">
                <div class="rounded-lg bg-blue-50 p-3 border border-blue-100">
                  <div class="flex items-center gap-1.5 text-[10px] text-blue-600 mb-1">
                    <Database :size="10" />
                    <span>数据属性</span>
                  </div>
                  <div class="text-lg font-bold text-blue-700">
                    {{ getNodePropertiesCount(node) }}
                  </div>
                </div>
                <div class="rounded-lg bg-emerald-50 p-3 border border-emerald-100">
                  <div class="flex items-center gap-1.5 text-[10px] text-emerald-600 mb-1">
                    <FileText :size="10" />
                    <span>数据类型</span>
                  </div>
                  <div class="text-sm font-semibold text-emerald-700">{{ getDataType(node) }}</div>
                </div>
                <div class="rounded-lg bg-purple-50 p-3 border border-purple-100">
                  <div class="flex items-center gap-1.5 text-[10px] text-purple-600 mb-1">
                    <Activity :size="10" />
                    <span>状态</span>
                  </div>
                  <div class="text-sm font-semibold text-purple-700">
                    {{ getNodeStatusText(node) }}
                  </div>
                </div>
              </div>

              <div class="rounded-lg bg-slate-900 p-4 border border-slate-700">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-medium text-slate-400">数据预览</span>
                  <div class="flex items-center gap-1">
                    <button
                      class="rounded px-2 py-1 text-[10px] text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      @click="copyNodeData(node)"
                    >
                      <Copy :size="12" class="mr-1" />
                      复制
                    </button>
                    <button
                      class="rounded px-2 py-1 text-[10px] text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      @click="downloadNodeData(node)"
                    >
                      <Download :size="12" class="mr-1" />
                      下载
                    </button>
                  </div>
                </div>
                <pre
                  class="text-[11px] leading-relaxed font-mono text-slate-100 overflow-x-auto whitespace-pre-wrap break-all"
                  >{{ formatNodeData(node) }}</pre
                >
              </div>
            </div>
          </div>
        </div>

        <div
          v-else
          class="flex flex-col items-center justify-center py-12 px-4 rounded-lg bg-slate-50 border-2 border-dashed border-slate-300 text-center"
        >
          <div class="mb-4 flex justify-center">
            <div class="rounded-full bg-slate-200 p-4">
              <Link :size="32" class="text-slate-400" />
            </div>
          </div>
          <p class="text-sm text-slate-600 font-medium mb-1">暂无连接</p>
          <p class="text-xs text-slate-400">请将其他节点连接至此节点以查看数据</p>
        </div>
      </div>
      <!-- Output Data -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="h-4 w-0.5 rounded-full bg-blue-500"></div>
            <h3 class="text-sm font-semibold text-slate-800">JSON预览</h3>
          </div>
          <div class="flex items-center gap-2">
            <el-button
              v-if="sourceNodes"
              size="small"
              type="primary"
              @click="exportAllData"
              class="!text-xs"
            >
              <Download :size="14" class="mr-1" />
              导出全部
            </el-button>
          </div>
        </div>
        <!-- JSON预览 -->
        <div v-if="outputNodes" class="space-y-3">
          <div
            class="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden hover:border-purple-300 transition-all hover:shadow-md"
          >
            <div class="rounded-lg bg-slate-900 p-4 border border-slate-700">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-slate-400">节点 / 边 JSON 数据预览</span>
                <div class="flex items-center gap-1">
                  <button
                    class="rounded px-2 py-1 text-[10px] text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    @click="copyOutputData"
                  >
                    <Copy :size="12" class="mr-1" />
                    复制
                  </button>
                  <button
                    class="rounded px-2 py-1 text-[10px] text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    @click="downloadOutputData"
                  >
                    <Download :size="12" class="mr-1" />
                    下载
                  </button>
                </div>
              </div>
              <pre
                class="text-[11px] leading-relaxed font-mono text-slate-100 overflow-x-auto whitespace-pre-wrap break-all"
                >{{ formattedOutputNodes }}</pre
              >
            </div>
          </div>
        </div>

        <div
          v-else
          class="flex flex-col items-center justify-center py-12 px-4 rounded-lg bg-slate-50 border-2 border-dashed border-slate-300 text-center"
        >
          <div class="mb-4 flex justify-center">
            <div class="rounded-full bg-slate-200 p-4">
              <Link :size="32" class="text-slate-400" />
            </div>
          </div>
          <p class="text-sm text-slate-600 font-medium mb-1">暂无连接</p>
          <p class="text-xs text-slate-400">请将其他节点连接至此节点以查看数据</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  Link,
  Copy,
  Type,
  Database,
  Image,
  Hash,
  Brain,
  Filter,
  GitBranch,
  CheckCircle,
  Download,
  ChevronDown,
  FileText,
  Activity,
} from 'lucide-vue-next'
import { useVueFlow, type Node } from '@vue-flow/core'
import { ElMessage } from 'element-plus'
import { useWorkflowStore } from '@/stores/workflow'
import { getOutputsByType } from '@/components/Workflow/config/nodeTypesData'
const store = useWorkflowStore()

const props = defineProps<{
  nodeId: string
  modelValue?: any
}>()

const emit = defineEmits<{
  'update:nodeConfig': [value: OutputField[]]
}>()

const { findNode, edges } = useVueFlow()
const expandedNodes = ref(new Set<string>())

interface OutputField {
  type: 'ImageField' | 'JsonField'
  name: string
  selector: string
}

interface SelectorOption {
  label: string
  value: string
}

interface SelectorGroup {
  nodeId: string
  nodeName: string
  nodeType: string
  options: SelectorOption[]
}

const getSelectorOptionsByNode = (node: Node): SelectorOption[] => {
  const options: SelectorOption[] = []
  const nodeName = (node as any).name || node.id

  if (node.type === 'inputs') {
    const nodeData = node.data
    if (!Array.isArray(nodeData)) return []
    nodeData.forEach((item: any) => {
      if (!item || typeof item.name !== 'string' || !item.name) return
      const value = `$inputs.${item.name}`
      options.push({
        label: value,
        value,
      })
    })
    return options
  }

  const outputs = getOutputsByType(node.type)
  outputs.forEach((outputKey: string) => {
    const value = `$steps.${nodeName}.${outputKey}`
    options.push({
      label: value,
      value,
    })
  })

  return options
}

const createDefaultOutputField = (index: number): OutputField => ({
  type: index === 0 ? 'ImageField' : 'JsonField',
  name: `output_${index + 1}`,
  selector: '',
})

const outputFields = ref<OutputField[]>([createDefaultOutputField(0)])

const resolveFieldTypeBySelector = (selector: string): OutputField['type'] => {
  return selector.includes('image') ? 'ImageField' : 'JsonField'
}

const getDefaultFieldNameBySelector = (selector: string, index: number) => {
  const segments = selector.split('.')
  console.log('hguisfhuisdfhg', segments)
  if (segments.length > 2) {
    const prefix = segments[segments.length - 2]?.trim() || ''
    const lastSegment = segments[segments.length - 1]?.trim() || ''
    return `${prefix}_${lastSegment || `${index + 1}`}`
  }
  const lastSegment = segments[segments.length - 1]?.trim() || ''
  console.log('非递归算法股市大幅改变', lastSegment)
  return lastSegment || `output_${index + 1}`
}

const normalizeFieldName = (name: unknown, selector: string, index: number) => {
  const trimmed = typeof name === 'string' ? name.trim() : ''
  if (trimmed) return trimmed
  return getDefaultFieldNameBySelector(selector, index)
}

const sanitizeSelector = (value: unknown) => {
  return typeof value === 'string' ? value.trim() : ''
}

// 输入数据
const sourceNodes = computed(() => {
  if (!props.nodeId) {
    return []
  }

  const ancestors = new Map<string, Node>()

  const findAncestors = (nodeId: string) => {
    const parentEdges = edges.value.filter((edge) => edge.target === nodeId)

    for (const edge of parentEdges) {
      const sourceNode = findNode(edge.source)
      if (sourceNode) {
        findAncestors(sourceNode.id)
        if (!ancestors.has(sourceNode.id)) {
          ancestors.set(sourceNode.id, sourceNode)
        }
      }
    }
  }

  findAncestors(props.nodeId)
  return Array.from(ancestors.values())
})

const directSourceNodes = computed(() => {
  if (!props.nodeId) return []

  const directSources = new Map<string, Node>()
  const parentEdges = edges.value.filter((edge) => edge.target === props.nodeId)
  parentEdges.forEach((edge) => {
    const sourceNode = findNode(edge.source)
    if (!sourceNode || directSources.has(sourceNode.id)) return
    directSources.set(sourceNode.id, sourceNode)
  })

  return Array.from(directSources.values())
})

const selectorOptions = computed<SelectorOption[]>(() => {
  const options: SelectorOption[] = []

  sourceNodes.value.forEach((node) => {
    options.push(...getSelectorOptionsByNode(node))
  })

  return Array.from(new Map(options.map((item) => [item.value, item])).values())
})

const selectorGroups = computed<SelectorGroup[]>(() => {
  return sourceNodes.value
    .map((node) => {
      const nodeName = (node as any).name || node.id
      const options = getSelectorOptionsByNode(node)

      return {
        nodeId: node.id,
        nodeName: String(nodeName),
        nodeType: node.type || '',
        options: Array.from(new Map(options.map((item) => [item.value, item])).values()),
      }
    })
    .filter((group) => group.options.length > 0)
})

const normalizeOutputFields = (value: any): OutputField[] => {
  if (!Array.isArray(value)) {
    return [createDefaultOutputField(0)]
  }

  const normalized = value
    .filter((item) => item && typeof item === 'object')
    .map((item, index) => {
      const selector = sanitizeSelector(item.selector)
      const type =
        item.type === 'ImageField' || item.type === 'JsonField'
          ? item.type
          : resolveFieldTypeBySelector(selector)

      return {
        type,
        name: normalizeFieldName(item.name, selector, index),
        selector,
      } as OutputField
    })

  return normalized.length > 0 ? normalized : [createDefaultOutputField(0)]
}

const syncOutputFieldsWithSelectableData = (fields: OutputField[]) => {
  const availableSelectors = selectorOptions.value.map((item) => item.value)
  const availableSelectorSet = new Set(availableSelectors)
  const defaultSelectorsFromDirectSources = Array.from(
    new Set(
      directSourceNodes.value
        .flatMap((node) => getSelectorOptionsByNode(node).map((option) => option.value))
        .filter((selector) => availableSelectorSet.has(selector)),
    ),
  )

  const normalizedFields = fields.map((field, index) => {
    const selector = sanitizeSelector(field.selector)
    return {
      type: resolveFieldTypeBySelector(selector),
      name: normalizeFieldName(field.name, selector, index),
      selector,
    } as OutputField
  })

  if (!availableSelectors.length) {
    return normalizedFields.length > 0 ? normalizedFields : [createDefaultOutputField(0)]
  }

  const seenSelector = new Set<string>()
  const syncedFields: OutputField[] = []

  normalizedFields.forEach((field) => {
    if (!field.selector || !availableSelectorSet.has(field.selector)) return
    if (seenSelector.has(field.selector)) return
    seenSelector.add(field.selector)
    syncedFields.push({
      type: resolveFieldTypeBySelector(field.selector),
      name: normalizeFieldName(field.name, field.selector, syncedFields.length),
      selector: field.selector,
    })
  })

  if (!syncedFields.length) {
    const fallbackSelectors = defaultSelectorsFromDirectSources.length
      ? defaultSelectorsFromDirectSources
      : availableSelectors.slice(0, 1)

    fallbackSelectors.forEach((selector, index) => {
      syncedFields.push({
        type: resolveFieldTypeBySelector(selector),
        name: getDefaultFieldNameBySelector(selector, index),
        selector,
      })
    })
  }

  return syncedFields
}

const mergeMissingDefaultSelectorsFromDirectSources = (fields: OutputField[]) => {
  const availableSelectors = selectorOptions.value.map((item) => item.value)
  const availableSelectorSet = new Set(availableSelectors)
  const defaultSelectorsFromDirectSources = Array.from(
    new Set(
      directSourceNodes.value
        .flatMap((node) => getSelectorOptionsByNode(node).map((option) => option.value))
        .filter((selector) => availableSelectorSet.has(selector)),
    ),
  )

  if (!defaultSelectorsFromDirectSources.length) {
    return syncOutputFieldsWithSelectableData(fields)
  }

  const normalized = syncOutputFieldsWithSelectableData(fields)
  const selectedSelectorSet = new Set(
    normalized.map((field) => sanitizeSelector(field.selector)).filter((selector) => !!selector),
  )
  const merged = [...normalized]

  defaultSelectorsFromDirectSources.forEach((selector) => {
    if (selectedSelectorSet.has(selector)) return
    selectedSelectorSet.add(selector)
    merged.push({
      type: resolveFieldTypeBySelector(selector),
      name: getDefaultFieldNameBySelector(selector, merged.length),
      selector,
    })
  })

  return merged
}

const isSameFields = (a: OutputField[], b: OutputField[]) => {
  return JSON.stringify(a) === JSON.stringify(b)
}

const initializeOutputFields = () => {
  const normalizedFromProps = syncOutputFieldsWithSelectableData(normalizeOutputFields(props.modelValue))
  const initialized = mergeMissingDefaultSelectorsFromDirectSources(normalizedFromProps)
  outputFields.value = initialized

  // 初始化若自动补齐了默认 selector，需要回写到节点 data
  if (!isSameFields(initialized, normalizedFromProps)) {
    emit('update:nodeConfig', JSON.parse(JSON.stringify(initialized)))
  }
}

const updateOutputConfig = () => {
  outputFields.value = syncOutputFieldsWithSelectableData(outputFields.value)
  emit('update:nodeConfig', JSON.parse(JSON.stringify(outputFields.value)))
}

const isSelectorSelected = (selector: string) => {
  return outputFields.value.some((field) => field.selector === selector)
}

const addOutputFieldBySelector = (selector: string) => {
  if (!selector) return
  if (isSelectorSelected(selector)) {
    ElMessage.warning('该selector已添加')
    return
  }

  const field: OutputField = {
    type: resolveFieldTypeBySelector(selector),
    name: getDefaultFieldNameBySelector(selector, outputFields.value.length),
    selector,
  }
  outputFields.value.push(field)
  updateOutputConfig()
}

const removeOutputField = (index: number) => {
  outputFields.value.splice(index, 1)
  if (outputFields.value.length === 0) {
    outputFields.value.push(createDefaultOutputField(0))
  }
  updateOutputConfig()
}
// JSON预览
const outputNodes = computed(() => {
  if (!props.nodeId) {
    return null
  }
  return store.getSaveWorkflowData()
})

const formattedOutputNodes = computed(() => {
  return outputNodes.value ? JSON.stringify(outputNodes.value, null, 2) : ''
})

const getNodeData = (node: Node) => node.data

const getDataPropertiesCount = (data: any) => {
  if (Array.isArray(data)) {
    return data.length
  }
  if (data && typeof data === 'object') {
    return Object.keys(data).filter((key) => key !== 'onHandleClick').length
  }
  return 0
}

const getNodeTypeIcon = (type: string | undefined) => {
  if (!type) return Database
  const iconMap: Record<string, any> = {
    inputs: Image,
    outputs: Type,
    model: Brain,
    processing: Hash,
    visualization: Hash,
    conditional_branch: GitBranch,
    'conditional_branch@v1': Filter,
  }
  return iconMap[type] || Database
}

const getNodePropertiesCount = (node: Node) => {
  return getDataPropertiesCount(getNodeData(node))
}

const getDataType = (node: Node) => {
  const data = getNodeData(node)
  if (Array.isArray(data)) {
    if (data.length === 0) return '无数据'
    const hasImage = data.some((prop: any) => prop.type === 'image')
    const hasParameter = data.some((prop: any) => prop.type === 'parameter')
    if (hasImage && hasParameter) return '混合'
    if (hasImage) return '图片'
    if (hasParameter) return '参数'
    return '数组'
  }

  if (!data || typeof data !== 'object') return '无数据'
  const keys = Object.keys(data).filter((key) => key !== 'onHandleClick')
  if (keys.length === 0) return '无数据'
  const hasImage = 'image' in data
  const hasPredictions = 'predictions' in data
  if (hasImage && hasPredictions) return '图像预测'
  if (hasImage) return '图片'
  if (hasPredictions) return '预测'
  if ('model_repository_id' in data || 'model_name' in data) return '模型配置'
  if ('box_color' in data || 'box_thickness' in data) return '可视化配置'
  return '其他'
}

const getNodeStatusType = (node: Node) => {
  if (getDataPropertiesCount(getNodeData(node)) === 0) return 'warning'
  return 'success'
}

const getNodeStatusText = (node: Node) => {
  if (getDataPropertiesCount(getNodeData(node)) === 0) return '未配置'
  return '已配置'
}

const formatNodeData = (node: any) => {
  const data = node?.data
  const formatted = {
    id: node?.id,
    type: node?.type,
    name: node?.name || data?.label || node?.type,
    data: data || {},
  }
  return JSON.stringify(formatted, null, 2)
}

const toggleNodeExpand = (nodeId: string) => {
  if (expandedNodes.value.has(nodeId)) {
    expandedNodes.value.delete(nodeId)
  } else {
    expandedNodes.value.add(nodeId)
  }
}

const fallbackCopyText = (text: string) => {
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', 'readonly')
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    const copied = document.execCommand('copy')
    document.body.removeChild(textarea)
    return copied
  } catch {
    return false
  }
}

const copyText = async (text: string, successMsg: string, errorMsg: string) => {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      ElMessage.success(successMsg)
      return
    }
    const copied = fallbackCopyText(text)
    if (copied) {
      ElMessage.success(successMsg)
      return
    }
    ElMessage.error(errorMsg)
  } catch {
    const copied = fallbackCopyText(text)
    if (copied) {
      ElMessage.success(successMsg)
      return
    }
    ElMessage.error(errorMsg)
  }
}

const copyNodeData = async (node: any) => {
  const data = formatNodeData(node)
  await copyText(data, '已复制节点数据', '复制失败')
}

const copyOutputData = async () => {
  if (!formattedOutputNodes.value) {
    ElMessage.warning('暂无输出数据')
    return
  }
  await copyText(formattedOutputNodes.value, '已复制JSON预览', '复制失败')
}

const downloadText = (text: string, filename: string, successMsg: string) => {
  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success(successMsg)
}

const downloadNodeData = (node: any) => {
  const data = formatNodeData(node)
  const fileName = `${node.type}_${String(node.id || '').slice(-6)}.json`
  downloadText(data, fileName, '已下载节点数据')
}

const downloadOutputData = () => {
  if (!formattedOutputNodes.value) {
    ElMessage.warning('暂无输出数据')
    return
  }
  downloadText(formattedOutputNodes.value, `output_data_${Date.now()}.json`, '已下载输出数据')
}

const exportAllData = () => {
  const allData = sourceNodes.value.map((node) => ({
    id: node.id,
    type: node.type,
    name: (node as any).name || node.type,
    data: node.data || {},
  }))

  const data = JSON.stringify(allData, null, 2)
  downloadText(data, `source_nodes_data_${Date.now()}.json`, '已导出所有数据')
}

watch(
  () => props.modelValue,
  () => initializeOutputFields(),
  { deep: true, immediate: true },
)

watch(
  selectorOptions,
  () => {
    const merged = mergeMissingDefaultSelectorsFromDirectSources(outputFields.value)
    const changed = JSON.stringify(merged) !== JSON.stringify(outputFields.value)
    if (changed) {
      outputFields.value = merged
      updateOutputConfig()
    }
  },
  { deep: true },
)
</script>
