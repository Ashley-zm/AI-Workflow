<template>
  <div class="space-y-6">
    <!-- 图片属性选择 -->
    <div>
      <div class="flex items-center gap-2 mb-3">
        <div class="h-4 w-0.5 rounded-full bg-blue-500"></div>
        <h3 class="text-sm font-semibold text-slate-800">图片属性</h3>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="mb-3">
          <label class="block text-xs font-medium text-slate-700 mb-2">
            选择图片属性 <span class="text-red-500">*</span>
          </label>
          <el-button
            type="primary"
            size="default"
            @click="showImageSelectionDialog = true"
            :disabled="availableImageNodes.length === 0"
            class="w-full"
          >
            <el-icon class="mr-2"><Picture /></el-icon>
            {{ selectedImagePath ? '重新选择图片' : '选择图片属性' }}
          </el-button>
        </div>

        <div
          v-if="availableImageNodes.length === 0"
          class="flex items-start gap-2 rounded-lg bg-amber-50 p-3 border border-amber-200"
        >
          <AlertCircle :size="16" class="text-amber-500 mt-0.5 flex-shrink-0" />
          <div class="text-xs text-amber-700">
            <div class="font-medium mb-1">暂无可用图片属性</div>
            <div>当前流程中没有包含图片属性的节点，请先添加包含图片属性的节点。</div>
          </div>
        </div>

        <div
          v-if="selectedImagePath"
          class="flex items-center justify-between rounded-lg bg-emerald-50 p-3 border border-emerald-200"
        >
          <div class="flex items-center gap-2">
            <CheckCircle :size="16" class="text-emerald-500" />
            <div class="text-xs text-emerald-700">
              <div class="font-medium">已选择图片属性</div>
              <div class="text-emerald-600">{{ selectedImagePath }}</div>
            </div>
          </div>
          <button
            class="rounded-lg p-1.5 text-red-500 hover:bg-red-100 transition-colors"
            title="清空选择"
            @click="clearSelectedImage"
          >
            <X :size="16" />
          </button>
        </div>

        <div
          v-if="availableImageNodes.length > 0 && !selectedImagePath"
          class="flex items-center gap-2 rounded-lg bg-blue-50 p-3 border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
          @click="
            selectImageProperty(availableImageNodes[0], availableImageNodes[0]?.imageProperties[0])
          "
        >
          <Zap :size="16" class="text-blue-500" />
          <div class="text-xs text-blue-700">
            <div class="font-medium">快速选择</div>
            <div>
              ${{ availableImageNodes[0]?.id }}.{{
                availableImageNodes[0]?.imageProperties?.[0]?.name || '无'
              }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模型配置 -->
    <div>
      <div class="flex items-center gap-2 mb-3">
        <div class="h-4 w-0.5 rounded-full bg-purple-500"></div>
        <h3 class="text-sm font-semibold text-slate-800">模型配置</h3>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="mb-4">
          <label class="block text-xs font-medium text-slate-700 mb-2">
            选择模型 <span class="text-red-500">*</span>
          </label>
          <el-select
            v-model="selectedModel"
            size="default"
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
                <div class="flex items-center gap-2">
                  <div class="h-6 w-6 rounded-md flex items-center justify-center bg-blue-500">
                    <Brain :size="12" class="text-white" />
                  </div>
                  <span class="text-sm font-medium">{{ model.name }}</span>
                </div>
                <el-tag size="small">
                  {{ model.type }}
                </el-tag>
              </div>
            </el-option>
          </el-select>
        </div>

        <div v-if="selectedModelInfo" class="rounded-lg bg-slate-50 p-4 border border-slate-200">
          <div class="mb-3 flex items-center justify-between">
            <h4 class="text-sm font-semibold text-slate-800">模型信息</h4>
            <button
              class="text-xs text-blue-500 hover:text-blue-700 transition-colors"
              @click="copyModelInfo"
            >
              复制信息
            </button>
          </div>
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="rounded-lg bg-white p-2.5 border border-slate-200">
              <div class="text-[10px] text-slate-400">模型名称</div>
              <div class="text-xs font-medium text-slate-600 truncate">
                {{ selectedModelInfo.name }}
              </div>
            </div>
            <div class="rounded-lg bg-white p-2.5 border border-slate-200">
              <div class="text-[10px] text-slate-400">模型类型</div>
              <div class="text-xs font-medium text-slate-600 truncate">
                {{ selectedModelInfo.type }}
              </div>
            </div>
            <div class="rounded-lg bg-white p-2.5 border border-slate-200">
              <div class="text-[10px] text-slate-400">版本</div>
              <div class="text-xs font-medium text-slate-600 truncate">
                {{ selectedModelInfo.version }}
              </div>
            </div>
            <div class="rounded-lg bg-white p-2.5 border border-slate-200">
              <div class="text-[10px] text-slate-400">参数数量</div>
              <div class="text-xs font-medium text-slate-600 truncate">
                {{ selectedModelInfo.config ? Object.keys(selectedModelInfo.config).length : 0 }}
              </div>
            </div>
          </div>
          <div class="mb-2">
            <div class="text-[10px] text-slate-400 mb-1">描述</div>
            <div class="text-xs text-slate-600">{{ selectedModelInfo.description }}</div>
          </div>
          <div v-if="selectedModelInfo.config" class="mt-3">
            <div class="text-[10px] text-slate-400 mb-2">可配置参数</div>
            <div class="space-y-2">
              <div
                v-for="(param, key) in selectedModelInfo.config"
                :key="key"
                class="rounded-lg bg-white p-3 border border-slate-200"
              >
                <div class="mb-2 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="h-5 w-5 rounded-md flex items-center justify-center bg-slate-500">
                      <component :is="getParamTypeIcon(param.type)" :size="10" class="text-white" />
                    </div>
                    <div>
                      <div class="text-xs font-medium text-slate-700">{{ param.label }}</div>
                      <div class="text-[10px] text-slate-400">{{ param.type }}</div>
                    </div>
                  </div>
                  <button
                    class="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                    @click="resetParam(param)"
                  >
                    重置
                  </button>
                </div>
                <div class="text-xs text-slate-600 mb-2">{{ param.description }}</div>
                <div class="flex items-center gap-2">
                  <div class="text-[10px] text-slate-400">默认值：</div>
                  <el-input
                    v-model="param.defaultValue"
                    size="small"
                    @input="updateConfig"
                    class="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- JSON预览 -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="h-4 w-0.5 rounded-full bg-slate-500"></div>
          <h3 class="text-sm font-semibold text-slate-800">JSON预览</h3>
        </div>
        <button
          class="text-xs text-blue-500 hover:text-blue-700 transition-colors"
          @click="copyJson"
        >
          复制JSON
        </button>
      </div>
      <div class="rounded-lg bg-slate-900 p-4 border border-slate-700">
        <pre class="text-xs text-slate-100 font-mono whitespace-pre-wrap">{{
          JSON.stringify(config, null, 2)
        }}</pre>
      </div>
    </div>

    <!-- 图片选择对话框 -->
    <el-dialog
      v-model="showImageSelectionDialog"
      title="选择图片属性"
      width="600px"
      :close-on-click-modal="false"
      class="property-dialog"
    >
      <div v-if="availableImageNodes.length === 0" class="text-center py-8">
        <div class="mb-3 flex justify-center">
          <div class="rounded-full bg-slate-100 p-3">
            <Picture :size="32" class="text-slate-400" />
          </div>
        </div>
        <p class="text-sm text-slate-500">当前流程中没有包含图片属性的节点</p>
        <p class="text-xs text-slate-400 mt-1">请先添加包含图片属性的节点</p>
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="node in availableImageNodes"
          :key="node.id"
          class="rounded-lg border border-slate-200 p-4 hover:border-blue-300 transition-colors"
        >
          <div class="mb-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="h-6 w-6 rounded-md flex items-center justify-center bg-emerald-500">
                <component :is="getNodeTypeIcon(node.type)" :size="12" class="text-white" />
              </div>
              <div>
                <div class="text-sm font-medium text-slate-700">{{ node.id }}</div>
                <div class="text-xs text-slate-400">{{ getNodeTypeLabel(node.type) }}</div>
              </div>
            </div>
            <el-tag size="small" type="info">{{ node.imageProperties.length }} 个图片属性</el-tag>
          </div>
          <div class="space-y-2">
            <div
              v-for="property in node.imageProperties"
              :key="property.label"
              class="flex items-center justify-between rounded-lg bg-slate-50 p-3 cursor-pointer hover:bg-blue-50 transition-colors"
              @click="selectImageProperty(node, property)"
            >
              <div class="flex items-center gap-2">
                <Image :size="16" class="text-slate-400" />
                <div>
                  <div class="text-sm font-medium text-slate-700">{{ property.name }}</div>
                  <div class="text-xs text-slate-400">{{ property.valueType }}</div>
                </div>
              </div>
              <div class="flex items-center gap-1 text-blue-500">
                <Check :size="14" />
                <span class="text-xs">选择</span>
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
import { getNodeTypeIcon, getParamTypeIcon } from '@/components/Workflow/config/nodeConfig'
import { X, Zap, AlertCircle, CheckCircle, Brain, Image } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: any[]
  nodeId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any[]]
}>()

const store = useWorkflowStore()

const showImageSelectionDialog = ref(false)
const selectedImagePath = ref('')
const selectedModel = ref('')

const mockModels = ref([
  {
    id: 'yolov8n',
    name: 'YOLOv8 Nano',
    type: 'detection',
    version: 'v8.0.0',
    description: '轻量级目标检测模型，适合实时检测场景',
    config: [
      {
        name: 'confidence',
        label: '置信度阈值',
        valueType: 'number',
        description: '目标检测的置信度阈值，范围0-1',
        defaultValue: 0.5,
      },
      {
        name: 'iou_threshold',
        label: 'IOU阈值',
        valueType: 'number',
        description: '非极大值抑制的IOU阈值',
        defaultValue: 0.45,
      },
    ],
  },
  {
    id: 'yolov8s',
    name: 'YOLOv8 Small',
    type: 'detection',
    version: 'v8.0.0',
    description: '小型目标检测模型，平衡精度和速度',
    config: [
      {
        name: 'confidence',
        label: '置信度阈值',
        valueType: 'number',
        description: '目标检测的置信度阈值，范围0-1',
        defaultValue: 0.5,
      },
      {
        name: 'iou_threshold',
        label: 'IOU阈值',
        valueType: 'number',
        description: '非极大值抑制的IOU阈值',
        defaultValue: 0.45,
      },
    ],
  },
  {
    id: 'yolov8m',
    name: 'YOLOv8 Medium',
    type: 'detection',
    version: 'v8.0.0',
    description: '中型目标检测模型，更高的检测精度',
    config: [
      {
        name: 'confidence',
        label: '置信度阈值',
        valueType: 'number',
        description: '目标检测的置信度阈值，范围0-1',
        defaultValue: 0.5,
      },
      {
        name: 'iou_threshold',
        label: 'IOU阈值',
        valueType: 'number',
        description: '非极大值抑制的IOU阈值',
        defaultValue: 0.45,
      },
    ],
  },
  {
    id: 'yolov8l',
    name: 'YOLOv8 Large',
    type: 'detection',
    version: 'v8.0.0',
    description: '大型目标检测模型，最高的检测精度',
    config: [
      {
        name: 'confidence',
        label: '置信度阈值',
        valueType: 'number',
        description: '目标检测的置信度阈值，范围0-1',
        defaultValue: 0.5,
      },
      {
        name: 'iou_threshold',
        label: 'IOU阈值',
        valueType: 'number',
        description: '非极大值抑制的IOU阈值',
        defaultValue: 0.45,
      },
    ],
  },
])

const availableImageNodes = computed(() => {
  return store.nodes
    .filter((node) => {
      const nodeProperties = node.data?.config
      if (!nodeProperties || !Array.isArray(nodeProperties)) return false
      const hasImageProperty = node.data?.config.some((prop: any) => prop.type === 'image')
      return hasImageProperty
    })
    .map((node) => {
      const nodeProperties = node.data?.config
      return {
        id: node.id,
        type: node.type,
        imageProperties: nodeProperties.filter((prop: any) => prop.type === 'image'),
      }
    })
})

const selectedModelInfo = ref<any>(null)

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
const selectImageProperty = (node: any, property: any) => {
  selectedImagePath.value = `$${node.id}.${property.name}`
  showImageSelectionDialog.value = false
  updateConfig()
  ElMessage.success(`已选择图片属性: ${selectedImagePath.value}`)
}

const onModelSelect = () => {
  selectedModelInfo.value = mockModels.value.find((model) => model.id === selectedModel.value)
  updateConfig()
  if (selectedModelInfo.value) {
    ElMessage.success(`已选择模型: ${selectedModelInfo.value.name}`)
  }
}

const clearSelectedImage = () => {
  selectedImagePath.value = ''
  updateConfig()
  ElMessage.info('已清空选中的图片属性')
}

const resetParam = (param: any) => {
  const model = mockModels.value.find((m) => m.id === selectedModel.value)
  if (model && model.config) {
    const originalParam = Object.values(model.config).find((p: any) => p.name === param.name)
    if (originalParam) {
      param.defaultValue = originalParam.defaultValue
      updateConfig()
      ElMessage.success(`已重置参数: ${param.name}`)
    }
  }
}

const copyModelInfo = () => {
  const info = JSON.stringify(selectedModelInfo.value, null, 2)
  navigator.clipboard
    .writeText(info)
    .then(() => {
      ElMessage.success('已复制模型信息')
    })
    .catch(() => {
      ElMessage.error('复制失败')
    })
}

const copyJson = () => {
  const json = JSON.stringify(config.value, null, 2)
  navigator.clipboard
    .writeText(json)
    .then(() => {
      ElMessage.success('已复制JSON')
    })
    .catch(() => {
      ElMessage.error('复制失败')
    })
}

const config = ref<any[]>([])
const updateConfig = () => {
  let newConfig: Record<string, any> = {
    imagePath: selectedImagePath.value,
    model_id: selectedModel.value,
    model_name: selectedModelInfo.value?.name || '',
    outputInfo: ['predictions'],
  }
  if (selectedModelInfo.value?.config) {
    selectedModelInfo.value.config.forEach((param: any) => {
      newConfig[param.name] = param.defaultValue
    })
  }
  config.value = [newConfig]
  emit('update:modelValue', config.value)
}
// 初始化数据
const initializeData = () => {
  if (props.modelValue.length > 0) {
    selectedImagePath.value = props.modelValue[0].imagePath || ''
    selectedModel.value = props.modelValue[0].model_id || ''
    selectedModelInfo.value = mockModels.value.find((model) => model.id === selectedModel.value)
    config.value = props.modelValue
    const noFilter = ['imagePath', 'model_id', 'model_name', 'outputInfo']
    if (selectedModelInfo.value?.config) {
      props.modelValue.forEach((item: any) => {
        if (!noFilter.includes(item.name)) {
          const param = selectedModelInfo.value.config.find((p: any) => p.name === item.name)
          if (param) {
            param.defaultValue = item.value
          }
        }
      })
    }
  } else {
    clearData()
  }
}
const clearData = () => {
  selectedImagePath.value = ''
  selectedModel.value = ''
  selectedModelInfo.value = null
  config.value = []
}

watch(() => props.modelValue, initializeData, { immediate: true })

onMounted(() => {
  initializeData()
})
</script>

<style>
.property-dialog .el-dialog__header {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.property-dialog .el-dialog__body {
  padding: 20px;
}

.property-dialog .el-dialog__footer {
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
}
</style>
