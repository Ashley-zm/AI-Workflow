<template>
  <div class="group relative pt-5">
    <div
      class="hidden shadow-lg border border-red-100 group-hover:block absolute -top-2 right-2 bg-white text-red-400 p-1 rounded-md cursor-pointer hover:bg-red-200"
      @click.stop="deleteNode"
      title="删除节点"
    >
      <Trash :size="14" />
    </div>
    <div
      class="group relative min-w-[260px] bg-white rounded-xl hover:shadow-lg"
      :class="[
        selected
          ? `border-l-4 border-y-1  border-r-1 ${getTextColor(nodeColor)} shadow-lg `
          : `${getHoverClasses(nodeColor)} border-l-4 ${getTextColor(nodeColor)} border-t-1 border-b-1 border-t-gray-200 border-b-gray-200 border-r-1 border-r-gray-200`,
        ,
      ]"
    >
      <div class="flex items-center justify-between p-2 rounded-t-xl border-b border-gray-100">
        <div class="flex items-center gap-2">
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
          <div>
            <div class="text-[10px] rounded-full uppercase font-bold">
              {{ nodeType?.name || 'Model' }}
            </div>
            <div class="text-[10px] text-gray-700">
              {{ nodeType?.description || 'Model 节点' }}
            </div>
          </div>
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
        <!-- <button
          class="bg-red-100 text-red-700 p-0.5 rounded-md cursor-pointer hover:bg-red-200 transition border-none outline-none"
          @click.stop="deleteNode"
          title="删除节点"
        >
          <X :size="16" />
        </button> -->
      </div>

      <div class="px-4 py-2">
        <div>
          <label class="text-[11px] text-gray-500 font-bold uppercase tracking-wider">图片：</label>
          <span class="text-xs text-gray-600">{{ data.config?.imagePath || '请选择图片...' }}</span>
        </div>
        <div>
          <label class="text-[11px] text-gray-500 font-bold uppercase tracking-wider">模型：</label>
          <span class="text-xs text-gray-600">{{
            data.config?.modelInfo?.name || '请选择模型...'
          }}</span>
        </div>
      </div>

      <CustomHandle
        type="target"
        :position="Position.Top"
        :node-id="props.id"
        @handle-click="(event, type, id) => onHandleClick?.(event, type, id)"
      />
      <CustomHandle
        type="source"
        :position="Position.Bottom"
        :node-id="props.id"
        :color="nodeColor"
        :show-tooltip="true"
        @handle-click="(event, type, id) => onHandleClick?.(event, type, id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref, onMounted } from 'vue'
import { Position } from '@vue-flow/core'
import CustomHandle from './CustomHandle.vue'
import { useWorkflowStore } from '@/stores/workflow'
import { TriangleAlert, Trash } from 'lucide-vue-next'
import {
  getIconComponent,
  getTextColor,
  getChildIconClasses,
  getHoverClasses,
} from '@/components/Workflow/Nodes/nodeConfig'
import { getNodeType } from './nodeTypes'

const store = useWorkflowStore()
const props = defineProps<{
  id: string
  config: any
  data: any
  selected?: boolean
  type: string
}>()

// 从节点数据中获取handle点击事件处理器
const onHandleClick = computed(() => {
  return props.data?.onHandleClick as (
    event: MouseEvent,
    handleType: 'source' | 'target',
    nodeId: string,
  ) => void | undefined
})
// 获取节点类型配置
const nodeType = computed(() => getNodeType(props.type))
const nodeColor = computed(() => nodeType.value?.color || 'blue')
const deleteNode = () => {
  // 通过 store 删除节点，这样会自动记录历史
  store.removeNode(props.id)
  store.setSelectedNode(null)
}
// 初始化属性数据
const initializeProperties = () => {
  // 检查属性是否存在空名称
  updateIsShowTip()
}
const isShowTip = ref(true)
const TipContent = ref('')
const updateIsShowTip = () => {
  console.log('props.config', props)
  if (!props.data?.config?.imagePath) {
    TipContent.value = '请选择图片'
    isShowTip.value = true
  } else if (!props.data?.config?.model) {
    TipContent.value = '请选择模型'
    isShowTip.value = true
  } else {
    isShowTip.value = false
  }
}
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
