<template>
  <div
    class="w-[480px] max-h-[90vh] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
  >
    <!-- 顶部标题栏 -->
    <div
      class="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-3"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md"
        >
          <Bug :size="18" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-slate-800">调试面板</h3>
          <p class="text-[11px] text-slate-500">工作流调试与诊断工具</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="debugState === 'running'"
          class="inline-flex items-center gap-1 rounded-lg bg-red-100 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-200 transition-colors"
          @click="handleStopDebug"
        >
          <Square :size="12" />
          停止
        </button>
        <button
          class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          title="重置所有输入"
          @click="handleResetInputs"
        >
          <RotateCcw :size="16" />
        </button>
        <button
          class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          title="关闭面板"
          @click="$emit('close')"
        >
          <X :size="18" />
        </button>
      </div>
    </div>

    <div class="max-h-[calc(90vh-120px)] overflow-y-auto">
      <!-- 统计概览 -->
      <section class="border-b border-slate-100 bg-slate-50/50 px-4 py-3">
        <div class="mb-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="h-4 w-0.5 rounded-full bg-blue-500"></span>
            <span class="text-xs font-semibold text-slate-700">统计概览</span>
          </div>
          <div
            class="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
            :class="
              graphStatus.isConnected
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            "
          >
            <component :is="graphStatus.isConnected ? CheckCircle : AlertTriangle" :size="12" />
            {{ graphStatus.isConnected ? '拓扑正常' : '存在警告' }}
          </div>
        </div>

        <div class="grid grid-cols-4 gap-3">
          <div class="rounded-lg bg-white p-2.5 text-center shadow-sm border border-slate-100">
            <div class="text-lg font-bold text-blue-600">{{ nodes.length }}</div>
            <div class="text-[10px] text-slate-500">节点</div>
          </div>
          <div class="rounded-lg bg-white p-2.5 text-center shadow-sm border border-slate-100">
            <div class="text-lg font-bold text-emerald-600">{{ edges.length }}</div>
            <div class="text-[10px] text-slate-500">边</div>
          </div>
          <div class="rounded-lg bg-white p-2.5 text-center shadow-sm border border-slate-100">
            <div class="text-lg font-bold text-purple-600">{{ historyLength }}</div>
            <div class="text-[10px] text-slate-500">历史</div>
          </div>
          <div class="rounded-lg bg-white p-2.5 text-center shadow-sm border border-slate-100">
            <div class="text-lg font-bold text-amber-600">{{ inputProperties.length }}</div>
            <div class="text-[10px] text-slate-500">输入</div>
          </div>
        </div>
      </section>

      <!-- 图健康检查 -->
      <section class="border-b border-slate-100 px-4 py-3">
        <div class="mb-3 flex items-center gap-2">
          <span class="h-4 w-0.5 rounded-full bg-amber-500"></span>
          <span class="text-xs font-semibold text-slate-700">图健康检查</span>
        </div>

        <div class="space-y-2">
          <div
            v-if="graphStatus.orphanNodes.length"
            class="flex items-start gap-2 rounded-lg bg-red-50 p-2.5 border border-red-100"
          >
            <AlertCircle :size="14" class="text-red-500 mt-0.5 flex-shrink-0" />
            <div class="flex-1">
              <div class="text-xs font-medium text-red-700">孤立节点</div>
              <div class="text-[10px] text-red-600 mt-0.5">
                {{ graphStatus.orphanNodes.join(', ') }}
              </div>
            </div>
          </div>

          <div
            v-if="graphStatus.danglingEdges.length"
            class="flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 border border-amber-100"
          >
            <AlertTriangle :size="14" class="text-amber-500 mt-0.5 flex-shrink-0" />
            <div class="flex-1">
              <div class="text-xs font-medium text-amber-700">悬空边</div>
              <div class="text-[10px] text-amber-600 mt-0.5">
                {{ graphStatus.danglingEdges.join(', ') }}
              </div>
            </div>
          </div>

          <div
            v-if="graphStatus.deadEndNodes.length"
            class="flex items-start gap-2 rounded-lg bg-orange-50 p-2.5 border border-orange-100"
          >
            <AlertTriangle :size="14" class="text-orange-500 mt-0.5 flex-shrink-0" />
            <div class="flex-1">
              <div class="text-xs font-medium text-orange-700">死路节点</div>
              <div class="text-[10px] text-orange-600 mt-0.5">
                {{ graphStatus.deadEndNodes.join(', ') }}
              </div>
            </div>
          </div>

          <div
            v-if="
              !graphStatus.orphanNodes.length &&
              !graphStatus.danglingEdges.length &&
              !graphStatus.deadEndNodes.length
            "
            class="flex items-center gap-2 rounded-lg bg-emerald-50 p-2.5 border border-emerald-100"
          >
            <CheckCircle :size="14" class="text-emerald-500" />
            <div class="text-xs font-medium text-emerald-700">未发现明显结构问题</div>
          </div>
        </div>
      </section>

      <!-- 输入数据调试 -->
      <section class="border-b border-slate-100 px-4 py-3">
        <div class="mb-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="h-4 w-0.5 rounded-full bg-emerald-500"></span>
            <span class="text-xs font-semibold text-slate-700">输入数据调试</span>
          </div>
          <span class="text-[10px] text-slate-400">{{ inputProperties.length }} 个输入口</span>
        </div>

        <div v-if="inputProperties.length === 0" class="rounded-lg bg-slate-50 p-4 text-center">
          <div class="mb-2 flex justify-center">
            <div class="rounded-full bg-slate-200 p-2">
              <AlertCircle :size="24" class="text-slate-400" />
            </div>
          </div>
          <p class="text-xs text-slate-500">未在输入节点上配置属性</p>
          <p class="text-[10px] text-slate-400 mt-1">请先在 Inputs 节点中添加输入属性</p>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="prop in inputProperties"
            :key="prop.name"
            class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-blue-300"
          >
            <div class="mb-2 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div
                  class="flex h-6 w-6 items-center justify-center rounded-md"
                  :class="getTypeIconClass(prop.type, prop.valueType)"
                >
                  <component
                    :is="getTypeIcon(prop.type, prop.valueType)"
                    :size="12"
                    class="text-white"
                  />
                </div>
                <div>
                  <div class="text-xs font-medium text-slate-700">
                    {{ prop.name || '未命名属性' }}
                  </div>
                  <div class="text-[10px] text-slate-400">
                    {{ prop.type }} · {{ prop.valueType }}
                  </div>
                </div>
              </div>
              <button
                class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                title="重置此输入"
                @click="handleResetInput(prop)"
              >
                <RotateCcw :size="12" />
              </button>
            </div>

            <!-- 图片类型输入 -->
            <template v-if="prop.type === 'image'">
              <div class="space-y-2">
                <!-- 图片预览 -->
                <div
                  v-if="getImagePreview(prop.name)"
                  class="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50"
                >
                  <img
                    :src="getImagePreview(prop.name) || undefined"
                    class="w-full h-32 object-contain bg-checkerboard"
                    @error="handleImageError(prop.name)"
                  />
                  <button
                    class="absolute top-2 right-2 rounded-md bg-black/50 p-1 text-white hover:bg-black/70 transition-colors"
                    @click="clearImageInput(prop.name)"
                  >
                    <X :size="12" />
                  </button>
                  <div
                    v-if="imageInputType[prop.name] === 'base64'"
                    class="absolute bottom-2 left-2 rounded bg-blue-500 px-1.5 py-0.5 text-[10px] text-white"
                  >
                    Base64
                  </div>
                  <div
                    v-else
                    class="absolute bottom-2 left-2 rounded bg-purple-500 px-1.5 py-0.5 text-[10px] text-white"
                  >
                    URL
                  </div>
                </div>

                <!-- 输入方式选择 -->
                <div class="flex gap-2">
                  <button
                    class="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                    @click="triggerFileInput(prop.name)"
                  >
                    <Upload :size="14" />
                    上传图片
                  </button>
                  <input
                    :ref="(el) => setFileInputRef(prop.name, el as HTMLInputElement)"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="(e) => handleImageUpload(prop.name, e)"
                  />
                </div>

                <!-- URL 输入 -->
                <div class="relative">
                  <input
                    :value="getImageUrl(prop.name)"
                    placeholder="或输入图片 URL 地址"
                    class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 pr-8 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    @input="
                      handleImageUrlInput(prop.name, ($event.target as HTMLInputElement).value)
                    "
                  />
                  <div class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                    <Link :size="14" />
                  </div>
                </div>
              </div>
            </template>

            <!-- 其他类型输入 -->
            <template v-else>
              <label
                v-if="prop.valueType === 'boolean'"
                class="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <span class="text-xs text-slate-600">布尔值开关</span>
                <div
                  class="relative h-5 w-9 cursor-pointer rounded-full transition-colors"
                  :class="inputValues[prop.name] ? 'bg-blue-500' : 'bg-slate-300'"
                  @click="onInputChange(prop, !inputValues[prop.name])"
                >
                  <div
                    class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform"
                    :class="inputValues[prop.name] ? 'translate-x-4' : 'translate-x-0.5'"
                  />
                </div>
              </label>

              <div v-else-if="prop.valueType === 'number'" class="relative">
                <input
                  type="number"
                  :value="getDisplayValue(prop)"
                  :placeholder="`数字，默认值：${prop.defaultValue ?? ''}`"
                  class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 pr-8 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  @input="onInputChange(prop, ($event.target as HTMLInputElement).value)"
                />
                <div class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                  <Hash :size="14" />
                </div>
              </div>

              <div
                v-else-if="prop.valueType === 'array' || prop.valueType === 'object'"
                class="space-y-1.5"
              >
                <textarea
                  :value="getDisplayValue(prop)"
                  :placeholder="`请输入合法 JSON，默认值：${prop.defaultValue ?? ''}`"
                  rows="3"
                  class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all font-mono"
                  @change="onInputChange(prop, ($event.target as HTMLTextAreaElement).value)"
                />
                <div class="flex items-center justify-between">
                  <p class="text-[10px] text-slate-400">例如 [1,2,3] 或 {"k":"v"}</p>
                  <button
                    class="text-[10px] text-blue-500 hover:text-blue-700 transition-colors"
                    @click="formatJsonInput(prop)"
                  >
                    格式化 JSON
                  </button>
                </div>
              </div>

              <div v-else class="relative">
                <input
                  :value="getDisplayValue(prop)"
                  :placeholder="`文本，默认值：${prop.defaultValue ?? ''}`"
                  class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 pr-8 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  @input="onInputChange(prop, ($event.target as HTMLInputElement).value)"
                />
                <div class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                  <Type :size="14" />
                </div>
              </div>
            </template>
          </div>
        </div>
      </section>

      <!-- 调试输出结果 -->
      <section class="border-b border-slate-100 px-4 py-3">
        <div class="mb-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="h-4 w-0.5 rounded-full bg-purple-500"></span>
            <span class="text-xs font-semibold text-slate-700">调试输出</span>
          </div>
          <div v-if="debugState !== 'idle'" class="flex items-center gap-2">
            <div
              v-if="debugState === 'running'"
              class="flex items-center gap-1.5 text-[10px] text-blue-600"
            >
              <Loader2 :size="12" class="animate-spin" />
              执行中...
            </div>
            <button
              v-if="debugOutput.length > 0"
              class="text-[10px] text-blue-500 hover:text-blue-700 transition-colors"
              @click="clearDebugOutput"
            >
              清空输出
            </button>
          </div>
        </div>

        <!-- 空状态 -->
        <div
          v-if="debugOutput.length === 0 && debugState === 'idle'"
          class="rounded-lg bg-slate-50 p-6 text-center"
        >
          <div class="mb-2 flex justify-center">
            <div class="rounded-full bg-slate-200 p-3">
              <Terminal :size="24" class="text-slate-400" />
            </div>
          </div>
          <p class="text-xs text-slate-500">点击"开始调试"执行工作流</p>
          <p class="text-[10px] text-slate-400 mt-1">输出结果将在此处显示</p>
        </div>

        <!-- 执行中状态 -->
        <div
          v-else-if="debugState === 'running'"
          class="rounded-lg bg-blue-50 border border-blue-100 p-4"
        >
          <div class="flex items-center gap-3">
            <div class="relative">
              <div class="h-8 w-8 rounded-full border-2 border-blue-200"></div>
              <div
                class="absolute inset-0 h-8 w-8 animate-spin rounded-full border-2 border-transparent border-t-blue-500"
              ></div>
            </div>
            <div>
              <div class="text-xs font-medium text-blue-700">正在执行工作流...</div>
              <div class="text-[10px] text-blue-500 mt-0.5">
                {{ currentExecutingNode || '准备中' }}
              </div>
            </div>
          </div>
          <div class="mt-3 h-1.5 w-full rounded-full bg-blue-100 overflow-hidden">
            <div
              class="h-full bg-blue-500 transition-all duration-300"
              :style="{ width: `${executionProgress}%` }"
            ></div>
          </div>
        </div>

        <!-- 输出结果列表 -->
        <div v-else-if="debugOutput.length > 0" class="space-y-2">
          <div
            v-for="(output, index) in debugOutput"
            :key="index"
            class="rounded-lg border bg-white overflow-hidden"
            :class="{
              'border-emerald-200': output.status === 'success',
              'border-red-200': output.status === 'error',
              'border-amber-200': output.status === 'warning',
            }"
          >
            <!-- 输出头部 -->
            <div
              class="flex items-center justify-between px-3 py-2"
              :class="{
                'bg-emerald-50': output.status === 'success',
                'bg-red-50': output.status === 'error',
                'bg-amber-50': output.status === 'warning',
              }"
            >
              <div class="flex items-center gap-2">
                <component
                  :is="
                    output.status === 'success'
                      ? CheckCircle
                      : output.status === 'error'
                        ? XCircle
                        : AlertTriangle
                  "
                  :size="14"
                  :class="{
                    'text-emerald-500': output.status === 'success',
                    'text-red-500': output.status === 'error',
                    'text-amber-500': output.status === 'warning',
                  }"
                />
                <span
                  class="text-xs font-medium"
                  :class="{
                    'text-emerald-700': output.status === 'success',
                    'text-red-700': output.status === 'error',
                    'text-amber-700': output.status === 'warning',
                  }"
                >
                  {{ output.nodeName }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] text-slate-400">{{ output.duration }}ms</span>
                <button
                  class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  @click="toggleOutputDetail(index)"
                >
                  <ChevronDown
                    :size="12"
                    class="transition-transform"
                    :class="{ 'rotate-180': outputDetailExpanded[index] }"
                  />
                </button>
              </div>
            </div>

            <!-- 输出内容 -->
            <div v-if="outputDetailExpanded[index]" class="p-3 border-t border-slate-100">
              <!-- 输出数据 -->
              <div v-if="output.data" class="mb-2">
                <div class="text-[10px] font-medium text-slate-500 mb-1">输出数据</div>
                <div class="rounded-lg bg-slate-50 p-2 max-h-48 overflow-auto">
                  <pre class="text-[10px] text-slate-700 font-mono whitespace-pre-wrap">{{
                    formatOutputData(output.data)
                  }}</pre>
                </div>
              </div>

              <!-- 图片输出 -->
              <div v-if="output.images && output.images.length > 0" class="mb-2">
                <div class="text-[10px] font-medium text-slate-500 mb-1">输出图片</div>
                <div class="grid grid-cols-2 gap-2">
                  <div
                    v-for="(img, imgIndex) in output.images"
                    :key="imgIndex"
                    class="rounded-lg overflow-hidden border border-slate-200 bg-slate-50"
                  >
                    <img
                      :src="img"
                      class="w-full h-24 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                      @click="previewImage(img)"
                    />
                  </div>
                </div>
              </div>

              <!-- 错误信息 -->
              <div v-if="output.error" class="mb-2">
                <div class="text-[10px] font-medium text-red-500 mb-1">错误信息</div>
                <div class="rounded-lg bg-red-50 p-2 border border-red-100">
                  <pre class="text-[10px] text-red-600 font-mono whitespace-pre-wrap">{{
                    output.error
                  }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 执行日志 -->
      <section v-if="executionLogs.length > 0" class="border-b border-slate-100 px-4 py-3">
        <div class="mb-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="h-4 w-0.5 rounded-full bg-slate-400"></span>
            <span class="text-xs font-semibold text-slate-700">执行日志</span>
          </div>
          <button
            class="text-[10px] text-blue-500 hover:text-blue-700 transition-colors"
            @click="clearExecutionLogs"
          >
            清空日志
          </button>
        </div>

        <div class="rounded-lg bg-slate-900 p-3 max-h-32 overflow-auto">
          <div
            v-for="(log, index) in executionLogs"
            :key="index"
            class="flex items-start gap-2 mb-1"
          >
            <span class="text-[10px] text-slate-500 font-mono">{{ log.time }}</span>
            <span
              class="text-[10px] font-mono"
              :class="{
                'text-emerald-400': log.level === 'info',
                'text-amber-400': log.level === 'warn',
                'text-red-400': log.level === 'error',
              }"
            >
              {{ log.message }}
            </span>
          </div>
        </div>
      </section>
    </div>

    <!-- 底部操作栏 -->
    <div class="border-t border-slate-200 bg-slate-50 px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="text-[10px] text-slate-500">
          <span class="font-medium">{{ canStartDebug ? '就绪' : '未就绪' }}</span>
          · {{ inputProperties.length }} 个输入 · {{ nodes.length }} 个节点
        </div>
        <button
          class="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-xs font-medium text-white shadow-md hover:from-blue-600 hover:to-blue-700 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-500 transition-all"
          :disabled="!canStartDebug || debugState === 'running'"
          @click="handleStartDebug"
        >
          <Play :size="14" />
          开始调试
        </button>
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <Teleport to="body">
      <div
        v-if="showImagePreview"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        @click="showImagePreview = false"
      >
        <img :src="previewImageUrl" class="max-w-[90vw] max-h-[90vh] object-contain" />
        <button
          class="absolute top-4 right-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
          @click="showImagePreview = false"
        >
          <X :size="20" />
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, reactive } from 'vue'
import type { Node, Edge } from '@vue-flow/core'
import {
  Bug,
  X,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Image,
  Hash,
  Type,
  Play,
  FileText,
  Database,
  ToggleLeft,
  Upload,
  Link,
  Terminal,
  Loader2,
  ChevronDown,
  XCircle,
  Square,
} from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import axios from 'axios'

interface DebugOutput {
  nodeId: string
  nodeName: string
  status: 'success' | 'error' | 'warning'
  duration: number
  data?: any
  images?: string[]
  error?: string
}

interface ExecutionLog {
  time: string
  level: 'info' | 'warn' | 'error'
  message: string
}

const props = defineProps<{
  nodes: Node[]
  edges: Edge[]
  selectedNode: Node | null
  historyLength: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (
    e: 'start-debug',
    payload: { inputValues: Record<string, any>; nodes: Node[]; edges: Edge[] },
  ): void
}>()

const debugState = ref<'idle' | 'running' | 'completed'>('idle')
const debugOutput = ref<DebugOutput[]>([])
const executionLogs = ref<ExecutionLog[]>([])
const outputDetailExpanded = ref<Record<number, boolean>>({})
const currentExecutingNode = ref('')
const executionProgress = ref(0)
const abortController = ref<AbortController | null>(null)

const showImagePreview = ref(false)
const previewImageUrl = ref('')

const inputNode = computed(() => props.nodes.find((n) => n.type === 'inputs') || null)
const inputProperties = computed<any[]>(() => {
  const data: any = inputNode.value?.data || {}
  const properties = data.properties || data.config || []
  return Array.isArray(properties) ? properties : []
})

const inputValues = ref<Record<string, any>>({})
const imageInputType = ref<Record<string, 'base64' | 'url'>>({})
const fileInputRefs = ref<Record<string, HTMLInputElement | null>>({})

const setFileInputRef = (name: string, el: HTMLInputElement | null) => {
  if (el) {
    fileInputRefs.value[name] = el
  }
}

const getTypeIcon = (type: string, valueType: string) => {
  if (type === 'image') return Image
  if (valueType === 'boolean') return ToggleLeft
  if (valueType === 'number') return Hash
  if (valueType === 'array' || valueType === 'object') return Database
  return FileText
}

const getTypeIconClass = (type: string, valueType: string) => {
  if (type === 'image') return 'bg-purple-500'
  if (valueType === 'boolean') return 'bg-green-500'
  if (valueType === 'number') return 'bg-blue-500'
  if (valueType === 'array' || valueType === 'object') return 'bg-orange-500'
  return 'bg-slate-500'
}

const initInputValues = (preserveExisting: boolean = false) => {
  const nodeData: any = inputNode.value?.data || {}
  const existingValues: Record<string, any> = nodeData.inputValues || {}
  const result: Record<string, any> = {}

  inputProperties.value.forEach((prop: any) => {
    const name = prop.name || ''
    if (!name) return

    if (preserveExisting && name in inputValues.value && inputValues.value[name]) {
      result[name] = inputValues.value[name]
      return
    }

    if (name in existingValues) {
      result[name] = existingValues[name]
      return
    }

    const raw = prop.defaultValue ?? ''
    if (prop.type === 'image') {
      result[name] = String(raw ?? '')
      imageInputType.value[name] = raw?.startsWith('data:') ? 'base64' : 'url'
    } else {
      switch (prop.valueType) {
        case 'number':
          result[name] = raw === '' ? null : Number(raw)
          break
        case 'boolean':
          result[name] = raw === 'true' || raw === true
          break
        case 'array':
        case 'object':
          try {
            result[name] = raw ? JSON.parse(raw) : prop.valueType === 'array' ? [] : {}
          } catch {
            result[name] = prop.valueType === 'array' ? [] : {}
          }
          break
        default:
          result[name] = String(raw ?? '')
      }
    }
  })

  inputValues.value = result
}

const getDisplayValue = (prop: any) => {
  const name = prop.name || ''
  const value = inputValues.value[name]
  if (value === undefined || value === null) return ''

  if (prop.type === 'image') {
    return String(value)
  }

  if (prop.valueType === 'array' || prop.valueType === 'object') {
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return String(value)
    }
  }

  if (prop.valueType === 'boolean') {
    return value ? 'true' : 'false'
  }

  return String(value)
}

const onInputChange = (prop: any, raw: any) => {
  const name = prop.name || ''
  if (!name) return

  let parsed: any = raw

  if (prop.type === 'image') {
    parsed = String(raw ?? '')
  } else {
    switch (prop.valueType) {
      case 'number': {
        const n = Number(raw)
        parsed = Number.isNaN(n) ? null : n
        break
      }
      case 'boolean':
        parsed = Boolean(raw)
        break
      case 'array':
      case 'object':
        try {
          parsed = raw ? JSON.parse(raw as string) : prop.valueType === 'array' ? [] : {}
        } catch {
          parsed = raw
        }
        break
      default:
        parsed = String(raw ?? '')
    }
  }

  inputValues.value = {
    ...inputValues.value,
    [name]: parsed,
  }
}

const triggerFileInput = (name: string) => {
  fileInputRefs.value[name]?.click()
}

const handleImageUpload = (name: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const base64 = e.target?.result as string
    inputValues.value = {
      ...inputValues.value,
      [name]: base64,
    }
    imageInputType.value[name] = 'base64'
    addExecutionLog('info', `图片已上传: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`)
  }
  reader.readAsDataURL(file)

  target.value = ''
}

const handleImageUrlInput = (name: string, url: string) => {
  inputValues.value = {
    ...inputValues.value,
    [name]: url,
  }
  imageInputType.value[name] = 'url'
}

const getImagePreview = (name: string): string | null => {
  const value = inputValues.value[name]
  if (!value) return null

  if (value.startsWith('data:')) {
    return value
  }

  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
    return value
  }

  return null
}

const getImageUrl = (name: string): string => {
  const value = inputValues.value[name]
  if (!value) return ''
  if (value.startsWith('data:')) return ''
  return value
}

const clearImageInput = (name: string) => {
  inputValues.value = {
    ...inputValues.value,
    [name]: '',
  }
  delete imageInputType.value[name]
}

const handleImageError = (name: string) => {
  addExecutionLog('warn', `图片加载失败: ${name}`)
}

const handleResetInput = (prop: any) => {
  const name = prop.name || ''
  if (!name) return

  const raw = prop.defaultValue ?? ''
  let parsed: any

  if (prop.type === 'image') {
    parsed = String(raw ?? '')
    imageInputType.value[name] = raw?.startsWith('data:') ? 'base64' : 'url'
  } else {
    switch (prop.valueType) {
      case 'number':
        parsed = raw === '' ? null : Number(raw)
        break
      case 'boolean':
        parsed = raw === 'true' || raw === true
        break
      case 'array':
      case 'object':
        try {
          parsed = raw ? JSON.parse(raw) : prop.valueType === 'array' ? [] : {}
        } catch {
          parsed = prop.valueType === 'array' ? [] : {}
        }
        break
      default:
        parsed = String(raw ?? '')
    }
  }

  inputValues.value = {
    ...inputValues.value,
    [name]: parsed,
  }
}

const handleResetInputs = () => {
  initInputValues(false)
  imageInputType.value = {}
}

const formatJsonInput = (prop: any) => {
  const name = prop.name || ''
  if (!name) return

  const value = inputValues.value[name]
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      inputValues.value = {
        ...inputValues.value,
        [name]: JSON.stringify(parsed, null, 2),
      }
    } catch {
      console.error('JSON 格式错误')
    }
  }
}

const addExecutionLog = (level: 'info' | 'warn' | 'error', message: string) => {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`
  executionLogs.value.push({ time, level, message })
}

const clearDebugOutput = () => {
  debugOutput.value = []
  outputDetailExpanded.value = {}
}

const clearExecutionLogs = () => {
  executionLogs.value = []
}

const toggleOutputDetail = (index: number) => {
  outputDetailExpanded.value[index] = !outputDetailExpanded.value[index]
}

const formatOutputData = (data: any): string => {
  try {
    return JSON.stringify(data, null, 2)
  } catch {
    return String(data)
  }
}

const previewImage = (url: string) => {
  previewImageUrl.value = url
  showImagePreview.value = true
}

const canStartDebug = computed(() => {
  return inputProperties.value.length > 0 && graphStatus.value.isConnected
})

const graphStatus = computed(() => {
  const nodeIds = new Set(props.nodes.map((n) => n.id))

  const incoming: Record<string, number> = {}
  const outgoing: Record<string, number> = {}
  props.nodes.forEach((n) => {
    const id = n.id as string
    incoming[id] = 0
    outgoing[id] = 0
  })

  props.edges.forEach((e) => {
    const source = e.source as string
    const target = e.target as string
    if (outgoing[source] !== undefined) outgoing[source]++
    if (incoming[target] !== undefined) incoming[target]++
  })

  const orphanNodes: string[] = []
  props.nodes.forEach((n) => {
    const id = n.id as string
    const label = (n.data?.label as string) || n.type || id
    if (n.type !== 'inputs' && n.type !== 'outputs') {
      if (incoming[id] === 0 && outgoing[id] === 0) {
        orphanNodes.push(label as string)
      }
    }
  })

  const danglingEdges: string[] = []
  props.edges.forEach((e) => {
    if (!nodeIds.has(e.source) || !nodeIds.has(e.target)) {
      danglingEdges.push(e.id)
    }
  })

  const deadEndNodes: string[] = []
  props.nodes.forEach((n) => {
    const id = n.id as string
    const label = (n.data?.label as string) || n.type || id
    if (n.type !== 'outputs' && (outgoing[id] ?? 0) === 0 && (incoming[id] ?? 0) > 0) {
      deadEndNodes.push(label as string)
    }
  })

  return {
    isConnected: orphanNodes.length === 0 && danglingEdges.length === 0,
    orphanNodes,
    danglingEdges,
    deadEndNodes,
  }
})

const executeNode = async (node: Node, inputData: any): Promise<DebugOutput> => {
  const startTime = Date.now()
  const nodeName = (node.data?.label as string) || node.type || node.id

  addExecutionLog('info', `开始执行节点: ${nodeName}`)
  currentExecutingNode.value = nodeName

  try {
    let result: any = {}
    let images: string[] = []

    switch (node.type) {
      case 'inputs':
        result = inputData
        break

      case 'object-detection-model':
      case 'classification-model':
      case 'segmentation-model':
        const apiUrl = (node.data?.config as any)?.apiUrl || 'https://api.example.com/predict'
        const apiKey = (node.data?.config as any)?.apiKey || ''

        addExecutionLog('info', `调用 API: ${apiUrl}`)

        const response = await axios.post(
          apiUrl,
          {
            input: inputData,
            model: (node.data?.config as any)?.modelId || 'default',
          },
          {
            headers: {
              'Content-Type': 'application/json',
              ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
            },
            signal: abortController.value?.signal,
            timeout: 30000,
          },
        )

        result = response.data
        if (result.image) {
          images.push(result.image)
        }
        break

      case 'bounding-box-visualization':
      case 'polygon-visualization':
      case 'label-visualization':
        result = {
          visualization: true,
          inputImage: inputData.image || inputData,
          config: node.data?.config,
        }
        if (inputData.image) {
          images.push(inputData.image)
        }
        break

      case 'outputs':
        result = inputData
        if (inputData.image) {
          images.push(inputData.image)
        }
        break

      default:
        result = inputData
    }

    const duration = Date.now() - startTime
    addExecutionLog('info', `节点执行完成: ${nodeName} (${duration}ms)`)

    return {
      nodeId: node.id,
      nodeName,
      status: 'success',
      duration,
      data: result,
      images: images.length > 0 ? images : undefined,
    }
  } catch (error: any) {
    const duration = Date.now() - startTime
    const errorMessage = error.response?.data?.message || error.message || '未知错误'
    addExecutionLog('error', `节点执行失败: ${nodeName} - ${errorMessage}`)

    return {
      nodeId: node.id,
      nodeName,
      status: 'error',
      duration,
      error: errorMessage,
    }
  }
}

const getExecutionOrder = (): Node[] => {
  const order: Node[] = []
  const visited = new Set<string>()
  const visiting = new Set<string>()

  const nodeMap = new Map<string, Node>()
  props.nodes.forEach((n) => nodeMap.set(n.id, n))

  const adjacency = new Map<string, string[]>()
  props.nodes.forEach((n) => adjacency.set(n.id, []))
  props.edges.forEach((e) => {
    const targets = adjacency.get(e.source) || []
    targets.push(e.target)
    adjacency.set(e.source, targets)
  })

  const dfs = (nodeId: string) => {
    if (visited.has(nodeId)) return
    if (visiting.has(nodeId)) return

    visiting.add(nodeId)

    const incomingEdges = props.edges.filter((e) => e.target === nodeId)
    for (const edge of incomingEdges) {
      dfs(edge.source)
    }

    visiting.delete(nodeId)
    visited.add(nodeId)
    const node = nodeMap.get(nodeId)
    if (node) order.push(node)
  }

  props.nodes.forEach((n) => dfs(n.id))

  return order
}

const handleStartDebug = async () => {
  if (debugState.value === 'running') return

  debugState.value = 'running'
  debugOutput.value = []
  executionProgress.value = 0
  abortController.value = new AbortController()

  addExecutionLog('info', '开始调试工作流')
  addExecutionLog('info', `输入参数: ${JSON.stringify(inputValues.value)}`)

  const executionOrder = getExecutionOrder()
  const totalNodes = executionOrder.length

  let currentData: any = { ...inputValues.value }

  for (let i = 0; i < executionOrder.length; i++) {
    if (abortController.value?.signal.aborted) {
      addExecutionLog('warn', '调试已被用户中止')
      break
    }

    const node = executionOrder[i]
    if (!node) continue

    const output = await executeNode(node, currentData)
    debugOutput.value.push(output)
    executionProgress.value = Math.round(((i + 1) / totalNodes) * 100)

    if (output.status === 'success' && output.data) {
      currentData = { ...currentData, ...output.data }
    }

    if (output.status === 'error') {
      addExecutionLog('error', '工作流执行中断')
      break
    }
  }

  debugState.value = 'completed'
  currentExecutingNode.value = ''
  addExecutionLog('info', '调试完成')

  emit('start-debug', {
    inputValues: { ...inputValues.value },
    nodes: props.nodes,
    edges: props.edges,
  })
}

const handleStopDebug = () => {
  if (abortController.value) {
    abortController.value.abort()
    debugState.value = 'completed'
    addExecutionLog('warn', '用户中止调试')
  }
}

watch(
  () => inputProperties.value,
  () => {
    initInputValues(true)
  },
  { deep: true, immediate: true },
)
</script>

<style scoped>
.bg-checkerboard {
  background-image:
    linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 16px 16px;
  background-position:
    0 0,
    0 8px,
    8px -8px,
    -8px 0px;
}
</style>
