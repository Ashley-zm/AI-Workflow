<template>
  <div class="absolute right-4 top-4 z-20 flex items-center gap-2">
    <div class="flex items-center gap-1 rounded-lg bg-white border border-slate-200 shadow-sm p-1">
      <Tooltip text="保存工作流 (Ctrl+S)">
        <button
          @click="$emit('save')"
          class="p-2 rounded hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-800"
        >
          <Save :size="16" />
        </button>
      </Tooltip>

      <Tooltip text="导出工作流">
        <button
          @click="$emit('export')"
          class="p-2 rounded hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-800"
        >
          <Download :size="16" />
        </button>
      </Tooltip>

      <Tooltip text="导入工作流">
        <button
          @click="$emit('import')"
          class="p-2 rounded hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-800"
        >
          <Upload :size="16" />
        </button>
      </Tooltip>

      <div class="w-px h-6 bg-slate-200"></div>

      <Tooltip text="历史操作记录">
        <button
          @click="$emit('toggleHistory')"
          class="p-2 rounded hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-800"
        >
          <History :size="16" />
        </button>
      </Tooltip>

      <div class="w-px h-6 bg-slate-200"></div>

      <Tooltip text="图健康检查">
        <button
          @click="$emit('healthCheck')"
          class="p-2 rounded hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-800"
        >
          <Activity :size="16" />
        </button>
      </Tooltip>

      <Tooltip text="清空画布">
        <button
          @click="$emit('clearCanvas')"
          class="p-2 rounded hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-800"
        >
          <Trash2 :size="16" />
        </button>
      </Tooltip>

      <div class="w-px h-6 bg-slate-200"></div>

      <Tooltip text="调试工作流">
        <button
          @click="$emit('debug')"
          class="p-2 rounded bg-blue-500 hover:bg-blue-600 transition-colors text-white flex items-center gap-1"
        >
          <Bug :size="16" />
          <span class="text-xs font-medium">调试</span>
        </button>
      </Tooltip>

      <div class="w-px h-6 bg-slate-200"></div>

      <Tooltip text="设置">
        <button
          @click="$emit('openSettings')"
          class="p-2 rounded hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-800"
        >
          <Settings :size="16" />
        </button>
      </Tooltip>

      <Tooltip text="帮助">
        <button
          @click="$emit('openHelp')"
          class="p-2 rounded hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-800"
        >
          <HelpCircle :size="16" />
        </button>
      </Tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Save,
  Download,
  Upload,
  Activity,
  Trash2,
  Settings,
  HelpCircle,
  Bug,
  History,
} from 'lucide-vue-next'
import Tooltip from './Tooltip.vue'

defineEmits<{
  save: []
  export: []
  import: []
  healthCheck: []
  clearCanvas: []
  debug: []
  openSettings: []
  openHelp: []
  toggleHistory: []
}>()
</script>
