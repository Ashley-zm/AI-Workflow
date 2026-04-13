<template>
  <div class="p-2 flex justify-center">
    <div class="flex items-center gap-2 bg-white rounded-lg shadow-md border border-gray-200 p-1">
      <!-- 撤销/重做组 -->
      <div class="flex items-center gap-1">
        <Tooltip text="撤销 (Ctrl+Z)">
          <button
            @click="$emit('undo')"
            :disabled="!canUndo"
            class="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Undo2 :size="16" />
          </button>
        </Tooltip>
        <Tooltip text="重做 (Ctrl+Y)">
          <button
            @click="$emit('redo')"
            :disabled="!canRedo"
            class="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Redo2 :size="16" />
          </button>
        </Tooltip>
      </div>

      <div class="w-px h-6 bg-gray-300"></div>

      <!-- 重新排列组 -->
      <div class="flex items-center gap-1">
        <Tooltip text="自动布局">
          <button
            @click="$emit('autoLayout')"
            class="p-2 rounded hover:bg-gray-100 transition-colors"
          >
            <Layout :size="16" />
          </button>
        </Tooltip>
      </div>

      <div class="w-px h-6 bg-gray-300"></div>

      <!-- 放大/缩小组 -->
      <div class="flex items-center gap-1">
        <Tooltip text="放大">
          <button @click="$emit('zoomIn')" class="p-2 rounded hover:bg-gray-100 transition-colors">
            <ZoomIn :size="16" />
          </button>
        </Tooltip>
        <Tooltip text="缩小">
          <button @click="$emit('zoomOut')" class="p-2 rounded hover:bg-gray-100 transition-colors">
            <ZoomOut :size="16" />
          </button>
        </Tooltip>
      </div>

      <div class="w-px h-6 bg-gray-300"></div>

      <!-- 锁定组 -->
      <div class="flex items-center gap-1">
        <Tooltip :text="isLocked ? '解锁画布' : '锁定画布'">
          <button
            @click="$emit('toggleLock')"
            class="p-2 rounded hover:bg-gray-100 transition-colors"
          >
            <Unlock v-if="!isLocked" :size="16" />
            <Lock v-else :size="16" />
          </button>
        </Tooltip>
      </div>

      <div class="w-px h-6 bg-gray-300"></div>

      <!-- 迷你地图和适合视图组 -->
      <div class="flex items-center gap-1">
        <Tooltip :text="showMinimap ? '隐藏迷你地图' : '显示迷你地图'">
          <button
            @click="$emit('toggleMinimap')"
            class="p-2 rounded hover:bg-gray-100 transition-colors"
          >
            <Map :size="16" />
          </button>
        </Tooltip>
        <Tooltip text="适合视图">
          <button @click="$emit('fitView')" class="p-2 rounded hover:bg-gray-100 transition-colors">
            <Maximize2 :size="16" />
          </button>
        </Tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Lock,
  Unlock,
  Map,
  Maximize2,
  Layout,
} from 'lucide-vue-next'
import Tooltip from './Tooltip.vue'

// 定义组件事件
const emit = defineEmits<{
  undo: []
  redo: []
  autoLayout: []
  zoomIn: []
  zoomOut: []
  toggleLock: []
  toggleMinimap: []
  fitView: []
}>()

// 定义组件属性
const props = defineProps<{
  canUndo: boolean
  canRedo: boolean
  isLocked: boolean
  showMinimap: boolean
}>()
</script>
