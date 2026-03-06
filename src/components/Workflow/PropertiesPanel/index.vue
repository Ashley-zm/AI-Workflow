<template>
  <div class="h-[90vh] flex flex-col bg-white rounded-lg">
    <div class="flex items-center justify-between p-4 border-b border-gray-200">
      <div class="flex items-center justify-center gap-2">
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center"
          :class="getChildIconClasses(nodeColor)"
        >
          <component
            :size="18"
            :class="getTextColor(nodeColor)"
            :is="getIconComponent(nodeType?.icon || 'BotIcon')"
          />
        </div>
        <h3 class="font-bold text-gray-800">{{ currentNode?.type }}配置</h3>
      </div>
      <X
        :size="28"
        @click="store.setSelectedNode(null)"
        class="text-slate-500 cursor-pointer hover:bg-gray-100 p-1 rounded-full"
      />
    </div>

    <div class="flex-1 overflow-y-auto p-4" v-if="currentNode">
      <p class="text-xs text-gray-500 mb-2">提示：在画布上编辑的内容会实时自动保存。</p>
      <div
        class="mb-6 p-3 bg-blue-50 rounded-lg text-xs text-blue-600 font-mono overflow-hidden text-ellipsis"
      >
        ID: {{ currentNode.id }}
      </div>

      <template
        v-if="
          currentNode.type === 'object_detection_model' ||
          currentNode.type === 'classification_model' ||
          currentNode.type === 'segmentation_model'
        "
      >
        <ObjectDetectionModeProperty
          v-model="currentNode.data.config"
          @update:model-value="updateNodeConfig"
        />
      </template>
      <template v-if="currentNode.type === 'inputs'">
        <InputProperty :nodeId="currentNode.id" @updateProperties="updateInputProperties" />
      </template>
      <template v-if="currentNode.type === 'outputs'">
        <OutputProperty :nodeId="currentNode.id" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import { useWorkflowStore } from '@/stores/workflow'
import ObjectDetectionModeProperty from './Model/ObjectDetectionModeProperty.vue'
import InputProperty from './InputProperty.vue'
import OutputProperty from './OutputProperty.vue'
import { getNodeType } from '@/components/Workflow/config/nodeTypes'
import {
  getIconComponent,
  getTextColor,
  getChildIconClasses,
} from '@/components/Workflow/config/nodeConfig'
const store = useWorkflowStore()

// 使用 computed 获取当前选中的节点，保证响应性
const currentNode = computed(() => store.selectedNode)
const nodeType = computed(() =>
  currentNode.value?.type ? getNodeType(currentNode.value.type) : null,
)
const nodeColor = computed(() => nodeType.value?.color || 'blue')

// 初始化 config 对象，防止读取未定义属性报错
// 在实际项目中，这应该在添加节点时在 store 中完成初始化
if (currentNode.value && !currentNode.value.data.config) {
  if (currentNode.value.type === 'object_detection_model') {
    currentNode.value.data.config = {
      imagePath: '',
      model: '',
      modelInfo: null,
    }
  } else {
    currentNode.value.data.config = { prompt: '', model: 'gpt-3.5-turbo' }
  }
}

// 更新节点配置的方法
const updateNodeConfig = (newConfig: { model: string; prompt: string }) => {
  if (currentNode.value) {
    // 使用 store 的 updateNode 方法，这样会自动记录历史
    store.updateNode(currentNode.value.id, { config: newConfig })
  }
}

// 更新输入节点属性的方法
const updateInputProperties = (properties: any[]) => {
  if (currentNode.value) {
    // 使用 store 的 updateNode 方法，这样会自动记录历史
    store.updateNode(currentNode.value.id, { properties: properties })
  }
}
</script>
