<template>
  <div class="relative inline-block">
    <div @mouseenter="showTooltip" @mouseleave="hideTooltip" @click="handleClick">
      <slot />
    </div>

    <!-- 悬浮提示 -->
    <transition name="tooltip-fade">
      <div
        v-if="visible"
        class="absolute z-50 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg whitespace-nowrap pointer-events-none"
        :style="tooltipStyle"
      >
        {{ text }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CSSProperties } from 'vue'

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

const props = withDefaults(
  defineProps<{
    text: string
    position?: TooltipPosition
  }>(),
  {
    position: 'top',
  },
)

const visible = ref(false)

const tooltipStyle = computed<CSSProperties>(() => {
  switch (props.position) {
    case 'bottom':
      return {
        top: 'calc(100% + 8px)',
        left: '50%',
        transform: 'translateX(-50%)',
      }
    case 'left':
      return {
        right: 'calc(100% + 8px)',
        top: '50%',
        transform: 'translateY(-50%)',
      }
    case 'right':
      return {
        left: 'calc(100% + 8px)',
        top: '50%',
        transform: 'translateY(-50%)',
      }
    case 'top':
    default:
      return {
        bottom: 'calc(100% + 8px)',
        left: '50%',
        transform: 'translateX(-50%)',
      }
  }
})

const showTooltip = () => {
  visible.value = true
}

const hideTooltip = () => {
  visible.value = false
}

const handleClick = () => {
  // 不阻止事件冒泡，让子元素处理点击事件
}
</script>

<style scoped>
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}
</style>
