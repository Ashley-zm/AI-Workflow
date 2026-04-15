<template>
  <div
    class="group relative w-[250px] bg-white rounded-xl border border-gray-200 shadow transition-all"
    :class="[selected ? `shadow-xl` : `hover:shadow-xl`]"
  >
    <div class="flex items-center justify-between p-3 rounded-t-xl border-b border-gray-200">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center"
          :class="`bg-${nodeColor}-100 `"
        >
          <component
            :size="18"
            :class="`text-${nodeColor}-600`"
            :is="getIconComponent(nodeType?.icon || 'BotIcon')"
          />
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-bold text-slate-700">
            {{ props.id || 'Input' }}
          </span>
          <p class="text-xs text-gray-500 tracking-[1px]">
            {{ nodeType?.description || 'Input 节点' }}
          </p>
        </div>
      </div>
      <el-tooltip
        v-if="isShowTip"
        class="box-item"
        effect="dark"
        :content="TipContent"
        placement="top"
      >
        <div
          class="flex items-center justify-center w-7 h-7 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors cursor-pointer"
        >
          <TriangleAlert :size="14" />
        </div>
      </el-tooltip>
    </div>

    <div class="p-3" v-if="selected">
      <div v-if="data && data.length > 0" class="space-y-2">
        <div
          v-for="(property, index) in data"
          :key="index"
          class="flex items-center justify-between p-1.5 rounded-lg border border-slate-100 transition-all cursor-pointer"
        >
          <div class="flex items-center gap-2.5 flex-1 min-w-0">
            <div
              class="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center"
              :class="property.type === 'image' ? 'bg-emerald-500' : 'bg-blue-500'"
            >
              <component
                :is="property.type === 'image' ? Image : SlidersHorizontal"
                :size="14"
                class="text-white"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-semibold text-slate-700 truncate">
                {{ property.name || '未命名属性' }}
              </div>
              <div class="text-[10px] text-slate-500">{{ property.valueType || 'string' }}</div>
            </div>
            <el-tag
              :type="property.type === 'parameter' ? 'success' : 'primary'"
              size="small"
              class="flex-shrink-0"
            >
              {{ property.type === 'parameter' ? 'Parameter' : 'Image' }}
            </el-tag>
          </div>
          <button
            class="ml-2 flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors"
            title="删除属性"
            @click.stop="removeProperty(index)"
          >
            <Delete :size="14" />
          </button>
        </div>
      </div>

      <div
        v-else
        class="flex flex-col items-center justify-center p-1 rounded-lg bg-slate-50 border-2 border-dashed border-slate-300 text-center cursor-pointer"
        :class="`border-${nodeColor}-400`"
        @click="addProperty"
      >
        <div class="mb-1 flex justify-center">
          <div class="rounded-full bg-emerald-100 p-2">
            <Plus :size="20" class="text-emerald-600" />
          </div>
        </div>
        <p class="text-sm font-medium text-slate-600">添加输入属性</p>
      </div>

      <div v-if="data && data.length > 0" class="mt-3">
        <button
          class="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-emerald-700 text-xs font-medium cursor-pointer"
          :class="`bg-${nodeColor}-50 text-${nodeColor}-700 hover:bg-${nodeColor}-100 transition-colors border border-${nodeColor}-200`"
          @click="addProperty"
        >
          <Plus :size="14" />
          添加新属性
        </button>
      </div>
    </div>

    <CustomHandle
      type="source"
      :position="Position.Right"
      :node-id="props.id"
      :show-tooltip="true"
    />
  </div>
</template>

<script setup lang="ts">
import { Position } from '@vue-flow/core'
import CustomHandle from '@/components/Workflow/Nodes/Handel/CustomHandle.vue'
import { TriangleAlert, Image, Delete, SlidersHorizontal, Plus } from 'lucide-vue-next'
import { useWorkflowStore } from '@/stores/workflow'
import { ref, watch, onMounted, computed } from 'vue'
import { getNodeType } from '@/components/Workflow/config/nodeTypes'
import { getIconComponent } from '@/components/Workflow/config/nodeConfig'

interface Property {
  name: string
  type: 'parameter' | 'image'
  valueType?: 'string' | 'number' | 'boolean' | 'array' | 'object' | undefined
  defaultValue?: string | undefined
}
const store = useWorkflowStore()
const props = defineProps<{
  id: string
  data: Array<Property>
  selected?: boolean
  type: string
}>()

const nodeType = computed(() => getNodeType(props.type))
const nodeColor = computed(() => nodeType.value?.color || 'blue')

const data = ref<Property[]>([])

const initializeProperties = () => {
  // 判断是否是空数组
  if (props.data.length === 0) {
    // 深拷贝配置
    data.value = []
  } else {
    data.value = JSON.parse(JSON.stringify(props.data))
  }
  updateIsShowTip()
}

const removeProperty = (index: number) => {
  data.value.splice(index, 1)
  updateNodeData()
  updateIsShowTip()
}

const addProperty = () => {
  data.value.push({
    name: data.value.length > 0 ? 'image' + (data.value.length + 1) : 'image',
    type: 'image',
  })
  updateNodeData()
}

const updateNodeData = () => {
  console.log('添加节点属性', JSON.parse(JSON.stringify(data.value)))
  store.updateNode(props.id, JSON.parse(JSON.stringify(data.value)))
  updateIsShowTip()
}

const isShowTip = ref(true)
const TipContent = ref('')
const updateIsShowTip = () => {
  if (data.value.length === 0) {
    TipContent.value = '输入节点至少添加一个输入参数'
    isShowTip.value = true
  } else {
    const hasEmptyName = data.value.some((prop) => !prop.name)
    if (hasEmptyName) {
      TipContent.value = '【属性名称】不能为空'
      isShowTip.value = true
    } else {
      isShowTip.value = false
    }
  }
}

onMounted(() => {
  initializeProperties()
})

watch(
  () => props.data,
  () => {
    initializeProperties()
  },
  { deep: true },
)
</script>
