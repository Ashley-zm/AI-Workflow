<template>
  <div class="space-y-6">
    <div>
      <div class="mb-3 flex items-center gap-2">
        <div class="h-4 w-0.5 rounded-full bg-blue-500"></div>
        <h3 class="text-sm font-semibold text-slate-800">图片属性</h3>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="mb-3">
          <label class="mb-2 block text-xs font-medium text-slate-700">
            选择图片属性 <span class="text-red-500">*</span>
          </label>
          <el-button
            type="primary"
            size="default"
            class="w-full"
            :disabled="availableImageNodes.length === 0"
            @click="showImageSelectionDialog = true"
          >
            <el-icon class="mr-2"><Picture /></el-icon>
            {{ data.images ? '重新选择图片' : '选择图片属性' }}
          </el-button>
        </div>
        <div
          v-if="availableImageNodes.length === 0"
          class="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3"
        >
          <AlertCircle :size="16" class="mt-0.5 flex-shrink-0 text-amber-500" />
          <div class="text-xs text-amber-700">
            <div class="mb-1 font-medium">暂无可用图片属性</div>
            <div>当前流程中没有包含图片属性的节点，请先添加包含图片属性的节点。</div>
          </div>
        </div>

        <div
          v-if="data.images"
          class="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3"
        >
          <div class="flex items-center gap-2">
            <CheckCircle :size="16" class="text-emerald-500" />
            <div class="text-xs text-emerald-700">
              <div class="font-medium">已选择图片属性</div>
              <div class="text-emerald-600">{{ data.images }}</div>
            </div>
          </div>
          <!-- <button
            title="清空选择"
            class="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-100"
            @click="clearSelectedImage"
          >
            <X :size="16" />
          </button> -->
        </div>

        <div
          v-if="availableImageNodes.length > 0 && !data.images"
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

    <div>
      <div class="mb-3 flex items-center gap-2">
        <div class="h-4 w-0.5 rounded-full bg-purple-500"></div>
        <h3 class="text-sm font-semibold text-slate-800">模型配置</h3>
      </div>
      <div class="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex items-center gap-4">
          <label class="block text-xs font-medium text-slate-700">
            选择模型 <span class="text-red-500">*</span>
          </label>
          <el-select
            v-model="data.model_repository_id"
            size="default"
            class="flex-1"
            filterable
            placeholder="请选择模型"
            @change="onModelSelect"
          >
            <el-option
              v-for="model in modelList"
              :key="model.id"
              :label="model.name"
              :value="model.id"
            >
              <div class="flex py-1">
                <div class="flex items-center gap-2">
                  <div class="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500">
                    <Brain :size="12" class="text-white" />
                  </div>
                  <span class="text-sm font-medium">{{ model.name }}</span>
                </div>
                <!-- <el-tag size="small">{{ model.children.length }} 个版本</el-tag> -->
              </div>
            </el-option>
          </el-select>
        </div>

        <!-- <div class="flex items-center gap-4">
          <label class="block text-xs font-medium text-slate-700">
            类别标签 <span class="text-red-500">*</span>
          </label>
          <span class="text-gray-600 text-sm ">
            {{ data.labels?.toString() }}
          </span>
        </div> -->
        <div class="flex items-center gap-4">
          <label class="block text-xs font-medium text-slate-700">
            失败标签 <span class="text-red-500">*</span>
          </label>
          <el-select
            v-model="data.fail_labels"
            size="default"
            class="flex-1"
            filterable
            clearable
            placeholder="请选择失败标签"
          >
            <el-option
              v-for="version in data.labels"
              :key="version"
              :label="version"
              :value="version"
            />
          </el-select>
        </div>

        <div class="rounded-lg border border-slate-200 bg-slate-50">
          <button
            type="button"
            class="flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-slate-100"
            @click="showAdvancedConfig = !showAdvancedConfig"
          >
            <div>
              <div class="text-xs font-medium text-slate-700">更多配置</div>
            </div>
            <div class="flex items-center gap-1 text-xs text-slate-500">
              <span>{{ showAdvancedConfig ? '收起' : '展开' }}</span>
              <ChevronDown
                :size="14"
                class="transition-transform"
                :class="{ 'rotate-180': showAdvancedConfig }"
              />
            </div>
          </button>

          <div
            v-show="showAdvancedConfig"
            class="space-y-4 border-t border-slate-200 bg-white px-3 pb-3 pt-3"
          >
            <div class="flex items-center gap-4">
              <label class="block text-xs font-medium text-slate-700">
                是否选择最新版本 <span class="text-red-500">*</span>
              </label>
              <el-switch
                v-model="data.is_latest"
                :active-value="1"
                :inactive-value="0"
                class="flex-1"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="onLatestChange"
              />
            </div>

            <div v-if="data.is_latest === 0" class="flex items-center gap-4">
              <label class="block text-xs font-medium text-slate-700">
                模型版本 <span class="text-red-500">*</span>
              </label>
              <el-select
                v-model="data.model_version_id"
                size="default"
                class="flex-1"
                filterable
                clearable
                placeholder="请选择模型版本"
                @change="onVersionSelect"
              >
                <el-option
                  v-for="version in selectedModelVersions"
                  :key="version.id"
                  :label="version.name"
                  :value="version.id"
                />
              </el-select>
            </div>

            <div class="flex items-center gap-4">
              <label class="block text-xs font-medium text-slate-700">
                推理设备 <span class="text-red-500">*</span>
              </label>
              <el-select
                v-model="data.device"
                size="default"
                class="flex-1"
                placeholder="请选择设备类型"
                @change="updateConfig"
              >
                <el-option
                  v-for="device in deviceOptions"
                  :key="device.value"
                  :label="device.label"
                  :value="device.value"
                />
              </el-select>
            </div>

            <div>
              <label class="mb-2 block text-xs font-medium text-slate-700"> 置信度阈值 </label>
              <div class="flex items-center gap-3">
                <el-slider
                  v-model="data.confidence_threshold"
                  :min="0"
                  :max="1"
                  :step="0.01"
                  class="flex-1"
                  @change="updateConfig"
                />
                <span class="w-16 text-right text-xs text-slate-500">
                  {{ Number(data.confidence_threshold ?? 0).toFixed(2) }}
                </span>
              </div>
            </div>

            <div>
              <label class="mb-2 block text-xs font-medium text-slate-700">Top-K预测</label>
              <div class="flex items-center gap-3">
                <el-slider
                  v-model="data.top_k"
                  :min="0"
                  :max="10"
                  :step="1"
                  class="flex-1"
                  @change="updateConfig"
                />
                <span class="w-16 text-right text-xs text-slate-500">
                  {{ Number(data.top_k ?? 5) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <div class="mb-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="h-4 w-0.5 rounded-full bg-slate-500"></div>
          <h3 class="text-sm font-semibold text-slate-800">JSON预览</h3>
        </div>
        <div class="flex items-center gap-3">
          <button
            class="text-xs text-slate-500 transition-colors hover:text-slate-700"
            @click="isJsonPreviewCollapsed = !isJsonPreviewCollapsed"
          >
            {{ isJsonPreviewCollapsed ? '展开' : '收起' }}
          </button>
          <button
            class="text-xs text-blue-500 transition-colors hover:text-blue-700"
            @click="copyJson"
          >
            复制JSON
          </button>
        </div>
      </div>
      <div
        v-show="!isJsonPreviewCollapsed"
        class="rounded-lg border border-slate-700 bg-slate-900 p-4"
      >
        <pre class="whitespace-pre-wrap font-mono text-xs text-slate-100">{{
          JSON.stringify(data, null, 2)
        }}</pre>
      </div>
    </div>
    <el-dialog
      v-model="showImageSelectionDialog"
      title="选择图片属性"
      width="600px"
      :close-on-click-modal="false"
      class="property-dialog"
    >
      <div v-if="availableImageNodes.length === 0" class="py-8 text-center">
        <div class="mb-3 flex justify-center">
          <div class="rounded-full bg-slate-100 p-3">
            <Picture :size="32" class="text-slate-400" />
          </div>
        </div>
        <p class="text-sm text-slate-500">当前流程中没有包含图片属性的节点</p>
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="node in availableImageNodes"
          :key="node.id"
          class="rounded-lg border border-slate-200 p-4 transition-colors hover:border-blue-300"
        >
          <div class="mb-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500">
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
              class="flex cursor-pointer items-center justify-between rounded-lg bg-slate-50 p-3 transition-colors hover:bg-blue-50"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useWorkflowStore } from '@/stores/workflow'
import { Picture, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getNodeTypeIcon, getNodeTypeLabel } from '@/components/Workflow/config/nodeConfig'
import { X, Zap, AlertCircle, CheckCircle, Brain, Image, ChevronDown } from 'lucide-vue-next'
import { getModelServiceList, getGpuInfo } from '@/api/workflow'

interface ModelVersionOption {
  id: string
  name: string
  model_type?: string
}

interface ModelOption {
  id: string
  name: string
  description?: string
  labels?: string[]
  children: ModelVersionOption[]
}

interface Property {
  images?: string
  model_repository_id?: string
  model_name?: string
  is_latest: number
  model_version_id?: string
  model_version_name?: string
  device?: string
  confidence_threshold?: number
  top_k?: number
  labels: string[] | undefined
  fail_labels?: string
}

const props = defineProps<{
  modelValue?: Property
  nodeObj: any
}>()

const emit = defineEmits<{
  'update:nodeConfig': [value: Property]
}>()

const store = useWorkflowStore()
const showImageSelectionDialog = ref(false)
const modelList = ref<ModelOption[]>([])

const defaultData = (): Property => ({
  images: undefined,
  model_repository_id: undefined,
  model_name: undefined,
  is_latest: 1, //是否选择最新版本(0:否 1:是)
  model_version_id: undefined,
  model_version_name: undefined,
  device: undefined,
  confidence_threshold: 0.5,
  top_k: 5,
  labels: [],
  fail_labels: undefined,
})

const data = ref<Property>(defaultData())
const isJsonPreviewCollapsed = ref(true)
const showAdvancedConfig = ref(false)

const availableImageNodes = computed(() => {
  return store.nodes
    .filter((node) => {
      const nodeProperties = node.data
      if (!nodeProperties || !Array.isArray(nodeProperties)) return false
      return nodeProperties.some((prop: any) => prop.type === 'image')
    })
    .map((node) => ({
      id: node.id,
      type: node.type,
      imageProperties: (node.data as any[]).filter((prop: any) => prop.type === 'image'),
    }))
})

const selectedModelInfo = computed(() => {
  return modelList.value.find((model) => model.id === data.value.model_repository_id) || null
})

const selectedModelVersions = computed(() => selectedModelInfo.value?.children || [])

const deviceOptions = ref<{ label: string; value: string }[]>([])
// 同步模型字段
// autoChooseVersion: 是否自动选择最新版本
const syncModelFields = (autoChooseVersion = false) => {
  if (!selectedModelInfo.value) {
    data.value.model_name = undefined
    data.value.model_version_id = undefined
    data.value.model_version_name = undefined
    return
  }

  data.value.model_name = selectedModelInfo.value.name
  data.value.labels = selectedModelInfo.value.labels
  data.value.fail_labels = selectedModelInfo.value.labels ? selectedModelInfo.value.labels[0] : ''

  const versions = selectedModelVersions.value
  const activeVersion =
    versions.find((item) => item.id === data.value.model_version_id) ||
    (autoChooseVersion ? versions[0] : undefined)

  if (data.value.is_latest === 0) {
    data.value.model_version_id = activeVersion?.id
    data.value.model_version_name = activeVersion?.name
  } else {
    data.value.model_version_id = undefined
    data.value.model_version_name = activeVersion?.name
  }
}

const updateConfig = () => {
  emit('update:nodeConfig', data.value)
}

const selectImageProperty = (node: any, property: any) => {
  if (!node?.id || !property?.name) return
  data.value.images = `$${node.id}.${property.name}`
  showImageSelectionDialog.value = false
  updateConfig()
  // ElMessage.success(`已选择图片属性: ${data.value.images}`)
}

const clearSelectedImage = () => {
  data.value.images = undefined
  updateConfig()
  // ElMessage.info('已清空选中的图片属性')
}

const onModelSelect = () => {
  syncModelFields(true)
  updateConfig()
}

const onLatestChange = () => {
  syncModelFields(true)
  updateConfig()
}

const onVersionSelect = (versionId?: string) => {
  const selected = selectedModelVersions.value.find((item) => item.id === versionId)
  data.value.model_version_name = selected?.name
  updateConfig()
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

const initializeData = () => {
  const nextValue = props.modelValue ? JSON.parse(JSON.stringify(props.modelValue)) : {}
  data.value = {
    ...defaultData(),
    ...nextValue,
  }
}
const type: Record<string, string> = {
  'detection_model@v1': 'detection',
  'classification_model@v1': 'classification',
  segmentation_model: 'image_segmentation',
}

const getModelList = async () => {
  try {
    const res = await getModelServiceList({
      algorithmTypeDictId: type[props.nodeObj.type] || '',
      pageNum: 1,
      pageSize: 1000,
    })

    modelList.value =
      res?.rows?.map((item: any) => ({
        id: item.modelRepositoryId,
        name: item.modelName,
        description: item.apiDescription,
        labels: item.labelName || [],
        children:
          item.modelServiceList?.map((service: any) => ({
            id: service.modelVersionId,
            name: service.modelVersion,
            model_type: service.algorithmModelDictId,
          })) || [],
      })) || []

    if (!data.value.model_repository_id && modelList.value.length > 0) {
      data.value.model_repository_id = modelList.value[0]?.id
      syncModelFields(true)
      data.value.top_k = 5
      data.value.confidence_threshold = 0.45
    } else {
      syncModelFields(false)
    }

    updateConfig()
  } catch (error) {
    console.error('获取模型列表失败:', error)
  }
}

const getGpu = async () => {
  try {
    const res = await getGpuInfo()
    deviceOptions.value =
      res?.data?.gpus?.map((item: any) => ({
        label: item.name,
        value: item.name,
      })) || []
    data.value.device = deviceOptions.value?.[0]?.value || undefined
  } catch {
    data.value.device = undefined
    deviceOptions.value = []
  }
}

watch(
  () => props.modelValue,
  () => {
    initializeData()
  },
  { deep: true, immediate: true },
)

watch(
  availableImageNodes,
  (nodes) => {
    if (data.value.images || nodes.length === 0) return
    const firstNode = nodes[0]
    const firstImageProperty = firstNode?.imageProperties?.[0]
    if (!firstNode || !firstImageProperty) return
    selectImageProperty(firstNode, firstImageProperty)
  },
  { deep: true, immediate: true },
)

onMounted(async () => {
  await getGpu()
  await getModelList()
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
