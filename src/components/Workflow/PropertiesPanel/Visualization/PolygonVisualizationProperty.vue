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
            {{ data.image ? '重新选择图片' : '选择图片属性' }}
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
          v-if="data.image"
          class="flex items-center justify-between rounded-lg bg-emerald-50 p-3 border border-emerald-200"
        >
          <div class="flex items-center gap-2">
            <CheckCircle :size="16" class="text-emerald-500" />
            <div class="text-xs text-emerald-700">
              <div class="font-medium">已选择图片属性</div>
              <div class="text-emerald-600">{{ data.image }}</div>
            </div>
          </div>
          <!-- <button
            class="rounded-lg p-1.5 text-red-500 hover:bg-red-100 transition-colors"
            title="清空选择"
            @click="clearSelectedImage"
          >
            <X :size="16" />
          </button> -->
        </div>

        <div
          v-if="availableImageNodes.length > 0 && !data.image"
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
            {{ data.predictions ? '重新选择预测值' : '选择预测值' }}
          </el-button>
        </div>

        <div
          v-if="availablePredictionNodes.length === 0"
          class="flex items-start gap-2 rounded-lg bg-amber-50 p-3 border border-amber-200"
        >
          <AlertCircle :size="16" class="text-amber-500 mt-0.5 flex-shrink-0" />
          <div class="text-xs text-amber-700">
            <div class="font-medium mb-1">暂无可用预测值</div>
            <div>请先将当前可视化节点连接到模型节点，再选择预测值。</div>
          </div>
        </div>

        <div
          v-if="data.predictions"
          class="flex items-center justify-between rounded-lg bg-emerald-50 p-3 border border-emerald-200"
        >
          <div class="flex items-center gap-2">
            <CheckCircle :size="16" class="text-emerald-500" />
            <div class="text-xs text-emerald-700">
              <div class="font-medium">已选择预测值</div>
              <div class="text-emerald-600">{{ data.predictions }}</div>
            </div>
          </div>
          <!-- <button
            class="rounded-lg p-1.5 text-red-500 hover:bg-red-100 transition-colors"
            title="清空选择"
            @click="clearSelectedPrediction"
          >
            <X :size="16" />
          </button> -->
        </div>

        <div
          v-if="availablePredictionNodes.length > 0 && !data.predictions"
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
            <div>$steps.{{ availablePredictionNodes[0]?.name }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 可视化配置 -->
    <div>
      <div class="flex items-center gap-2 mb-3">
        <div class="h-4 w-0.5 rounded-full bg-emerald-500"></div>
        <h3 class="text-sm font-semibold text-slate-800">可视化配置</h3>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-2">多边形颜色</label>
            <div class="flex items-center gap-2">
              <el-color-picker v-model="data.polygonColor" show-alpha @change="updateConfig" />
              <span class="text-xs text-slate-500">{{ data.polygonColor }}</span>
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-2">多边形线宽</label>
            <div class="flex items-center gap-2">
              <el-input-number
                v-model="data.polygonWidth"
                :min="1"
                :max="10"
                :step="1"
                class="flex-1"
                @change="updateConfig"
              />
              <span class="text-xs text-slate-500">px</span>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-700 mb-2">多边形透明度</label>
          <div class="flex items-center gap-3">
            <el-slider
              v-model="data.polygonOpacity"
              :min="0"
              :max="1"
              :step="0.1"
              class="flex-1"
              @change="updateConfig"
            />
            <span class="text-xs text-slate-500 w-12 text-right">{{
              data.polygonOpacity.toFixed(1)
            }}</span>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <label class="text-xs font-medium text-slate-700">填充多边形</label>
          <el-switch v-model="data.fillPolygon" @change="updateConfig" />
        </div>

        <div v-if="data.fillPolygon" class="space-y-4 pt-2 border-t border-slate-200">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-2">填充颜色</label>
              <div class="flex items-center gap-2">
                <el-color-picker v-model="data.fillColor" show-alpha @change="updateConfig" />
                <span class="text-xs text-slate-500">{{ data.fillColor }}</span>
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-2">填充透明度</label>
              <div class="flex items-center gap-3">
                <el-slider
                  v-model="data.fillOpacity"
                  :min="0"
                  :max="1"
                  :step="0.1"
                  class="flex-1"
                  @change="updateConfig"
                />
                <span class="text-xs text-slate-500 w-12 text-right">{{
                  data.fillOpacity.toFixed(1)
                }}</span>
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
        <div class="flex items-center gap-3">
          <button
            class="text-xs text-slate-500 hover:text-slate-700 transition-colors"
            @click="isJsonPreviewCollapsed = !isJsonPreviewCollapsed"
          >
            {{ isJsonPreviewCollapsed ? '展开' : '收起' }}
          </button>
          <button
            class="text-xs text-blue-500 hover:text-blue-700 transition-colors"
            @click="copyJson"
          >
            复制JSON
          </button>
        </div>
      </div>
      <div
        v-show="!isJsonPreviewCollapsed"
        class="rounded-lg bg-slate-900 p-4 border border-slate-700"
      >
        <pre class="text-xs text-slate-100 font-mono whitespace-pre-wrap">{{
          JSON.stringify(data, null, 2)
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
              <div class="h-6 w-6 rounded-md flex items-center justify-center">
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
        <p class="text-sm text-slate-500">当前节点未连接可用的模型节点</p>
        <p class="text-xs text-slate-400 mt-1">请先连接模型节点，再选择预测值</p>
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
import { ref, computed, watch, nextTick } from 'vue'
import { useWorkflowStore } from '@/stores/workflow'
import { Picture, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getNodeTypeIcon, getNodeTypeLabel } from '@/components/Workflow/config/nodeConfig'

import { X, Zap, AlertCircle, CheckCircle, Database, Image } from 'lucide-vue-next'

const props = defineProps<{
  modelValue?: Property
  nodeId?: string | number
}>()

interface Property {
  image?: string
  predictions?: string
  polygonColor: string
  polygonWidth: number
  polygonOpacity: number
  fillPolygon: boolean
  fillColor: string
  fillOpacity: number
  [key: string]: any
}

const emit = defineEmits<{
  'update:nodeConfig': [value: Property]
}>()

const store = useWorkflowStore()

const showImageSelectionDialog = ref(false)
const showPredictionSelectionDialog = ref(false)
const defaultData = (): Property => ({
  image: undefined,
  predictions: undefined,
  polygonColor: '#FF0000',
  polygonWidth: 2,
  polygonOpacity: 1,
  fillPolygon: false,
  fillColor: '#FF0000',
  fillOpacity: 0.3,
})
const data = ref<Property>(defaultData())
const isJsonPreviewCollapsed = ref(true)

const getImageProperties = (node: any) => {
  if (Array.isArray(node?.data)) {
    return node.data.filter((prop: any) => prop.type === 'image')
  }
  if (Array.isArray(node?.data?.config)) {
    return node.data.config.filter((prop: any) => prop.type === 'image')
  }
  return []
}

const availableImageNodes = computed(() => {
  const imageNodes = store.nodes
    .filter((node) => {
      return getImageProperties(node).length > 0
    })
    .map((node) => {
      return {
        id: node.id,
        type: node.type,
        imageProperties: getImageProperties(node),
      }
    })
  if (imageNodes && imageNodes.length > 0) {
    selectImageProperty(imageNodes[0], imageNodes?.[0]?.imageProperties?.[0])
  } else {
    clearSelectedImage()
  }
  return imageNodes
})

const modelTypes = new Set([
  'detection_model@v1',
  'classification_model@v1',
  'segmentation_model',
  'object-detection-model',
  'classification-model',
  'segmentation-model',
])
const currentNodeId = computed(() => {
  const id = props.nodeId ?? store.selectedNode?.id
  return id !== undefined && id !== null ? String(id) : ''
})
const availablePredictionNodes = computed(() => {
  const currentId = currentNodeId.value
  if (!currentId) return []

  const sourceNodeIds = new Set(
    store.edges
      .filter((edge) => String(edge.target) === currentId)
      .map((edge) => String(edge.source)),
  )

  const predictionNodes = store.nodes
    .filter((node) => {
      return sourceNodeIds.has(String(node.id)) && modelTypes.has(String(node.type))
    })
    .map((node) => {
      return {
        id: node.id,
        type: node.type,
        name: node.name || node.id,
        predictionProperties: node?.data || {},
      }
    })
  if (predictionNodes && predictionNodes.length > 0) {
    nextTick(() => {
      selectPredictionProperty(predictionNodes[0], predictionNodes[0]?.predictionProperties)
    })
  } else {
    nextTick(() => {
      clearSelectedPrediction()
    })
  }
  return predictionNodes
})

const selectImageProperty = (node: any, property: any) => {
  data.value.image = `$${node.id}.${property.name}`
  showImageSelectionDialog.value = false
  updateConfig()
  ElMessage.success(`已选择图片属性: ${data.value.image}`)
}

const selectPredictionProperty = (node: any, property: any) => {
  data.value.predictions = `$steps.${node.name}`
  showPredictionSelectionDialog.value = false
  updateConfig()
  ElMessage.success(`已选择预测值: ${data.value.predictions}`)
}

const clearSelectedImage = () => {
  data.value.image = undefined
  updateConfig()
  ElMessage.info('已清空选中的图片属性')
}

const clearSelectedPrediction = () => {
  data.value.predictions = undefined
  updateConfig()
  ElMessage.info('已清空选中的预测值')
}

const fallbackCopyText = (text: string) => {
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', 'readonly')
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    const copied = document.execCommand('copy')
    document.body.removeChild(textarea)
    return copied
  } catch {
    return false
  }
}

const copyJson = async () => {
  const json = JSON.stringify(data.value, null, 2)
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(json)
      ElMessage.success('已复制JSON')
      return
    }

    const copied = fallbackCopyText(json)
    if (copied) {
      ElMessage.success('已复制JSON')
      return
    }
    ElMessage.error('复制失败')
  } catch {
    const copied = fallbackCopyText(json)
    if (copied) {
      ElMessage.success('已复制JSON')
      return
    }
    ElMessage.error('复制失败')
  }
}

const updateConfig = () => {
  emit('update:nodeConfig', JSON.parse(JSON.stringify(data.value)))
}

const initializeData = () => {
  if (
    !props.modelValue ||
    typeof props.modelValue !== 'object' ||
    Array.isArray(props.modelValue)
  ) {
    data.value = defaultData()
    return
  }

  data.value = {
    ...defaultData(),
    ...JSON.parse(JSON.stringify(props.modelValue)),
  }
}

watch(
  () => props.modelValue,
  () => initializeData(),
  { deep: true, immediate: true },
)
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
