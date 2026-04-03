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

    <!-- 预测值选择 -->
    <div>
      <div class="flex items-center gap-2 mb-3">
        <div class="h-4 w-0.5 rounded-full bg-purple-500"></div>
        <h3 class="text-sm font-semibold text-slate-800">预测值</h3>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="mb-3">
          <label class="block text-xs font-medium text-slate-700 mb-2">
            选择预测值 <span class="text-red-500">*</span>
          </label>
          <el-button
            type="primary"
            size="default"
            @click="showPredictionSelectionDialog = true"
            :disabled="availablePredictionNodes.length === 0"
            class="w-full"
          >
            <el-icon class="mr-2"><Database /></el-icon>
            {{ selectedPredictionPath ? '重新选择预测值' : '选择预测值' }}
          </el-button>
        </div>

        <div
          v-if="availablePredictionNodes.length === 0"
          class="flex items-start gap-2 rounded-lg bg-amber-50 p-3 border border-amber-200"
        >
          <AlertCircle :size="16" class="text-amber-500 mt-0.5 flex-shrink-0" />
          <div class="text-xs text-amber-700">
            <div class="font-medium mb-1">暂无可用预测值</div>
            <div>当前流程中没有包含预测值的节点，请先添加包含预测值的节点。</div>
          </div>
        </div>

        <div
          v-if="selectedPredictionPath"
          class="flex items-center justify-between rounded-lg bg-emerald-50 p-3 border border-emerald-200"
        >
          <div class="flex items-center gap-2">
            <CheckCircle :size="16" class="text-emerald-500" />
            <div class="text-xs text-emerald-700">
              <div class="font-medium">已选择预测值</div>
              <div class="text-emerald-600">{{ selectedPredictionPath }}</div>
            </div>
          </div>
          <button
            class="rounded-lg p-1.5 text-red-500 hover:bg-red-100 transition-colors"
            title="清空选择"
            @click="clearSelectedPrediction"
          >
            <X :size="16" />
          </button>
        </div>

        <div
          v-if="availablePredictionNodes.length > 0 && !selectedPredictionPath"
          class="flex items-center gap-2 rounded-lg bg-blue-50 p-3 border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
          @click="
            selectPredictionProperty(
              availablePredictionNodes[0],
              availablePredictionNodes[0]?.predictionProperties,
            )
          "
        >
          <Zap :size="16" class="text-blue-500" />
          <div class="text-xs text-blue-700">
            <div class="font-medium">快速选择</div>
            <div>
              ${{ availablePredictionNodes[0]?.id }}.{{
                availablePredictionNodes[0]?.predictionProperties?.model_id || '无'
              }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 标签配置 -->
    <div>
      <div class="flex items-center gap-2 mb-3">
        <div class="h-4 w-0.5 rounded-full bg-emerald-500"></div>
        <h3 class="text-sm font-semibold text-slate-800">标签配置</h3>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-2">标签字体大小</label>
            <div class="flex items-center gap-2">
              <el-input-number
                v-model="labelFontSize"
                :min="10"
                :max="30"
                :step="1"
                class="flex-1"
                @change="updateConfig"
              />
              <span class="text-xs text-slate-500">px</span>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-2">标签边框圆角</label>
            <div class="flex items-center gap-2">
              <el-input-number
                v-model="labelBorderRadius"
                :min="0"
                :max="20"
                :step="1"
                class="flex-1"
                @change="updateConfig"
              />
              <span class="text-xs text-slate-500">px</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-2">标签字体颜色</label>
            <div class="flex items-center gap-2">
              <el-color-picker v-model="labelColor" show-alpha @change="updateConfig" />
              <span class="text-xs text-slate-500">{{ labelColor }}</span>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-2">标签背景颜色</label>
            <div class="flex items-center gap-2">
              <el-color-picker v-model="labelBgColor" show-alpha @change="updateConfig" />
              <span class="text-xs text-slate-500">{{ labelBgColor }}</span>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-700 mb-2">标签内边距</label>
          <div class="flex items-center gap-2">
            <el-input-number
              v-model="labelPadding"
              :min="0"
              :max="20"
              :step="1"
              class="flex-1"
              @change="updateConfig"
            />
            <span class="text-xs text-slate-500">px</span>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <label class="text-xs font-medium text-slate-700">显示置信度</label>
          <el-switch v-model="showConfidence" @change="updateConfig" />
        </div>

        <div v-if="showConfidence" class="space-y-4 pt-2 border-t border-slate-200">
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-2">置信度小数位数</label>
            <div class="flex items-center gap-2">
              <el-input-number
                v-model="confidenceDecimals"
                :min="0"
                :max="4"
                :step="1"
                class="flex-1"
                @change="updateConfig"
              />
              <span class="text-xs text-slate-500">位</span>
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
              <div class="h-6 w-6 rounded-md flex items-center justify-center bg-blue-500">
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
              :key="property.name"
              class="flex items-center justify-between rounded-lg bg-slate-50 p-3 cursor-pointer hover:bg-blue-50 transition-colors"
              @click="selectImageProperty(node, property)"
            >
              <div class="flex items-center gap-2">
                <Image :size="16" class="text-slate-400" />
                <div>
                  <div class="text-sm font-medium text-slate-700">{{ property.name }}</div>
                  <div class="text-xs text-slate-400">{{ property.type }}</div>
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

    <!-- 预测值选择对话框 -->
    <el-dialog
      v-model="showPredictionSelectionDialog"
      title="选择预测值"
      width="600px"
      :close-on-click-modal="false"
      class="property-dialog"
    >
      <div v-if="availablePredictionNodes.length === 0" class="text-center py-8">
        <div class="mb-3 flex justify-center">
          <div class="rounded-full bg-slate-100 p-3">
            <Database :size="32" class="text-slate-400" />
          </div>
        </div>
        <p class="text-sm text-slate-500">当前流程中没有包含预测值的节点</p>
        <p class="text-xs text-slate-400 mt-1">请先添加包含预测值的节点</p>
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="node in availablePredictionNodes"
          :key="node.id"
          class="rounded-lg border border-slate-200 p-4 hover:border-blue-300 transition-colors"
        >
          <div class="mb-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="h-6 w-6 rounded-md flex items-center justify-center bg-blue-500">
                <component :is="getNodeTypeIcon(node.type)" :size="12" class="text-white" />
              </div>
              <div>
                <div class="text-sm font-medium text-slate-700">{{ node.id }}</div>
                <div class="text-xs text-slate-400">{{ getNodeTypeLabel(node.type) }}</div>
              </div>
            </div>
          </div>
          <div class="space-y-2">
            <div
              class="flex items-center justify-between rounded-lg bg-slate-50 p-3 cursor-pointer hover:bg-blue-50 transition-colors"
              @click="selectPredictionProperty(node, node.predictionProperties)"
            >
              <div class="flex items-center gap-2">
                <Database :size="16" class="text-slate-400" />
                <div>
                  <div class="text-sm font-medium text-slate-700">
                    {{ node.predictionProperties?.model_id }}
                  </div>
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
        <el-button @click="showPredictionSelectionDialog = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useWorkflowStore } from '@/stores/workflow'
import { Picture, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getNodeTypeIcon, getNodeTypeLabel } from '@/components/Workflow/config/nodeConfig'

import { X, Zap, AlertCircle, CheckCircle, Database, Image } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: any[]
  nodeId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any[]]
}>()

const store = useWorkflowStore()

const showImageSelectionDialog = ref(false)
const showPredictionSelectionDialog = ref(false)
const selectedImagePath = ref('')
const selectedPredictionPath = ref('')
const labelFontSize = ref(14)
const labelColor = ref('#FFFFFF')
const labelBgColor = ref('#FF0000')
const labelBorderRadius = ref(4)
const labelPadding = ref(4)
const showConfidence = ref(true)
const confidenceDecimals = ref(2)

const availableImageNodes = computed(() => {
  return store.nodes
    .filter((node) => {
      const nodeProperties = node.data?.config
      if (!nodeProperties || !Array.isArray(nodeProperties)) return false
      const hasImageProperty = nodeProperties.some((prop: any) => prop.type === 'image')
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

const modelTypes = ['detection_model', 'classification_model', 'segmentation_model']
const availablePredictionNodes = computed(() => {
  return store.nodes
    .filter((node) => {
      const hasPredictionProperty = modelTypes.some(
        (prop: any) => node.type === prop && node.data?.config?.[0]?.model_id,
      )
      return hasPredictionProperty
    })
    .map((node) => {
      return {
        id: node.id,
        type: node.type,
        predictionProperties: node.data?.config[0],
      }
    })
})

const selectImageProperty = (node: any, property: any) => {
  selectedImagePath.value = `$${node.id}.${property.name}`
  showImageSelectionDialog.value = false
  updateConfig()
  ElMessage.success(`已选择图片属性: ${selectedImagePath.value}`)
}

const selectPredictionProperty = (node: any, property: any) => {
  selectedPredictionPath.value = `$${node.id}.${property.model_id}`
  showPredictionSelectionDialog.value = false
  updateConfig()
  ElMessage.success(`已选择预测值: ${selectedPredictionPath.value}`)
}

const clearSelectedImage = () => {
  selectedImagePath.value = ''
  updateConfig()
  ElMessage.info('已清空选中的图片属性')
}

const clearSelectedPrediction = () => {
  selectedPredictionPath.value = ''
  updateConfig()
  ElMessage.info('已清空选中的预测值')
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
    images: selectedImagePath.value,
    predictionPath: selectedPredictionPath.value,
    labelFontSize: labelFontSize.value,
    labelColor: labelColor.value,
    labelBgColor: labelBgColor.value,
    labelBorderRadius: labelBorderRadius.value,
    labelPadding: labelPadding.value,
    showConfidence: showConfidence.value,
    confidenceDecimals: confidenceDecimals.value,
  }
  config.value = [newConfig]
  emit('update:modelValue', config.value)
}

const initializeData = () => {
  if (props.modelValue.length > 0) {
    const {
      images,
      predictionPath,
      labelFontSize: initLabelFontSize,
      labelColor: initLabelColor,
      labelBgColor: initLabelBgColor,
      labelBorderRadius: initLabelBorderRadius,
      labelPadding: initLabelPadding,
      showConfidence: initShowConfidence,
      confidenceDecimals: initConfidenceDecimals,
    } = props.modelValue[0]
    selectedImagePath.value = images || ''
    selectedPredictionPath.value = predictionPath || ''
    labelFontSize.value = initLabelFontSize || 14
    labelColor.value = initLabelColor || '#FFFFFF'
    labelBgColor.value = initLabelBgColor || '#FF0000'
    labelBorderRadius.value = initLabelBorderRadius || 4
    labelPadding.value = initLabelPadding || 4
    showConfidence.value = initShowConfidence !== undefined ? initShowConfidence : true
    confidenceDecimals.value = initConfidenceDecimals || 2
    config.value = props.modelValue
  } else {
    clearData()
  }
}

const clearData = () => {
  selectedImagePath.value = ''
  selectedPredictionPath.value = ''
  labelFontSize.value = 14
  labelColor.value = '#FFFFFF'
  labelBgColor.value = '#FF0000'
  labelBorderRadius.value = 4
  labelPadding.value = 4
  showConfidence.value = true
  confidenceDecimals.value = 2
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
