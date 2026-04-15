<template>
  <BaseEdge :id="id" :style="edgeStyle" :path="path[0]" :marker-end="markerEnd" />
  <EdgeLabelRenderer>
    <div
      v-if="labelVisible"
      class="cursor-pointer text-white bg-red-400 hover:bg-red-500 hover:text-white rounded-full"
      :style="{
        pointerEvents: 'all',
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
      }"
    >
      <X :size="14" @click="handleClickRemove" />
    </div>
  </EdgeLabelRenderer>
</template>

<script setup lang="ts">
import { BaseEdge, EdgeLabelRenderer, getBezierPath, Position, useVueFlow } from '@vue-flow/core'
import { computed, ref } from 'vue'
import { X } from 'lucide-vue-next'
import { useWorkflowStore } from '@/stores/workflow'
const store = useWorkflowStore()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  sourceX: {
    type: Number,
    required: true,
  },
  sourceY: {
    type: Number,
    required: true,
  },
  targetX: {
    type: Number,
    required: true,
  },
  targetY: {
    type: Number,
    required: true,
  },
  sourcePosition: {
    type: String,
    required: true,
  },
  targetPosition: {
    type: String,
    required: true,
  },
  markerEnd: {
    type: String,
    required: false,
  },
  style: {
    type: Object,
    required: false,
  },
})
const path = computed(() =>
  getBezierPath({
    ...props,
    sourcePosition: props.sourcePosition as Position,
    targetPosition: props.targetPosition as Position,
  }),
)

const edgeStyle = computed(() => ({
  stroke: '#5e5e5eff',
  ...(props.style || {}),
}))

const labelVisible = ref(true)
const handleClickRemove = () => {
  store.removeEdge(props.id)
}
</script>
