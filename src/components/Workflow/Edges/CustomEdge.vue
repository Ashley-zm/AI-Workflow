<script setup lang="ts">
import { BaseEdge, getBezierPath, Position, EdgeLabelRenderer } from '@vue-flow/core'
import { computed, ref } from 'vue'
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
  data: {
    type: Object,
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

// 控制按钮显示状态
const isHovered = ref(false)

//给父组件传递事件
const emit = defineEmits({
  edgeMouseEnter: (id: string) => true,
  edgeMouseLeave: () => true,
  removeEdge: (id: string) => true,
})

const onEdgeMouseOver = (id: string) => {
  isHovered.value = true
  emit('edgeMouseEnter', id)
}
const onEdgeMouseLeave = () => {
  isHovered.value = false
  emit('edgeMouseLeave')
}

const removeEdge = (id: string) => {
  emit('removeEdge', id)
}
</script>

<template>
  <BaseEdge
    :id="id"
    :style="style"
    :path="path[0]"
    :marker-end="markerEnd"
    :label="data?.text"
    :label-x="path[1]"
    :label-y="path[2]"
    :label-style="{ fill: 'white' }"
    :label-show-bg="true"
    :label-bg-style="{ fill: 'red' }"
    :label-bg-padding="[2, 4]"
    :label-bg-border-radius="2"
    @mouseenter="onEdgeMouseOver(id)"
    @mouseleave="onEdgeMouseLeave()"
  />

  <!-- 悬停显示的删除按钮 -->
  <EdgeLabelRenderer v-if="isHovered">
    <div
      :style="{
        pointerEvents: 'all',
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
      }"
    >
      <X
        :size="14"
        class="text-white bg-red-400 rounded-full p-0.5 cursor-pointer hover:bg-red-500 transition-colors"
        @click="removeEdge(id)"
      />
    </div>
  </EdgeLabelRenderer>
</template>
