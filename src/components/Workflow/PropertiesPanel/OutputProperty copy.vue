<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center gap-3 p-4 border-b border-slate-200">
      <div
        class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-md"
      >
        <FileOutput :size="20" />
      </div>
      <div class="flex-1">
        <h3 class="font-bold text-slate-900">输出节点</h3>
        <p class="text-xs text-slate-500">查看最终结果及输入数据</p>
      </div>
      <div
        v-if="sourceNodes.length > 0"
        class="flex items-center gap-2 rounded-full px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-medium"
      >
        <CheckCircle :size="14" />
        已连接 {{ sourceNodes.length }} 个节点
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- Basic Config -->
      <div>
        <div class="flex items-center gap-2 mb-3">
          <div class="h-4 w-0.5 rounded-full bg-purple-500"></div>
          <h3 class="text-sm font-semibold text-slate-800">节点配置</h3>
        </div>
        <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <label class="block text-xs font-medium text-slate-700 mb-2">节点名称</label>
          <el-input v-model="nodeLabel" size="default" placeholder="命名该节点..." class="w-full">
            <template #prefix>
              <Type :size="14" class="text-slate-400" />
            </template>
          </el-input>
        </div>
      </div>

      <!-- Input Data -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="h-4 w-0.5 rounded-full bg-blue-500"></div>
            <h3 class="text-sm font-semibold text-slate-800">输入数据</h3>
          </div>
          <div class="flex items-center gap-2">
            <el-button
              v-if="sourceNodes.length > 0"
              size="small"
              type="primary"
              @click="exportAllData"
              class="!text-xs"
            >
              <Download :size="14" class="mr-1" />
              导出全部
            </el-button>
            <el-select v-model="viewMode" size="small" class="!w-28">
              <el-option label="卡片视图" value="card" />
              <el-option label="列表视图" value="list" />
              <el-option label="紧凑视图" value="compact" />
            </el-select>
          </div>
        </div>

        <div v-if="sourceNodes.length > 0" class="space-y-3">
          <div
            v-for="(node, index) in sourceNodes"
            :key="node.id"
            class="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden hover:border-purple-300 transition-all hover:shadow-md"
          >
            <div
              class="flex items-center justify-between bg-gradient-to-r from-slate-50 to-white px-4 py-3 border-b border-slate-200 cursor-pointer"
              @click="toggleNodeExpand(node.id)"
            >
              <div class="flex items-center gap-3">
                <div
                  class="h-8 w-8 rounded-lg flex items-center justify-center shadow-sm"
                  :class="getNodeTypeColorClass(node.type)"
                >
                  <component :is="getNodeTypeIcon(node.type)" :size="16" class="text-white" />
                </div>
                <div>
                  <div class="text-sm font-semibold text-slate-800">
                    {{ node.data?.label || node.type }}
                  </div>
                  <div class="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>{{ getNodeTypeLabel(node.type) }}</span>
                    <span class="text-slate-300">•</span>
                    <el-tag size="small" :type="getNodeStatusType(node)" class="!text-[10px]">
                      {{ getNodeStatusText(node) }}
                    </el-tag>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <el-tag size="small" type="info" class="!text-[10px]"
                  >ID: {{ node.id.slice(-6) }}</el-tag
                >
                <ChevronDown
                  :size="16"
                  class="text-slate-400 transition-transform"
                  :class="{ 'rotate-180': expandedNodes.has(node.id) }"
                />
              </div>
            </div>

            <div v-show="expandedNodes.has(node.id)" class="p-4 space-y-3">
              <div class="grid grid-cols-3 gap-3">
                <div class="rounded-lg bg-blue-50 p-3 border border-blue-100">
                  <div class="flex items-center gap-1.5 text-[10px] text-blue-600 mb-1">
                    <Database :size="10" />
                    <span>数据属性</span>
                  </div>
                  <div class="text-lg font-bold text-blue-700">
                    {{ getNodePropertiesCount(node) }}
                  </div>
                </div>
                <div class="rounded-lg bg-emerald-50 p-3 border border-emerald-100">
                  <div class="flex items-center gap-1.5 text-[10px] text-emerald-600 mb-1">
                    <FileText :size="10" />
                    <span>数据类型</span>
                  </div>
                  <div class="text-sm font-semibold text-emerald-700">{{ getDataType(node) }}</div>
                </div>
                <div class="rounded-lg bg-purple-50 p-3 border border-purple-100">
                  <div class="flex items-center gap-1.5 text-[10px] text-purple-600 mb-1">
                    <Activity :size="10" />
                    <span>状态</span>
                  </div>
                  <div class="text-sm font-semibold text-purple-700">
                    {{ getNodeStatusText(node) }}
                  </div>
                </div>
              </div>

              <div class="rounded-lg bg-slate-900 p-4 border border-slate-700">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-medium text-slate-400">数据预览</span>
                  <div class="flex items-center gap-1">
                    <button
                      class="rounded px-2 py-1 text-[10px] text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      @click="copyNodeData(node)"
                    >
                      <Copy :size="12" class="mr-1" />
                      复制
                    </button>
                    <button
                      class="rounded px-2 py-1 text-[10px] text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      @click="downloadNodeData(node)"
                    >
                      <Download :size="12" class="mr-1" />
                      下载
                    </button>
                  </div>
                </div>
                <pre
                  class="text-[11px] leading-relaxed font-mono text-slate-100 overflow-x-auto whitespace-pre-wrap break-all max-h-48 overflow-y-auto"
                  >{{ formatNodeData(node) }}</pre
                >
              </div>
            </div>
          </div>
        </div>

        <div
          v-else
          class="flex flex-col items-center justify-center py-12 px-4 rounded-lg bg-slate-50 border-2 border-dashed border-slate-300 text-center"
        >
          <div class="mb-4 flex justify-center">
            <div class="rounded-full bg-slate-200 p-4">
              <Link :size="32" class="text-slate-400" />
            </div>
          </div>
          <p class="text-sm text-slate-600 font-medium mb-1">暂无连接</p>
          <p class="text-xs text-slate-400">请将其他节点连接至此节点以查看数据</p>
        </div>
      </div>

      <!-- Statistics -->
      <div v-if="sourceNodes.length > 0">
        <div class="flex items-center gap-2 mb-3">
          <div class="h-4 w-0.5 rounded-full bg-emerald-500"></div>
          <h3 class="text-sm font-semibold text-slate-800">数据统计</h3>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div
            class="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4 border border-blue-200"
          >
            <div class="flex items-center gap-2 text-[10px] text-blue-600 mb-2">
              <Users :size="10" />
              <span>连接节点</span>
            </div>
            <div class="text-2xl font-bold text-blue-700">{{ sourceNodes.length }}</div>
          </div>
          <div
            class="rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 border border-emerald-200"
          >
            <div class="flex items-center gap-2 text-[10px] text-emerald-600 mb-2">
              <Layers :size="10" />
              <span>总数据属性</span>
            </div>
            <div class="text-2xl font-bold text-emerald-700">{{ totalProperties }}</div>
          </div>
          <div
            class="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4 border border-purple-200"
          >
            <div class="flex items-center gap-2 text-[10px] text-purple-600 mb-2">
              <FileText :size="10" />
              <span>数据类型</span>
            </div>
            <div class="text-2xl font-bold text-purple-700">{{ uniqueDataTypes }}</div>
          </div>
          <div
            class="rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 p-4 border border-amber-200"
          >
            <div class="flex items-center gap-2 text-[10px] text-amber-600 mb-2">
              <Activity :size="10" />
              <span>活跃节点</span>
            </div>
            <div class="text-2xl font-bold text-amber-700">{{ activeNodesCount }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  FileOutput,
  Link,
  Copy,
  Type,
  Database,
  AlertCircle,
  Image,
  Hash,
  Brain,
  CheckCircle,
  Download,
  ChevronDown,
  FileText,
  Activity,
  Users,
  Layers,
} from 'lucide-vue-next'
import { useVueFlow, type Node } from '@vue-flow/core'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  nodeId: string
}>()

const { findNode, edges } = useVueFlow()

const currentNode = computed(() => findNode(props.nodeId))

const nodeLabel = computed({
  get: () => currentNode.value?.data?.label || '',
  set: (val) => {
    if (currentNode.value) {
      currentNode.value.data = { ...currentNode.value.data, label: val }
    }
  },
})

const viewMode = ref('card')
const expandedNodes = ref(new Set<string>())

const sourceNodes = computed(() => {
  if (!props.nodeId) {
    return []
  }

  const ancestors = new Map<string, Node>()

  const findAncestors = (nodeId: string) => {
    const parentEdges = edges.value.filter((edge) => edge.target === nodeId)

    for (const edge of parentEdges) {
      const sourceNode = findNode(edge.source)
      if (sourceNode) {
        findAncestors(sourceNode.id)
        if (!ancestors.has(sourceNode.id)) {
          ancestors.set(sourceNode.id, sourceNode)
        }
      }
    }
  }

  findAncestors(props.nodeId)
  return Array.from(ancestors.values())
})

const totalProperties = computed(() => {
  return sourceNodes.value.reduce((total, node) => {
    const config = node.data?.config || []
    return total + config.length
  }, 0)
})

const uniqueDataTypes = computed(() => {
  const types = new Set<string>()
  sourceNodes.value.forEach((node) => {
    const dataType = getDataType(node)
    if (dataType) types.add(dataType)
  })
  return types.size
})

const activeNodesCount = computed(() => {
  return sourceNodes.value.filter((node) => {
    const config = node.data?.config || []
    return config.length > 0
  }).length
})

const getNodeTypeLabel = (type: string | undefined) => {
  if (!type) return ''
  const typeMap: Record<string, string> = {
    inputs: '输入',
    outputs: '输出',
    model: '模型',
    processing: '处理',
    visualization: '可视化',
  }
  return typeMap[type] || type
}

const getNodeTypeColorClass = (type: string | undefined) => {
  if (!type) return 'bg-slate-500'
  const colorMap: Record<string, string> = {
    inputs: 'bg-emerald-500',
    outputs: 'bg-amber-500',
    model: 'bg-blue-500',
    processing: 'bg-purple-500',
    visualization: 'bg-pink-500',
  }
  return colorMap[type] || 'bg-slate-500'
}

const getNodeTypeIcon = (type: string | undefined) => {
  if (!type) return Database
  const iconMap: Record<string, any> = {
    inputs: Image,
    outputs: Type,
    model: Brain,
    processing: Hash,
    visualization: Hash,
  }
  return iconMap[type] || Database
}

const getNodePropertiesCount = (node: Node) => {
  const config = node.data?.config || []
  return config.length
}

const getDataType = (node: Node) => {
  const config = node.data?.config || []
  if (config.length === 0) return '无数据'

  const hasImage = config.some((prop: any) => prop.type === 'image')
  const hasParameter = config.some((prop: any) => prop.type === 'parameter')

  if (hasImage && hasParameter) return '混合'
  if (hasImage) return '图片'
  if (hasParameter) return '参数'
  return '其他'
}

const getNodeStatusType = (node: Node) => {
  const config = node.data?.config || []
  if (config.length === 0) return 'warning'
  return 'success'
}

const getNodeStatusText = (node: Node) => {
  const config = node.data?.config || []
  if (config.length === 0) return '未配置'
  return '已配置'
}

const formatNodeData = (node: Node) => {
  const data = node.data
  const formatted = {
    id: node.id,
    type: node.type,
    label: data?.label || node.type,
    config: data?.config || [],
  }
  return JSON.stringify(formatted, null, 2)
}

const toggleNodeExpand = (nodeId: string) => {
  if (expandedNodes.value.has(nodeId)) {
    expandedNodes.value.delete(nodeId)
  } else {
    expandedNodes.value.add(nodeId)
  }
}

const copyNodeData = (node: Node) => {
  const data = formatNodeData(node)
  navigator.clipboard
    .writeText(data)
    .then(() => {
      ElMessage.success('已复制节点数据')
    })
    .catch(() => {
      ElMessage.error('复制失败')
    })
}

const downloadNodeData = (node: Node) => {
  const data = formatNodeData(node)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${node.type}_${node.id.slice(-6)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('已下载节点数据')
}

const exportAllData = () => {
  const allData = sourceNodes.value.map((node) => ({
    id: node.id,
    type: node.type,
    label: node.data?.label || node.type,
    config: node.data?.config || [],
  }))

  const data = JSON.stringify(allData, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `output_data_${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('已导出所有数据')
}
</script>
