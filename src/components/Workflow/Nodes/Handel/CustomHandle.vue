<!-- 自定义节点的自定义处理句柄 -->
<template>
  <div>
    <!-- 按住拖拽，鼠标松开监听，也可以进行添加节点 -->
    <Handle
      :id="branchType"
      :type="type"
      :position="position"
      class="!w-3 !h-3 handle"
      :class="handleClasses + ' ' + branchTypeStyle"
      @click="handleClick"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
      :style="mergedHandleStyle"
    />

    <!-- 悬浮提示 -->
    <div
      v-if="isHovered && showTooltip && type === 'source'"
      class="absolute right-[-38px] top-[50px] transform px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10"
    >
      点击添加节点
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { ref, computed } from 'vue'
import { useWorkflowStore } from '@/stores/workflow'

const store = useWorkflowStore()
const props = defineProps<{
  type: 'source' | 'target'
  position: Position
  nodeId: string
  showTooltip?: boolean
  handleStyle?: Record<string, string | number>
  branchType?: 'true' | 'false'
}>()

const handleStyle = computed(() => props.handleStyle)
const branchType = computed(() => props.branchType)

const emit = defineEmits<{
  handleClick: [event: MouseEvent, handleType: 'source' | 'target', nodeId: string]
}>()

const isHovered = ref(false)

const handleClasses = computed(() => {
  return props.type === 'source' ? 'transition-all duration-200 hover:scale-110' : ''
})

const branchTypeStyle = computed<string>(() => {
  if (props.type !== 'source') return 'default-handle'
  if (branchType.value === 'true') {
    return 'success-handle'
  }
  if (branchType.value === 'false') {
    return 'error-handle'
  }
  return 'custom-handle'
})

const mergedHandleStyle = computed<Record<string, string | number>>(() => {
  return {
    // backgroundColor: '#3381f9',
    // borderColor: '#fff',
    // borderWidth: 2,
    // backgroundColor: '#fff',
    // borderColor: '#c5c5c5',
    cursor: props.type === 'source' ? 'crosshair' : 'grab',
    ...(handleStyle.value || {}),
  }
})

const handleClick = (event: MouseEvent) => {
  console.log('CustomHandle点击事件:', props, event)
  if (props.type === 'target') {
    return
  }
  store.setCurrentHandleInfo(props.nodeId, event, props.branchType)
  event.stopPropagation()
}
</script>
<style scoped>
.default-handle {
  border: 2px solid #cfcfcf;
  background-color: #fff;
}
.custom-handle {
  border: 2px solid #cfcfcf;
  background-color: #fff;
}
.custom-handle:hover {
  border-color: #007bff;
}
.success-handle {
  background-color: #00c950;
}
.custom-handle.success-handle {
  border-color: #00c950;
}
.error-handle {
  background-color: #ff4141;
}
.custom-handle.error-handle {
  border-color: #ff4141;
}
</style>
