<template>
  <div class="group relative pt-5">
    <div
      class="hidden shadow-lg border border-indigo-100 group-hover:block absolute -top-2 right-2 bg-white text-indigo-400 p-1.5 rounded-md cursor-pointer hover:bg-indigo-200 transition-colors"
      @click.stop="deleteNode"
      title="删除节点"
    >
      <Trash :size="14" />
    </div>
    <div
      class="group relative w-[260px] bg-white rounded-xl border hover:border-indigo-500 shadow transition-all"
      :class="[selected ? 'border-1 border-indigo-500 shadow-xl' : 'border-1 border-gray-200']"
    >
      <div class="flex items-center justify-between p-3 rounded-t-xl border-b border-gray-200">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center"
            :class="`bg-${nodeColor}-100 text-${nodeColor}-600`"
          >
            <component :size="18" :is="getIconComponent(nodeType?.icon || 'GitBranch')" />
          </div>
          <div class="flex flex-col">
            <div :class="`text-[10px] rounded-full uppercase font-bold text-${nodeColor}-600`">
              {{ nodeType?.name || 'Conditional_Branch' }}
            </div>
            <div class="text-[11px] text-gray-700 tracking-[1px]">
              {{ nodeType?.description || 'Conditional branch node' }}
            </div>
          </div>
        </div>
        <el-tooltip
          v-if="isShowTip"
          class="box-item"
          effect="dark"
          :content="tipContent"
          placement="top"
        >
          <div
            class="flex items-center justify-center min-w-7 min-h-7 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors cursor-pointer"
          >
            <TriangleAlert :size="14" />
          </div>
        </el-tooltip>
      </div>

      <div class="p-2 space-y-2">
        <div class="flex items-center justify-between p-1.5 rounded-lg border border-slate-100">
          <div class="flex items-center gap-2.5 flex-1 min-w-0">
            <div
              class="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center bg-indigo-500"
            >
              <Filter :size="14" class="text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-[10px] text-slate-400">Condition</div>
              <div class="text-xs font-medium text-slate-600 truncate">
                {{ conditionSummary }}
              </div>
            </div>
          </div>
          <div
            v-if="!isShowTip"
            class="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"
          >
            <CheckCircle :size="12" class="text-emerald-600" />
          </div>
          <div
            v-else
            class="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center"
          >
            <AlertCircle :size="12" class="text-amber-600" />
          </div>
        </div>

        <div class="flex items-center justify-between p-1.5 rounded-lg border border-slate-100">
          <div class="flex items-center gap-2.5 flex-1 min-w-0">
            <div
              class="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center bg-violet-500"
            >
              <GitFork :size="14" class="text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-[10px] text-slate-400">Branches</div>
              <div class="text-xs font-medium text-slate-600 truncate">
                {{ branchSummary }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CustomHandle
        type="target"
        :position="Position.Left"
        :node-id="props.id"
        @handle-click="(event, type, id) => onHandleClick?.(event, type, id)"
      />
      <CustomHandle
        type="source"
        :position="Position.Right"
        :node-id="props.id"
        :color="nodeColor"
        :show-tooltip="true"
        @handle-click="(event, type, id) => onHandleClick?.(event, type, id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref, onMounted } from 'vue'
import { Position } from '@vue-flow/core'
import CustomHandle from '@/components/Workflow/Nodes/Handel/CustomHandle.vue'
import { useWorkflowStore } from '@/stores/workflow'
import {
  TriangleAlert,
  Trash,
  Filter,
  GitFork,
  CheckCircle,
  AlertCircle,
} from 'lucide-vue-next'
import { getIconComponent } from '@/components/Workflow/config/nodeConfig'
import { getNodeType } from '@/components/Workflow/config/nodeTypes'

const store = useWorkflowStore()
const props = defineProps<{
  id: string
  data: any
  selected?: boolean
  type: string
}>()

const onHandleClick = computed(() => {
  return props.data?.onHandleClick as (
    event: MouseEvent,
    handleType: 'source' | 'target',
    nodeId: string,
  ) => void | undefined
})

const nodeType = computed(() => getNodeType(props.type))
const nodeColor = computed(() => nodeType.value?.color || 'indigo')
const properties = computed(() => props.data?.config?.[0] || {})

const conditionSummary = computed(() => {
  if (props.type === 'switch_case') {
    return properties.value?.routeField || 'Please set route field'
  }

  const expression = properties.value?.expression
  if (expression) {
    return expression
  }

  const field = properties.value?.field
  const operator = properties.value?.operator || '=='
  const value = properties.value?.value
  if (field) {
    return `${field} ${operator} ${value ?? ''}`.trim()
  }

  return 'Please set condition expression'
})

const branchSummary = computed(() => {
  if (props.type === 'switch_case') {
    const cases = Array.isArray(properties.value?.cases) ? properties.value.cases : []
    return `${cases.length} case(s), default: ${properties.value?.defaultLabel || 'default'}`
  }

  const trueLabel = properties.value?.trueLabel || 'true'
  const falseLabel = properties.value?.falseLabel || 'false'
  return `${trueLabel} / ${falseLabel}`
})

const deleteNode = () => {
  store.removeNode(props.id)
  store.setSelectedNode(null)
}

const isShowTip = ref(true)
const tipContent = ref('')

const updateTipState = () => {
  if (props.type === 'switch_case') {
    const routeField = properties.value?.routeField
    const cases = Array.isArray(properties.value?.cases) ? properties.value.cases : []

    if (!routeField) {
      tipContent.value = 'Please configure route field'
      isShowTip.value = true
      return
    }

    if (cases.length === 0) {
      tipContent.value = 'Please configure at least one case'
      isShowTip.value = true
      return
    }

    isShowTip.value = false
    return
  }

  const expression = properties.value?.expression
  const field = properties.value?.field
  if (!expression && !field) {
    tipContent.value = 'Please configure condition expression'
    isShowTip.value = true
    return
  }

  isShowTip.value = false
}

onMounted(() => {
  updateTipState()
})

watch(
  () => props.data,
  () => {
    updateTipState()
  },
  { deep: true },
)
</script>
