<template>
  <div class="min-w-[280px] border-r border-slate-200 flex flex-col shadow-lg">
    <!-- 顶部标题和返回按钮 -->
    <div class="p-5 bg-white border-b border-slate-100 flex items-center justify-between">
      <div
        v-if="currentLevel === 'children' && selectedParent"
        class="flex items-center gap-2 cursor-pointer hover:text-blue-500"
        @click="goBack"
      >
        <ChevronLeft :size="18" />
        <span class="font-medium">返回</span>
      </div>
      <div class="text-slate-700 font-bold text-center flex-1 text-lg">
        {{ currentLevel === 'children' && selectedParent ? selectedParent.name : '组件库' }}
      </div>
      <div v-if="currentLevel === 'children'" class="w-14"></div>
    </div>

    <!-- 父级列表 -->
    <div v-if="currentLevel === 'parent'" class="flex-1 overflow-y-auto p-4 bg-white/90">
      <div class="space-y-3">
        <div
          v-for="(item, index) in nodeTypesList"
          :key="index"
          @click="showChildren(item)"
          class="group cursor-pointer rounded-xl border border-slate-200 hover:shadow-lg"
          :class="getHoverClasses(item.color)"
        >
          <div class="rounded-xl p-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 rounded-lg flex items-center justify-center"
                  :class="getIconClasses(item.color)"
                >
                  <component
                    v-if="item.icon"
                    :size="18"
                    :class="getTextColor(item.color)"
                    :is="getIconComponent(item.icon)"
                  />
                </div>
                <div class="flex-1">
                  <div
                    class="text-sm font-semibold text-slate-800"
                    :class="getHoverTextColor(item.color)"
                  >
                    {{ item.name }}
                  </div>
                  <div
                    v-if="item.description"
                    class="text-xs text-slate-500 mt-1 leading-relaxed"
                    :class="getHoverTextColor(item.color)"
                  >
                    {{ item.description }}
                  </div>
                </div>
              </div>
              <ChevronRight
                :size="16"
                class="text-slate-400"
                :class="getHoverTextColor(item.color)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 子级列表 -->
    <div v-if="currentLevel === 'children' && selectedParent" class="flex-1 overflow-y-auto p-4">
      <div class="space-y-2">
        <div
          v-for="(child, childIndex) in selectedParent.children"
          :key="childIndex"
          draggable="true"
          @dragstart="onDragStart($event, child)"
          class="group bg-white/90 rounded-xl p-3 border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-lg"
          :class="getChildHoverClasses(child.color)"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-lg flex items-center justify-center"
              :class="getChildIconClasses(child.color)"
            >
              <component
                v-if="child.icon"
                :size="20"
                :class="getTextColor(child.color)"
                :is="getIconComponent(child.icon)"
              />
            </div>
            <div class="flex-1">
              <div
                class="text-sm font-semibold text-slate-800"
                :class="getHoverTextColor(child.color)"
              >
                {{ child.name }}
              </div>
              <div
                v-if="child.description"
                class="text-xs text-slate-500 mt-1 leading-relaxed"
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
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { nodeTypesList } from '@/components/Workflow/Nodes/nodeTypes'
import { ChevronRight, ChevronLeft } from 'lucide-vue-next'
import {
  getIconComponent,
  getHoverClasses,
  getIconClasses,
  getTextColor,
  getHoverTextColor,
  getChildHoverClasses,
  getChildIconClasses,
} from '@/components/Workflow/Nodes/nodeConfig'
// 定义事件
const emit = defineEmits<{
  dragStart: [event: DragEvent, type: string]
}>()

// 状态管理
const currentLevel = ref<'parent' | 'children'>('parent')
const selectedParent = ref<any>(null)

// 显示子级列表
const showChildren = (item: any) => {
  selectedParent.value = item
  currentLevel.value = 'children'
}

// 返回父级列表
const goBack = () => {
  currentLevel.value = 'parent'
  selectedParent.value = null
}

// 拖拽开始事件
const onDragStart = (event: DragEvent, item: any) => {
  emit('dragStart', event, item.type)
}
</script>

<style scoped>
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

/* 拖拽时的样式 */
.group:active {
  cursor: grabbing;
  transform: scale(0.98);
}

/* 玻璃拟态效果增强 */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
}

/* 动画延迟 */
.group:hover .transition-all {
  transition-delay: 0.05s;
}
</style>
