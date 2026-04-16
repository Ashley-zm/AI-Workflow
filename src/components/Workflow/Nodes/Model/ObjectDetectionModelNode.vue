<template>
  <div class="group relative pt-5">
    <div
      class="hidden shadow-lg border border-red-100 group-hover:block absolute -top-2 right-2 bg-white text-red-400 p-1.5 rounded-md cursor-pointer hover:bg-red-200 transition-colors"
      @click.stop="deleteNode"
      title="删除节点"
    >
      <Trash :size="14" />
    </div>
    <div
      class="group relative w-[250px] bg-white rounded-xl border border-gray-200 shadow transition-all"
      :class="[selected ? `shadow-xl` : `hover:shadow-xl`]"
    >
      <div class="flex items-center justify-between p-3 rounded-t-xl border-b border-gray-200">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center"
            :class="getIconStyle(nodeType?.color)"
          >
            <component :size="18" :is="getIconComponent(nodeType?.icon || 'BotIcon')" />
          </div>
          <div class="flex flex-col">
            <div :class="`text-[10px] rounded-full uppercase font-bold text-${nodeColor}-600`">
              {{ props.id || 'Model' }}
            </div>
            <p class="text-xs text-gray-500 tracking-[1px]">
              {{ nodeType?.description || 'Model 节点' }}
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

      <div class="p-2 space-y-2" v-if="selected">
        <div class="flex items-center justify-between p-1.5 rounded-lg border border-slate-100">
          <div class="flex items-center gap-2.5 flex-1 min-w-0">
            <div
              class="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center bg-emerald-500"
            >
              <Image :size="14" class="text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-[10px] text-slate-400 tracking-[1px]">图片</div>
              <div class="text-xs font-medium text-slate-600 truncate">
                {{ props.data?.images || '请选择图片...' }}
              </div>
            </div>
          </div>
          <div
            v-if="props.data?.images"
            class="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"
          >
            <CheckCircle :size="12" class="text-emerald-600" />
          </div>
          <div
            v-else
            class="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center"
          >
            <AlertCircle :size="12" class="text-amber-600" />
          </div>
        </div>

        <div class="flex items-center justify-between p-1 rounded-lg border border-slate-100">
          <div class="flex items-center gap-2.5 flex-1 min-w-0">
            <div
              class="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center bg-blue-500"
            >
              <Brain :size="14" class="text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-[10px] text-slate-400 tracking-[1px]">模型</div>
              <div class="text-xs font-medium text-slate-500 truncate">
                {{ props.data?.model_name || '请选择模型...' }}
              </div>
            </div>
          </div>
          <div
            v-if="props.data?.model_name"
            class="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center"
          >
            <CheckCircle :size="12" class="text-emerald-600" />
          </div>
          <div
            v-else
            class="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center"
          >
            <AlertCircle :size="12" class="text-amber-600" />
          </div>
        </div>
      </div>

      <CustomHandle type="target" :position="Position.Left" :node-id="props.id" />
      <CustomHandle
        type="source"
        :position="Position.Right"
        :node-id="props.id"
        :show-tooltip="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref, onMounted } from 'vue'
import { Position } from '@vue-flow/core'
import CustomHandle from '@/components/Workflow/Nodes/Handel/CustomHandle.vue'
import { useWorkflowStore } from '@/stores/workflow'
import { TriangleAlert, Trash, Image, Brain, CheckCircle, AlertCircle } from 'lucide-vue-next'
import { getIconComponent, getIconStyle } from '@/components/Workflow/config/nodeConfig'
import { getNodeType } from '@/components/Workflow/config/nodeTypes'

const store = useWorkflowStore()
const props = defineProps<{
  id: string
  name: string
  data: any
  type: string
}>()
const nodeType = computed(() => getNodeType(props.type))
const nodeColor = computed(() => nodeType.value?.color || 'blue')
const selected = computed(() => store.selectedNode?.id === props.id)

const deleteNode = () => {
  store.removeNode(props.id)
  store.setSelectedNode(null)
}

const isShowTip = ref(true)
const TipContent = ref('')
const updateIsShowTip = () => {
  if (!props.data?.images) {
    TipContent.value = '请选择图片'
    isShowTip.value = true
  } else if (!props.data?.model_name) {
    TipContent.value = '请选择模型'
    isShowTip.value = true
  } else if (!props.data?.device) {
    TipContent.value = '请选择设备'
    isShowTip.value = true
  } else if (props.data?.is_latest === 0 && !props.data.model_version_id) {
    TipContent.value = '请选择模型版本'
    isShowTip.value = true
  } else {
    isShowTip.value = false
  }
}

onMounted(() => {
  updateIsShowTip()
})

watch(
  () => props.data,
  () => {
    updateIsShowTip()
  },
  { deep: true },
)
</script>
