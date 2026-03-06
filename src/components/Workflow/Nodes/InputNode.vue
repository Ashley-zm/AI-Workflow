<template>
  <div
    class="group relative w-[280px] bg-white rounded-xl border-1 border-gray-300 transition-all hover:shadow-lg"
    :class="{ '!border-gray-400 shadow-gray-100': selected }"
  >
    <div
      class="flex items-center justify-between p-2 bg-blue-50/50 rounded-t-xl border-b border-gray-100"
    >
      <div class="flex items-center gap-2">
        <div
          class="bg-gray-400 rounded-xs text-white w-[25px] h-[25px] flex items-center justify-center"
        >
          <ArrowUpFromLine :size="14" />
        </div>
        <div class="flex flex-col min-w-[200px]">
          <span class="text-sm font-semibold text-gray-600">Inputs </span>
          <p class="text-xs font-thin text-gray-600">工作流程运行所需的数据</p>
        </div>
        <!-- 最右侧警告图标 -->
        <el-tooltip
          v-if="isShowTip"
          class="box-item"
          effect="dark"
          :content="TipContent"
          placement="top"
        >
          <div class="text-red-400 bg-red-50 p-1 rounded-full">
            <TriangleAlert :size="12" />
          </div>
        </el-tooltip>
      </div>
    </div>

    <div class="p-2">
      <!-- 自定义属性列表 -->
      <div v-if="properties && properties.length > 0" class="mb-3">
        <div class="space-y-1">
          <div
            v-for="(property, index) in properties"
            :key="index"
            class="flex items-center justify-between p-1 bg-gray-50 rounded text-xs"
          >
            <div class="flex items-center gap-2">
              <Image v-if="property.type === 'image'" class="text-gray-500" :size="15" />
              <SlidersHorizontal v-else class="text-gray-500" :size="15" />
              <span class="font-medium">{{ property.name || '未命名属性' }}</span>
              <el-tag :type="property.type === 'parameter' ? 'success' : 'primary'" size="small">
                {{ property.type === 'parameter' ? 'Parameter' : 'Image' }}
              </el-tag>
            </div>
            <Delete
              class="text-red-400 hover:text-red-700 inline-block"
              :size="14"
              @click="removeProperty(index)"
            />
          </div>
        </div>
      </div>

      <div
        class="w-full p-2 border-1 border-gray-300 rounded-md text-center cursor-pointer text-gray-600 text-xs hover:bg-gray-50"
        v-if="!properties || properties.length === 0"
      >
        <Plus class="inline-block mr-1" :size="14" />
        添加输入
      </div>
    </div>
    <CustomHandle
      type="source"
      :position="Position.Bottom"
      :node-id="props.id"
      color="blue"
      :show-tooltip="true"
      @handle-click="
        (event: MouseEvent, type: 'source' | 'target', nodeId: string) => {
          onHandleClick?.(event, type, nodeId)
        }
      "
    />
  </div>
</template>

<script setup lang="ts">
import { Position } from '@vue-flow/core'
import CustomHandle from './CustomHandle.vue'
import {
  ArrowUpFromLine,
  TriangleAlert,
  Image,
  Delete,
  SlidersHorizontal,
  Plus,
} from 'lucide-vue-next'
import { useWorkflowStore } from '@/stores/workflow'
import { ref, watch, onMounted, computed } from 'vue'

const store = useWorkflowStore()
const props = defineProps<{
  id: string
  data: any
  selected?: boolean
}>()

// 从节点数据中获取handle点击事件处理器
const onHandleClick = computed(() => {
  return props.data?.onHandleClick as (
    event: MouseEvent,
    handleType: 'source' | 'target',
    nodeId: string,
  ) => void | undefined
})

// 属性接口定义
interface Property {
  name: string
  type: 'parameter' | 'image'
  valueType: 'string' | 'number' | 'boolean' | 'array' | 'object'
  defaultValue: string
}

// 属性列表
const properties = ref<Property[]>([])

// 初始化属性数据
const initializeProperties = () => {
  if (props.data && props.data.properties) {
    properties.value = JSON.parse(JSON.stringify(props.data.properties))
  } else {
    properties.value = []
  }
  // 检查属性是否存在空名称
  updateIsShowTip()
}

// 删除属性（从节点中删除）
const removeProperty = (index: number) => {
  properties.value.splice(index, 1)
  updateNodeData()
  // 检查属性是否存在空名称
  updateIsShowTip()
}

// 更新节点数据（将属性数据保存到节点的 data 中）
const updateNodeData = () => {
  const nodeData = { ...props.data }
  nodeData.properties = JSON.parse(JSON.stringify(properties.value))

  // 通知store节点数据已更新
  store.updateNode(props.id, { properties: nodeData.properties })
  updateIsShowTip()
}
const isShowTip = ref(true)
const TipContent = ref('')
const updateIsShowTip = () => {
  if (!properties.value || properties.value.length === 0) {
    TipContent.value = '输入节点至少添加一个输入参数'
    isShowTip.value = true
  } else {
    // properties中存在属性名称为空的情况下
    const hasEmptyName = properties.value.some((prop) => !prop.name)
    if (hasEmptyName) {
      TipContent.value = '【属性名称】不能为空'
      isShowTip.value = true
    } else {
      isShowTip.value = false
    }
  }
}
// 组件挂载时初始化
onMounted(() => {
  initializeProperties()
})

// 监听属性变化
watch(
  () => props.data,
  () => {
    initializeProperties()
  },
  { deep: true },
)
</script>
