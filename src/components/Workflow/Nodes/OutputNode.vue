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
            {{ props.label || props.id || nodeType?.label || 'Output' }}
          </span>
          <p class="text-xs text-gray-500 tracking-[1px]">
            {{ nodeType?.description }}
          </p>
        </div>
      </div>
    </div>
    <CustomHandle type="target" :position="Position.Left" :node-id="id" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Position } from '@vue-flow/core'
import CustomHandle from '@/components/Workflow/Nodes/Handel/CustomHandle.vue'
import { getNodeType } from '@/components/Workflow/config/nodeTypes'
import { getIconComponent } from '@/components/Workflow/config/nodeConfig'
import { useWorkflowStore } from '@/stores/workflow'

const store = useWorkflowStore()
const props = defineProps<{
  id: string
  label?: string
  data: any
  // selected?: boolean
  type: string
}>()
const nodeType = computed(() => getNodeType(props.type))
const nodeColor = computed(() => nodeType.value?.color || 'blue')
const selected = computed(() => store.selectedNode?.id === props.id)
</script>
