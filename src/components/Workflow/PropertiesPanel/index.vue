<template>
  <div class="h-[90vh] flex flex-col bg-white rounded-lg">
    <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
      <h3 class="font-bold text-gray-800">{{ currentNode?.type }}配置</h3>
      <XIcon
        class="p-1 text-gray-400 hover:text-gray-600 transition"
        :size="25"
        @click="store.setSelectedNode(null)"
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
import { XIcon } from 'lucide-vue-next'
import { useWorkflowStore } from '@/stores/workflow'
import ObjectDetectionModeProperty from './ObjectDetectionModeProperty.vue'
import InputProperty from './InputProperty.vue'
import OutputProperty from './OutputProperty.vue'

const store = useWorkflowStore()

// 使用 computed 获取当前选中的节点，保证响应性
const currentNode = computed(() => store.selectedNode)

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
