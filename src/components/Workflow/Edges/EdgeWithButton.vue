<template>
  <BaseEdge :id="id" :style="edgeStyle" :path="path[0]" :marker-end="markerEnd" />
  <path
    :d="path[0]"
    fill="none"
    :stroke="edgeStrokeColor"
    :stroke-width="2"
    style="pointer-events: none"
  />
  <path
    :d="path[0]"
    fill="none"
    stroke="transparent"
    :stroke-width="20"
    style="pointer-events: stroke"
    @mouseenter="isEdgeHovered = true"
    @mouseleave="isEdgeHovered = false"
  />
  <EdgeLabelRenderer>
    <div
      v-if="labelVisible"
      class="cursor-pointer text-white bg-red-400 hover:bg-red-500 hover:text-white rounded-full"
      :style="{
        pointerEvents: 'all',
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
      }"
      @mouseenter="isButtonHovered = true"
      @mouseleave="isButtonHovered = false"
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
  sourceHandle: {
    type: [String, Boolean],
    required: false,
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

const currentEdge = computed(() => store.edges.find((edge) => String(edge.id) === String(props.id)))

const normalizeSourceHandle = (value: unknown): boolean | null => {
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false
  return null
}

const effectiveSourceHandle = computed(() => {
  const edgeSourceHandle = (currentEdge.value as any)?.sourceHandle
  if (edgeSourceHandle !== undefined) return edgeSourceHandle
  return props.sourceHandle
})

const edgeStrokeColor = computed(() => {
  const normalized = normalizeSourceHandle(effectiveSourceHandle.value)
  if (normalized === true) return '#22c55e'
  if (normalized === false) return '#ef4444'
  return '#b5b5b5'
})

const edgeStyle = computed(() => ({
  // ...(props.style || {}),
  stroke: edgeStrokeColor.value,
}))

const isEdgeHovered = ref(false)
const isButtonHovered = ref(false)
const labelVisible = computed(() => isEdgeHovered.value || isButtonHovered.value)
const handleClickRemove = () => {
  store.removeEdge(props.id)
  store.setSelectedNode(null)
}
</script>
