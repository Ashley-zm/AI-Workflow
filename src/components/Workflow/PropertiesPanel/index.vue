<template>
  <div class="flex flex-col bg-white rounded-lg">
    <div class="flex items-center justify-between p-4 border-b border-gray-200">
      <div class="flex items-center justify-center gap-2">
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center"
          :class="`bg-${nodeColor}-50 text-${nodeColor}-600`"
        >
          <component :size="18" :is="getIconComponent(nodeObj?.icon || 'BotIcon')" />
        </div>
        <div>
          <h3 class="font-bold text-gray-800">{{ currentNode?.name }}配置</h3>
          <span class="text-xs text-gray-500">{{ currentNode?.type }}</span>
        </div>
      </div>
      <X
        :size="28"
        @click="store.setSelectedNode(null)"
        class="text-slate-500 cursor-pointer hover:bg-gray-100 p-1 rounded-full"
      />
    </div>
    <el-scrollbar max-height="calc(100vh - 200px)">
      <div class="flex-1 overflow-y-auto p-4" v-if="currentNode">
        <p class="text-xs text-gray-500 mb-2">提示：在画布上编辑的内容会实时自动保存。</p>
        <div
          class="mb-6 p-3 bg-blue-50 rounded-lg text-xs text-blue-600 font-mono overflow-hidden text-ellipsis"
        >
          Id: {{ currentNode.id }}
        </div>

        <component
          :is="currentPropertyComponent"
          v-if="currentNode.id"
          :modelValue="currentNode.data"
          :nodeObj="nodeObj"
          :nodeId="currentNode.id"
          @update:nodeConfig="updateNodeConfig"
        />
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, onUnmounted } from 'vue'
import { X } from 'lucide-vue-next'
import { useWorkflowStore } from '@/stores/workflow'
import ClassificationModeProperty from './Model/ClassificationModeProperty.vue'
import ObjectDetectionModeProperty from './Model/ObjectDetectionModeProperty.vue'
import BoundingBoxVisualizationProperty from './Visualization/BoundingBoxVisualizationProperty.vue'
import PolygonVisualizationProperty from './Visualization/PolygonVisualizationProperty.vue'
import LabelVisualizationProperty from './Visualization/LabelVisualizationProperty.vue'
import IfElseProperty from './Conditional/IfElseProperty.vue'
import InputProperty from './InputProperty.vue'
import OutputProperty from './OutputProperty.vue'
import { getNodeType } from '@/components/Workflow/config/nodeTypes'
import { getIconComponent } from '@/components/Workflow/config/nodeConfig'
const store = useWorkflowStore()

// 组件映射表
const propertyComponents = {
  'detection_model@v1': markRaw(ObjectDetectionModeProperty),
  'classification_model@v1': markRaw(ClassificationModeProperty),
  segmentation_model: markRaw(ObjectDetectionModeProperty),
  inputs: markRaw(InputProperty),
  outputs: markRaw(OutputProperty),
  'bounding_box_visualization@v1': markRaw(BoundingBoxVisualizationProperty),
  polygon_visualization: markRaw(PolygonVisualizationProperty),
  label_visualization: markRaw(LabelVisualizationProperty),
  'conditional_branch@v1': markRaw(IfElseProperty),
}

// 使用 computed 获取当前选中的节点，保证响应性
const currentNode = computed(() => {
  // console.log('dddd', store.selectedNode)

  return store.selectedNode
})
const nodeObj = computed(() =>
  currentNode.value?.type ? getNodeType(currentNode.value.type) : null,
)
const nodeColor = computed(() => nodeObj.value?.color || 'blue')

// 根据当前节点类型计算对应的属性组件
const currentPropertyComponent = computed(() => {
  if (!currentNode.value) return null
  return propertyComponents[currentNode.value.type as keyof typeof propertyComponents] || null
})

// 更新节点配置的方法
const updateNodeConfig = (newConfig: any) => {
  if (currentNode.value) {
    // 使用 store 的 updateNode 方法，这样会自动记录历史
    store.updateNode(currentNode.value.id, newConfig)
  }
}

onUnmounted(() => {
  if (store.selectedNode) {
    store.setSelectedNode(null)
  }
})
</script>
