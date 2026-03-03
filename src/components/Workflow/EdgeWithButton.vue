<template>
  <!-- 自定义边组件，用于渲染自定义边 -->
  <!-- 鼠标移入显示标签 -->
  <BaseEdge
    :id="id"
    :style="style"
    :path="path[0]"
    :marker-end="markerEnd"
    @mouseenter="showLabel"
    @mouseleave="hideLabel"
  />

  <!-- 自定义边标签渲染器，用于渲染自定义边标签 -->
  <EdgeLabelRenderer v-if="labelVisible">
    <div
      :style="{
        pointerEvents: 'all',
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
      }"
    >
      <X :size="14" class="text-white bg-red-400 rounded-full" @click="removeEdges(id)" />
    </div>
  </EdgeLabelRenderer>
</template>

<script setup>
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useVueFlow } from '@vue-flow/core'
import { ref, computed } from 'vue'
import { X } from 'lucide-vue-next'

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

const { removeEdges } = useVueFlow()

const path = computed(() => getBezierPath(props))

const labelVisible = ref(false)
// 显示标签
const showLabel = () => {
  labelVisible.value = true
  console.log('showLabel')
}

// 隐藏标签
const hideLabel = () => {
  labelVisible.value = false
}
</script>

<!-- <script>
export default {
  inheritAttrs: false,
}
</script> -->
<style scoped></style>
