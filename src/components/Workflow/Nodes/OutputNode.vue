<template>
  <div
    class="group relative w-[250px] bg-white rounded-xl border border-gray-200 shadow transition-all"
    :class="[selected ? `shadow-xl` : `hover:shadow-xl`]"
  >
    <div class="flex items-center justify-between p-3 rounded-t-xl border-b border-gray-200">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center"
          :class="`bg-${nodeColor}-100 text-${nodeColor}-600`"
        >
          <component :size="18" :is="getIconComponent(nodeType?.icon || 'BotIcon')" />
        </div>
        <div class="flex flex-col">
          <span :class="`text-sm font-bold text-${nodeColor}-600`">
            {{ nodeType?.label || 'Output' }}
          </span>
          <p :class="`text-xs text-${nodeColor}-600/80`">
            {{ nodeType?.description || '查看最终结果及输入数据' }}
          </p>
        </div>
      </div>
    </div>

    <!-- <div class="p-3">
      <div v-if="sourceNodes.length > 0" class="space-y-2">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <div class="h-4 w-0.5 rounded-full bg-purple-500"></div>
            <span class="text-xs font-semibold text-slate-700">输入源</span>
          </div>
          <div
            class="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium bg-purple-100 text-purple-700"
          >
            <Database :size="10" />
            {{ sourceNodes.length }} 个
          </div>
        </div>
        <div
          v-for="node in sourceNodes"
          :key="node.id"
          class="group/source flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer"
        >
          <div class="flex items-center gap-2.5 flex-1 min-w-0">
            <div
              class="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center"
              :class="getSourceNodeColorClass(node.type)"
            >
              <component :is="getSourceNodeIcon(node.type)" :size="14" class="text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-semibold text-slate-700 truncate">
                {{ node.data?.label || node.label || node.type }}
              </div>
              <div class="text-[10px] text-slate-500">{{ getSourceNodeTypeLabel(node.type) }}</div>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <el-tag size="small" type="info" class="text-[10px]"> #{{ node.id }} </el-tag>
          </div>
        </div>
      </div>
      <div
        v-else
        class="flex flex-col items-center justify-center py-6 px-4 rounded-lg bg-slate-50 border-2 border-dashed border-slate-300 text-center"
      >
        <div class="mb-2 flex justify-center">
          <div class="rounded-full bg-slate-200 p-2">
            <Link :size="20" class="text-slate-400" />
          </div>
        </div>
        <p class="text-sm font-medium text-slate-600">等待连接</p>
        <p class="text-xs text-slate-400 mt-1">请将其他节点连接至此节点以查看数据</p>
      </div>
    </div> -->

    <CustomHandle type="target" :position="Position.Left" :node-id="id" color="purple" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Position, useVueFlow } from '@vue-flow/core'
import CustomHandle from '@/components/Workflow/Nodes/Handel/CustomHandle.vue'
import { useWorkflowStore } from '@/stores/workflow'
import { Link, Database, Image, Hash, Brain, Filter, Route, GitBranch } from 'lucide-vue-next'
import { getNodeType } from '@/components/Workflow/config/nodeTypes'
import { getIconComponent } from '@/components/Workflow/config/nodeConfig'

const props = defineProps<{
  id: string
  data: any
  selected?: boolean
  type: string
}>()
const nodeType = computed(() => getNodeType(props.type))
const nodeColor = computed(() => nodeType.value?.color || 'blue')

const store = useWorkflowStore()
const { findNode, edges } = useVueFlow()

const sourceNodes = computed(() => {
  return edges.value
    .filter((edge) => edge.target === props.id)
    .map((edge) => findNode(edge.source))
    .filter((node) => node !== undefined)
})

const getSourceNodeTypeLabel = (type: string | undefined) => {
  if (!type) return ''
  const typeMap: Record<string, string> = {
    inputs: '输入',
    outputs: '输出',
    model: '模型',
    processing: '处理',
    visualization: '可视化',
    conditional_branch: '条件分支',
    if_else: 'If/Else',
    switch_case: 'Switch/Case',
  }
  return typeMap[type] || type
}

const getSourceNodeColorClass = (type: string | undefined) => {
  if (!type) return 'bg-slate-500'
  const colorMap: Record<string, string> = {
    inputs: 'bg-emerald-500',
    outputs: 'bg-amber-500',
    model: 'bg-blue-500',
    processing: 'bg-purple-500',
    visualization: 'bg-pink-500',
    conditional_branch: 'bg-indigo-500',
    if_else: 'bg-indigo-500',
    switch_case: 'bg-indigo-500',
  }
  return colorMap[type] || 'bg-slate-500'
}

const getSourceNodeIcon = (type: string | undefined) => {
  if (!type) return Database
  const iconMap: Record<string, any> = {
    inputs: Image,
    outputs: Hash,
    model: Brain,
    processing: Hash,
    visualization: Hash,
    conditional_branch: GitBranch,
    if_else: Filter,
    switch_case: Route,
  }
  return iconMap[type] || Database
}
</script>
