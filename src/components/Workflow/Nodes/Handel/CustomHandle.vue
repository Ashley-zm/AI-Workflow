<!-- 自定义节点的自定义处理句柄 -->
<template>
  <div :class="type === 'source' ? 'relative' : ''">
    <!-- 按住拖拽，鼠标松开监听，也可以进行添加节点 -->
    <Handle
      :type="type"
      :position="position"
      class="!w-3 !h-3"
      :class="handleClasses"
      @click="handleClick"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
      :style="{
        backgroundColor: '#fff',
        borderColor: '#c5c5c5',
        cursor: props.type === 'source' ? 'crosshair' : 'grab',
      }"
    />

    <!-- 悬浮提示 -->
    <div
      v-if="isHovered && showTooltip && type === 'source'"
      class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10"
    >
      点击添加节点
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { ref, computed } from 'vue'

const props = defineProps<{
  type: 'source' | 'target'
  position: Position
  nodeId: string
  color?: string
  showTooltip?: boolean
}>()

const emit = defineEmits<{
  handleClick: [event: MouseEvent, handleType: 'source' | 'target', nodeId: string]
}>()

const isHovered = ref(false)

const handleClasses = computed(() => {
  return props.type === 'source' ? 'transition-all duration-200 hover:scale-110' : ''
})

const handleClick = (event: MouseEvent) => {
  console.log('CustomHandle点击事件:', props.nodeId, props.type)
  if (props.type === 'target') {
    return
  }
  event.stopPropagation()
  emit('handleClick', event, props.type, props.nodeId)
}
</script>
