<!-- 所有节点选择器 -->
<template>
  <div class="min-w-[250px] border-r border-slate-200 flex flex-col shadow-lg">
    <!-- 顶部标题和返回按钮 -->
    <div class="p-5 bg-white border-b border-slate-100 flex items-center justify-between">
      <div
        v-if="currentLevel === 'children' && selectedParent"
        class="flex items-center gap-2 text-slate-500 cursor-pointer hover:text-blue-500"
        @click="goBack"
      >
        <ChevronLeft :size="18" />
        <span class="font-medium">返回</span>
      </div>
      <div class="text-slate-700 font-bold text-center flex-1 text-lg">
        {{ currentLevel === 'children' && selectedParent ? selectedParent.name : '选择工作流节点' }}
      </div>

      <X
        :size="28"
        @click="emit('closeBar')"
        class="text-slate-500 cursor-pointer hover:bg-gray-100 p-1 rounded-full"
      />
    </div>

    <!-- 父级列表 -->
    <div v-if="currentLevel === 'parent'" class="flex-1 overflow-y-auto p-4 bg-white/90">
      <div class="space-y-3">
        <div
          v-for="(item, index) in nodeTypesList.filter((item) => item.canSelecte)"
          :key="index"
          @click="showChildren(item)"
          class="group cursor-pointer rounded-xl border border-slate-200 hover:shadow-lg"
          :class="`border-${item.color}-600 hover:border-${item.color}-500`"
        >
          <div class="rounded-xl p-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 rounded-lg flex items-center justify-center"
                  :class="`bg-${item.color}-50 text-${item.color}-600`"
                >
                  <component v-if="item.icon" :size="18" :is="getIconComponent(item.icon)" />
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
          :class="`border-${child.color}-600 hover:border-${child.color}-500`"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-lg flex items-center justify-center"
              :class="`bg-${child.color}-50 text-${child.color}-600`"
            >
              <component v-if="child.icon" :size="20" :is="getIconComponent(child.icon)" />
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
import { X } from 'lucide-vue-next'
import { ref } from 'vue'
import { nodeTypesList } from '@/components/Workflow/config/nodeTypes'
import { ChevronRight, ChevronLeft } from 'lucide-vue-next'
import { getIconComponent, getHoverTextColor } from '@/components/Workflow/config/nodeConfig'
// 定义事件
const emit = defineEmits<{
  dragStart: [event: DragEvent, type: string]
  closeBar: []
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
  console.log('拖拽开始11:', event, item.type)
  emit('dragStart', event, item)
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
