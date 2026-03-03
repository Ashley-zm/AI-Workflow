<template>
  <div class="space-y-6">
    <!-- 图片属性选择 -->
    <div>
      <h3 class="text-sm font-medium text-gray-900 mb-3">图片属性</h3>
      <div class="space-y-3">
        <div class="border border-gray-200 rounded-lg p-4">
          <div class="mb-3">
            <label class="block text-xs font-medium text-gray-700 mb-2">
              选择图片属性 <span class="text-red-500">*</span>
            </label>
            <el-button
              type="primary"
              size="small"
              @click="showImageSelectionDialog = true"
              :disabled="availableImageNodes.length === 0"
            >
              <el-icon class="mr-1"><Picture /></el-icon>
              {{ selectedImagePath ? '重新选择' : '选择图片' }}
            </el-button>
            <!-- 增加说明：当前流程中没有包含图片属性的节点 -->
            <div
              v-if="availableImageNodes.length === 0"
              class="flex items-center text-xs text-gray-500 mt-2"
            >
              <CircleAlert class="mr-1" />
              当前流程中没有包含图片属性的节点。请先添加包含图片属性的节点。
            </div>
            <div
              v-if="selectedImagePath"
              class="flex items-center justify-between mt-2 text-xs text-green-600 bg-green-50 p-2 rounded"
            >
              <div>
                <el-icon class="mr-1"><Check /></el-icon>
                已选择: {{ selectedImagePath }}
              </div>
              <X
                class="inline-block cursor-pointer text-red-500 hover:bg-red-100 rounded-full"
                @click="clearSelectedImage"
                :size="16"
              />
            </div>
            <div
              v-if="availableImageNodes.length > 0 && !selectedImagePath"
              @click="
                selectImageProperty(
                  availableImageNodes[0],
                  availableImageNodes[0]?.imageProperties[0],
                )
              "
            >
              <el-tag class="text-xs text-gray-600 mt-2 cursor-pointer" type="primary">
                <div class="flex items-center text-[#155dfc]">
                  <Zap class="rounded-full p-1" />
                  ${{
                    availableImageNodes[0]?.id +
                      '.' +
                      availableImageNodes[0]?.imageProperties?.[0]?.name || '无'
                  }}
                </div>
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模型配置 -->
    <div>
      <h3 class="text-sm font-medium text-gray-900 mb-3">模型配置</h3>
      <div class="space-y-3">
        <div class="border border-gray-200 rounded-lg p-4">
          <div class="mb-3">
            <label class="block text-xs font-medium text-gray-700 mb-2">
              选择模型 <span class="text-red-500">*</span>
            </label>
            <el-select
              v-model="selectedModel"
              size="small"
              placeholder="请选择模型"
              @change="onModelSelect"
              class="w-full"
            >
              <el-option
                v-for="model in mockModels"
                :key="model.id"
                :label="model.name"
                :value="model.id"
              >
                <div class="flex items-center justify-between">
                  <span>{{ model.name }}</span>
                  <el-tag size="small" :type="model.type === 'detection' ? 'primary' : 'info'">
                    {{ model.type }}
                  </el-tag>
                </div>
              </el-option>
            </el-select>
          </div>

          <!-- 模型基础信息显示 -->
          <div v-if="selectedModelInfo" class="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-2">模型信息</h4>
            <div class="space-y-2 text-xs text-gray-600">
              <div><strong>模型名称:</strong> {{ selectedModelInfo.name }}</div>
              <div><strong>模型类型:</strong> {{ selectedModelInfo.type }}</div>
              <div><strong>版本:</strong> {{ selectedModelInfo.version }}</div>
              <div><strong>描述:</strong> {{ selectedModelInfo.description }}</div>
              <div v-if="selectedModelInfo.config">
                <strong>可配置参数:</strong>
                <div class="mt-1 space-y-1">
                  <div v-for="(param, key) in selectedModelInfo.config" :key="key" class="ml-2">
                    • {{ param.name }} ({{ param.type }}):
                    <div class="flex">
                      <span>描述：</span>
                      {{ param.description }}
                    </div>

                    <div class="flex items-center justify-between mt-1">
                      <div class="w-16 text-right">默认值：</div>
                      <el-input v-model="param.default" size="small" @input="updateConfig" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- JSON预览 -->
    <div class="p-2">
      <h3 class="text-sm font-medium text-gray-900 mb-3">JSON预览</h3>
      <!-- 该节点的json字符串 -->
      <div class="bg-gray-50 p-2 rounded-md text-xs">
        <pre class="whitespace-pre-wrap">{{ JSON.stringify(properties, null, 2) }}</pre>
      </div>
    </div>

    <!-- 图片选择对话框 -->
    <el-dialog
      v-model="showImageSelectionDialog"
      title="选择图片属性"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="space-y-4">
        <div v-if="availableImageNodes.length === 0" class="text-center text-gray-500 py-8">
          <el-icon size="48" class="mb-2"><Picture /></el-icon>
          <p>当前流程中没有包含图片属性的节点</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="node in availableImageNodes"
            :key="node.id"
            class="border border-gray-200 rounded-lg p-3"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <el-tag size="small" :type="getNodeTypeColor(node.type)">
                  {{ getNodeTypeLabel(node.type) }}
                </el-tag>
                <span class="text-sm font-medium">{{ node.id }}</span>
              </div>
            </div>

            <div class="space-y-2">
              <div
                v-for="property in node.imageProperties"
                :key="property.name"
                class="flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer hover:bg-blue-50 transition-colors"
                @click="selectImageProperty(node, property)"
              >
                <div class="flex items-center gap-2">
                  <el-icon size="16"><Picture /></el-icon>
                  <span class="text-sm">{{ property.name }}</span>
                  <el-tag size="mini" type="info">{{ property.type }}</el-tag>
                </div>
                <el-button type="text" size="small"> 选择 </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="showImageSelectionDialog = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useWorkflowStore } from '@/stores/workflow'
import { Picture, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { X, Zap, CircleAlert } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: any
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

const store = useWorkflowStore()

// 状态管理
const showImageSelectionDialog = ref(false)
const selectedImagePath = ref('')
const selectedModel = ref('')

// 模拟模型数据
const mockModels = ref([
  {
    id: 'yolov8n',
    name: 'YOLOv8 Nano',
    type: 'detection',
    version: 'v8.0.0',
    description: '轻量级目标检测模型，适合实时检测场景',
    config: {
      confidence: {
        name: '置信度阈值',
        type: 'number',
        description: '目标检测的置信度阈值，范围0-1',
        default: 0.5,
      },
      iou_threshold: {
        name: 'IOU阈值',
        type: 'number',
        description: '非极大值抑制的IOU阈值',
        default: 0.45,
      },
    },
  },
  {
    id: 'yolov8s',
    name: 'YOLOv8 Small',
    type: 'detection',
    version: 'v8.0.0',
    description: '小型目标检测模型，平衡精度和速度',
    config: {
      confidence: {
        name: '置信度阈值',
        type: 'number',
        description: '目标检测的置信度阈值，范围0-1',
        default: 0.5,
      },
      iou_threshold: {
        name: 'IOU阈值',
        type: 'number',
        description: '非极大值抑制的IOU阈值',
        default: 0.45,
      },
    },
  },
  {
    id: 'yolov8m',
    name: 'YOLOv8 Medium',
    type: 'detection',
    version: 'v8.0.0',
    description: '中型目标检测模型，更高的检测精度',
    config: {
      confidence: {
        name: '置信度阈值',
        type: 'number',
        description: '目标检测的置信度阈值，范围0-1',
        default: 0.5,
      },
      iou_threshold: {
        name: 'IOU阈值',
        type: 'number',
        description: '非极大值抑制的IOU阈值',
        default: 0.45,
      },
    },
  },
  {
    id: 'yolov8l',
    name: 'YOLOv8 Large',
    type: 'detection',
    version: 'v8.0.0',
    description: '大型目标检测模型，最高的检测精度',
    config: {
      confidence: {
        name: '置信度阈值',
        type: 'number',
        description: '目标检测的置信度阈值，范围0-1',
        default: 0.5,
      },
      iou_threshold: {
        name: 'IOU阈值',
        type: 'number',
        description: '非极大值抑制的IOU阈值',
        default: 0.45,
      },
    },
  },
])

// 计算可用图片节点
const availableImageNodes = computed(() => {
  return store.nodes
    .filter((node) => {
      // 检查节点是否有properties属性
      if (!node.data?.properties) return false

      // 检查是否有image类型的属性
      const hasImageProperty = node.data.properties.some((prop: any) => prop.type === 'image')
      return hasImageProperty
    })
    .map((node) => ({
      id: node.id,
      type: node.type,
      imageProperties: node.data.properties.filter((prop: any) => prop.type === 'image'),
    }))
})

// 选中的模型信息
// const selectedModelInfo = computed(() => {
//   if (!selectedModel.value) return null
//   return mockModels.value.find((model) => model.id === selectedModel.value)
// })
const selectedModelInfo = ref<any>(null)
// 获取节点类型标签
const getNodeTypeLabel = (type: string | undefined) => {
  if (!type) return ''
  const typeMap: Record<string, string> = {
    inputs: '输入',
    outputs: '输出',
    model: '模型',
    processing: '处理',
  }
  return typeMap[type] || type
}

// 获取节点类型颜色
const getNodeTypeColor = (type: string | undefined) => {
  if (!type) return 'info'
  const colorMap: Record<string, string> = {
    inputs: 'success',
    outputs: 'warning',
    model: 'primary',
    processing: 'info',
  }
  return colorMap[type] || 'info'
}

// 选择图片属性
const selectImageProperty = (node: any, property: any) => {
  selectedImagePath.value = `$${node.id}.${property.name}`
  showImageSelectionDialog.value = false
  updateConfig()
  ElMessage.success(`已选择图片属性: ${selectedImagePath.value}`)
}

// 模型选择处理
const onModelSelect = () => {
  selectedModelInfo.value = mockModels.value.find((model) => model.id === selectedModel.value)
  updateConfig()
  if (selectedModelInfo.value) {
    ElMessage.success(`已选择模型: ${selectedModelInfo.value.name}`)
  }
}

// 清空选中的图片属性
const clearSelectedImage = () => {
  selectedImagePath.value = ''
  updateConfig()
  ElMessage.info('已清空选中的图片属性')
}

// 配置属性
const properties = ref({})
// 更新配置
const updateConfig = () => {
  const config = {
    imagePath: selectedImagePath.value,
    model: selectedModel.value,
    modelInfo: selectedModelInfo.value,
  }
  properties.value = config
  emit('update:modelValue', config)
}

// 初始化数据
const initializeData = () => {
  if (props.modelValue) {
    selectedImagePath.value = props.modelValue.imagePath || ''
    selectedModel.value = props.modelValue.model || ''
    selectedModelInfo.value = props.modelValue.modelInfo || null
    properties.value = {
      imagePath: selectedImagePath.value,
      model: selectedModel.value,
      modelInfo: selectedModelInfo.value,
    }
  }
}

// 监听数据变化
watch(() => props.modelValue, initializeData, { immediate: true })

onMounted(() => {
  initializeData()
})
</script>
