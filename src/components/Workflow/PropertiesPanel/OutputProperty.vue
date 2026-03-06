<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center gap-3 p-4 border-b border-gray-100">
      <div class="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
        <FileOutput :size="20" />
      </div>
      <div>
        <h3 class="font-bold text-gray-900">输出节点</h3>
        <p class="text-xs text-gray-500">查看最终结果及输入数据</p>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4 space-y-6">
      <!-- Basic Config -->
      <div class="space-y-3">
        <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">节点名称</label>
        <input
          v-model="nodeLabel"
          type="text"
          class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
          placeholder="命名该节点..."
        />
      </div>

      <div class="h-px bg-gray-100"></div>

      <!-- Input Data -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">输入数据详情</label>
          <span class="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
            {{ sourceNodes.length }} Sources
          </span>
        </div>

        <div v-if="sourceNodes.length > 0" class="space-y-4">
          <div
            v-for="node in sourceNodes"
            :key="node.id"
            class="group border border-gray-200 rounded-xl overflow-hidden hover:border-purple-200 transition-colors"
          >
            <div class="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between group-hover:bg-purple-50/50 transition-colors">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-green-500"></div>
                <span class="text-xs font-semibold text-gray-700">{{ node.data?.label || node.type }}</span>
              </div>
              <span class="text-[10px] font-mono text-gray-400">ID: {{ node.id }}</span>
            </div>
            
            <div class="p-3 bg-white">
              <div class="relative">
                <pre class="text-[10px] leading-relaxed font-mono text-gray-600 overflow-x-auto whitespace-pre-wrap break-all">{{ JSON.stringify(node.data, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="flex flex-col items-center justify-center py-8 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
          <div class="text-gray-300 mb-2">
            <Link :size="24" />
          </div>
          <p class="text-xs text-gray-500 font-medium">暂无连接</p>
          <p class="text-[10px] text-gray-400 mt-1">请将其他节点连接至此节点以查看数据</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FileOutput, Link } from 'lucide-vue-next'
import { useVueFlow, type Node } from '@vue-flow/core'

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
  }
})

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
        // 递归查找更深层的祖先节点
        findAncestors(sourceNode.id)
        // 在其父节点被添加后，再添加节点本身，以确保从根到叶的顺序
        if (!ancestors.has(sourceNode.id)) {
          ancestors.set(sourceNode.id, sourceNode)
        }
      }
    }
  }

  findAncestors(props.nodeId)
  return Array.from(ancestors.values())
})
</script>