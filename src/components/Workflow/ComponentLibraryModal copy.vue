<template>
  <!-- <Teleport to="body"> -->
  <!-- draggable -->
  <el-dialog
    v-model="visible"
    overflow
    :modal="false"
    width="400px"
    max-height="600px"
    title="选择节点类型"
    class="absolute bg-white rounded-xl shadow-2xl"
    :style="{
      transform: `translate(${left}px, ${top}px)`,
    }"
    @close="close"
  >
    <!-- 组件列表 -->
    <div class="p-4 overflow-y-auto max-h-[60vh]">
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
        class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        取消
      </button>
    </div>
  </el-dialog>
  <!-- </Teleport> -->
</template>

<script setup lang="ts">
import { ref } from 'vue'
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
  // 希望弹框是在当前点击位置的左侧,通过transform实现
  // 点击位置在页面的坐标，需要转换为弹窗的位置
  // 弹窗位置 = 点击位置 - 弹窗宽度/2
  // 弹窗位置 = 点击位置 - 弹窗高度/2
  const dialogWidth = 400
  const dialogHeight = 600
  top.value = y - dialogHeight / 2
  left.value = (x - dialogWidth / 2) / 2 + 150
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
