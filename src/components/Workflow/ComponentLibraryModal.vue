<template>
  <div
    v-if="visible"
    class="absolute bg-white w-[400px] max-h-[600px] shadow-2xl rounded-xl"
    :style="{
      top: `${top}px`,
      left: `${left}px`,
    }"
  >
    <!-- 组件列表 -->
    <div class="p-4 overflow-y-auto max-h-[60vh]">
      <div class="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
        <h3 class="text-lg font-bold text-gray-800">选择添加节点</h3>
        <X :size="22" @click="close" class="cursor-pointer hover:bg-gray-100 p-1 rounded-full" />
      </div>
      <div class="grid grid-cols-1 gap-3">
        <div v-for="(item, index) in nodeTypesList" :key="index" class="space-y-2">
          <h4 class="text-sm font-medium text-gray-700 mb-2">{{ item.name }}</h4>
          <div
            v-for="(child, childIndex) in item.children"
            :key="childIndex"
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

    <!-- 底部按钮 -->
    <div class="p-4 border-t border-gray-200 flex justify-end gap-2">
      <button
        @click="close"
        class="cursor-pointer px-4 py-1 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        关闭
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import { nodeTypesList } from '@/components/Workflow/Nodes/nodeTypes'
import {
  getIconComponent,
  getTextColor,
  getHoverTextColor,
  getChildHoverClasses,
  getChildIconClasses,
} from '@/components/Workflow/Nodes/nodeConfig'

const emit = defineEmits<{
  selectComponent: [componentType: string, sourceHandle?: any]
}>()

const visible = ref(false)
const sourceHandle = ref<any>(null)
const sourceNodeId = ref<string>('')
const top = ref<number>(0)
const left = ref<number>(0)

// 显示弹窗
const show = (handle: any, nodeId: string, x: number, y: number) => {
  sourceHandle.value = handle
  sourceNodeId.value = nodeId
  top.value = y > 150 ? y - 150 : y
  left.value = x + 160
  console.log('弹窗位置:', top.value, left.value)
  visible.value = true
}

// 关闭弹窗
const close = () => {
  visible.value = false
  sourceHandle.value = null
  sourceNodeId.value = ''
}

// 选择组件
const selectComponent = (component: any) => {
  emit('selectComponent', component.type, {
    handle: sourceHandle.value,
    sourceNodeId: sourceNodeId.value,
  })
  close()
}

// 暴露方法给父组件
defineExpose({
  show,
  close,
})
</script>
