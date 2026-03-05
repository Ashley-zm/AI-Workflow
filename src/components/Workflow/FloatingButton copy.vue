<template>
  <div
    class="fixed top-8 left-8 z-50"
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
      <!-- 组件列表 -->
      <div class="p-4 overflow-y-auto max-h-80">
        <div class="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
          <h3 class="text-lg font-bold text-gray-800">选择添加节点</h3>
          <X :size="22" @click="closeComponentLibrary" class="cursor-pointer hover:bg-gray-100 p-1 rounded-full" />
        </div>
        <div class="grid grid-cols-1 gap-3">
          <div v-for="(item, index) in nodeTypesList" :key="index" class="space-y-2">
            <h4 class="text-sm font-medium text-gray-700 mb-2">{{ item.name }}</h4>
            <div
              v-for="(child, childIndex) in item.children"
              :key="childIndex"
              draggable="true"
              @dragstart="onDragStart($event, child)"
              @click="selectComponent(child)"
              class="group bg-white rounded-lg p-3 border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all"
              :class="getChildHoverClasses(child.color)"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center"
                  :class="getChildIconClasses(child.color)"
                >
                  <component
                    v-if="child.icon"
                    :size="16"
                    :class="getTextColor(child.color)"
                    :is="getIconComponent(child.icon)"
                  />
                </div>
                <div class="flex-1">
                  <div
                    class="text-sm font-semibold text-gray-800"
                    :class="getHoverTextColor(child.color)"
                  >
                    {{ child.name }}
                  </div>
                  <div
                    v-if="child.description"
                    class="text-xs text-gray-500 mt-1 leading-relaxed"
                    :class="getHoverTextColor(child.color)"
                  >
                    {{ child.description }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, X } from 'lucide-vue-next'
import { nodeTypesList } from '@/components/Workflow/Nodes/nodeTypes'
import {
  getIconComponent,
  getTextColor,
  getHoverTextColor,
  getChildHoverClasses,
  getChildIconClasses,
} from '@/components/Workflow/Nodes/nodeConfig'

// 定义事件
const emit = defineEmits<{
  dragStart: [event: DragEvent, type: string]
  selectComponent: [componentType: string, handleInfo?: any]
}>()

// 状态管理
const isOpen = ref(false)
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
  emit('dragStart', event, item.type)
}

// 选择组件
const selectComponent = (component: any) => {
  emit('selectComponent', component.type, null)
  closeComponentLibrary()
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