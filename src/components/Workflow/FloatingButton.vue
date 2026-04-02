<template>
  <div
    class="fixed top-20 left-8 z-50"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- 悬浮按钮 -->
    <div
      @click="toggleComponentLibrary"
      class="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all duration-300 transform"
      :class="{ 'rotate-45': isOpen, 'scale-110': isHovered }"
    >
      <Plus :size="24" />
    </div>

    <!-- 组件库弹窗 -->
    <div
      v-if="isOpen"
      class="absolute top-16 left-0 bg-white w-80 max-h-96 shadow-2xl rounded-xl overflow-hidden"
    >
      <AllNodeSelectors @closeBar="closeComponentLibrary" @dragStart="onDragStart" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, X } from 'lucide-vue-next'
import AllNodeSelectors from './Nodes/AllNodeSelectors.vue'

// 定义事件
const emit = defineEmits<{
  dragStart: [event: DragEvent, type: string]
  selectComponent: [componentType: string, handleInfo?: any]
}>()

// 状态管理
const isOpen = ref(true)
const isHovered = ref(false)

// 切换组件库显示状态
const toggleComponentLibrary = () => {
  isOpen.value = !isOpen.value
}

// 关闭组件库
const closeComponentLibrary = () => {
  isOpen.value = false
}

// 拖拽开始事件
const onDragStart = (event: DragEvent, item: any) => {
  console.log('拖拽开始1:', item.type)
  emit('dragStart', event, item.type)
}
</script>

<style scoped>
/* 动画效果 */
.transform {
  transition: transform 0.3s ease;
}

.rotate-45 {
  transform: rotate(45deg);
}

.scale-110 {
  transform: scale(1.1);
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(241, 245, 249, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}
</style>
