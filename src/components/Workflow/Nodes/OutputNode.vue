<template>
  <div
    class="group relative w-[260px] bg-white rounded-xl hover:shadow-lg transition-all"
    :class="[
      selected
        ? 'border-l-4 border-y-1 border-r-1 border-purple-500 shadow-lg'
        : 'border-l-4 border-purple-500 border-t-1 border-b-1 border-r-1 border-gray-200',
    ]"
  >
    <div class="flex items-center justify-between p-2 rounded-t-xl border-b border-gray-100">
      <div class="flex items-center gap-2">
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600"
        >
          <FileOutput :size="18" />
        </div>
        <div>
          <div class="text-[10px] rounded-full uppercase font-bold text-purple-600">Output</div>
          <div class="text-[10px] text-gray-700">
            {{ data.label || '结果输出' }}
          </div>
        </div>
      </div>
    </div>

    <div class="px-4 py-2">
      <div v-if="sourceNodes.length > 0" class="space-y-2">
        <div class="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
          输入源：
        </div>
        <div
          v-for="node in sourceNodes"
          :key="node.id"
          class="flex items-center justify-between text-xs bg-gray-50 p-1.5 rounded border border-gray-100"
        >
          <span class="text-gray-700 truncate max-w-[140px]">{{
            node.data?.label || node.label || node.type
          }}</span>
          <span class="text-[10px] text-gray-400">#{{ node.id }}</span>
        </div>
      </div>
      <div v-else class="py-2 text-center">
        <span class="text-xs text-gray-400">等待连接...</span>
      </div>
    </div>

    <CustomHandle type="target" :position="Position.Top" :node-id="id" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Position, useVueFlow } from '@vue-flow/core'
import CustomHandle from '@/components/Workflow/Nodes/Handel/CustomHandle.vue'
import { useWorkflowStore } from '@/stores/workflow'
import { FileOutput, Trash } from 'lucide-vue-next'

const props = defineProps<{
  id: string
  data: any
  selected?: boolean
}>()

const store = useWorkflowStore()
const { findNode, edges } = useVueFlow()

const sourceNodes = computed(() => {
  return edges.value
    .filter((edge) => edge.target === props.id)
    .map((edge) => findNode(edge.source))
    .filter((node) => node !== undefined)
})

// const deleteNode = () => {
//   store.removeNode(props.id);
//   store.setSelectedNode(null);
// };
</script>
