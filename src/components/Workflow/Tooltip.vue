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
        style="bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%);"
      >
        {{ text }}
        <!-- 小箭头 -->
        <div 
          class="absolute w-2 h-2 bg-gray-800 transform rotate-45"
          style="bottom: -4px; left: 50%; transform: translateX(-50%) rotate(45deg);"
        ></div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  text: string
}>()

const visible = ref(false)

const showTooltip = () => {
  visible.value = true
}

const hideTooltip = () => {
  visible.value = false
}

const handleClick = (event: MouseEvent) => {
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