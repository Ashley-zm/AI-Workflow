<template>
  <div class="space-y-6">
    <!-- 自定义属性 -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="h-4 w-0.5 rounded-full bg-blue-500"></div>
          <h3 class="text-sm font-semibold text-slate-800">自定义属性</h3>
        </div>
        <div class="text-xs text-slate-500">{{ data.length }} 个属性</div>
      </div>

      <div class="space-y-3">
        <div
          v-for="(property, index) in data"
          :key="index"
          class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div class="mb-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div
                class="h-6 w-6 rounded-md flex items-center justify-center"
                :class="getPropertyTypeClass(property.type)"
              >
                <component :is="getPropertyTypeIcon(property.type)" :size="12" class="text-white" />
              </div>
              <div>
                <div class="text-xs font-medium text-slate-700">属性 #{{ index + 1 }}</div>
                <div class="text-[10px] text-slate-400">{{ property.type }}</div>
              </div>
            </div>
            <button
              class="rounded-lg p-1.5 text-red-500 hover:bg-red-100 transition-colors"
              title="删除属性"
              @click="removeProperty(index)"
            >
              <Trash2 :size="16" />
            </button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-2">
                属性名称 <span class="text-red-500">*</span>
              </label>
              <el-input
                v-model="property.name"
                size="default"
                placeholder="请输入属性名称 (英文开头，可包含数字、下划线)"
                @input="handlePropertyNameInput(property, index)"
                @change="handlePropertyNameInput(property, index)"
              >
                <template #prefix>
                  <Type :size="14" class="text-slate-400" />
                </template>
              </el-input>
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-700 mb-2">属性类型</label>
              <el-select
                v-model="property.type"
                size="default"
                placeholder="请选择类型"
                @change="onPropertyTypeChange(property)"
                class="w-full"
              >
                <el-option label="Image" value="image">
                  <div class="flex items-center gap-2">
                    <div class="h-4 w-4 rounded bg-emerald-500"></div>
                    <span>Image</span>
                  </div>
                </el-option>
                <el-option label="Parameter" value="parameter">
                  <div class="flex items-center gap-2">
                    <div class="h-4 w-4 rounded bg-blue-500"></div>
                    <span>Parameter</span>
                  </div>
                </el-option>
              </el-select>
            </div>

            <div
              v-if="property.type === 'parameter'"
              class="space-y-3 pt-2 border-t border-slate-200"
            >
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-2">值类型</label>
                <el-select
                  v-model="property.valueType"
                  size="default"
                  placeholder="请选择值类型"
                  @change="updateProperty"
                  class="w-full"
                >
                  <el-option label="String" value="string">
                    <div class="flex items-center gap-2">
                      <div class="h-4 w-4 rounded bg-green-500"></div>
                      <span>String</span>
                    </div>
                  </el-option>
                  <el-option label="Number" value="number">
                    <div class="flex items-center gap-2">
                      <div class="h-4 w-4 rounded bg-blue-500"></div>
                      <span>Number</span>
                    </div>
                  </el-option>
                  <el-option label="Boolean" value="boolean">
                    <div class="flex items-center gap-2">
                      <div class="h-4 w-4 rounded bg-purple-500"></div>
                      <span>Boolean</span>
                    </div>
                  </el-option>
                  <el-option label="Array" value="array">
                    <div class="flex items-center gap-2">
                      <div class="h-4 w-4 rounded bg-orange-500"></div>
                      <span>Array</span>
                    </div>
                  </el-option>
                  <el-option label="Object" value="object">
                    <div class="flex items-center gap-2">
                      <div class="h-4 w-4 rounded bg-pink-500"></div>
                      <span>Object</span>
                    </div>
                  </el-option>
                </el-select>
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-700 mb-2">默认值</label>
                <el-input
                  v-model="property.defaultValue"
                  size="default"
                  :placeholder="getDefaultValuePlaceholder(property.valueType)"
                  @input="updateProperty"
                >
                  <template #prefix>
                    <Hash :size="14" class="text-slate-400" />
                  </template>
                </el-input>
              </div>
            </div>

            <div
              v-else-if="property.type === 'image'"
              class="flex items-start gap-2 rounded-lg bg-blue-50 p-3 border border-blue-200"
            >
              <Image :size="16" class="text-blue-500 mt-0.5 flex-shrink-0" />
              <div class="text-xs text-blue-700">
                <div class="font-medium mb-1">图片类型</div>
                <div>Image类型将用于图像数据输入，可在后续节点中引用。</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <el-button type="primary" size="default" @click="addProperty" class="w-full">
          <el-icon class="mr-2"><Plus /></el-icon>
          添加属性
        </el-button>
      </div>
    </div>

    <!-- JSON预览 -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="h-4 w-0.5 rounded-full bg-slate-500"></div>
          <h3 class="text-sm font-semibold text-slate-800">JSON预览</h3>
        </div>
        <button
          class="text-xs text-blue-500 hover:text-blue-700 transition-colors"
          @click="copyJson"
        >
          复制JSON
        </button>
      </div>
      <div class="rounded-lg bg-slate-900 p-4 border border-slate-700">
        <pre class="text-xs text-slate-100 font-mono whitespace-pre-wrap">{{
          JSON.stringify(data, null, 2)
        }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { Trash2, Type, Hash, Image } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: any
}>()

const emit = defineEmits<{
  'update:nodeConfig': [value: any]
}>()

interface Property {
  name: string
  type: 'parameter' | 'image'
  valueType?: 'string' | 'number' | 'boolean' | 'array' | 'object' | undefined
  defaultValue?: string | undefined
}

const data = ref<Property[]>([])

const initializeProperties = () => {
  if (props.modelValue.length) {
    data.value = JSON.parse(JSON.stringify(props.modelValue))
  } else {
    data.value = []
  }
}

const addProperty = () => {
  const newProperty: Property = {
    name: data.value.length > 0 ? 'image' + (data.value.length + 1) : 'image',
    type: 'image',
  }
  data.value.push(newProperty)
  updateProperties()
}

const removeProperty = (index: number) => {
  data.value.splice(index, 1)
  updateProperties()
}

const onPropertyTypeChange = (property: Property) => {
  if (property.type === 'parameter') {
    property.valueType = 'string'
    property.defaultValue = ''
  } else if (property.type === 'image') {
    property.valueType = undefined
    property.defaultValue = undefined
  }
  updateProperties()
}

const getDefaultValuePlaceholder = (valueType: string | undefined): string => {
  switch (valueType) {
    case 'string':
      return '输入字符串默认值'
    case 'number':
      return '输入数字默认值'
    case 'boolean':
      return 'true 或 false'
    case 'array':
      return '输入JSON数组，如: ["item1", "item2"]'
    case 'object':
      return '输入JSON对象，如: {"key": "value"}'
    default:
      return '输入默认值'
  }
}

const validatePropertyName = (name: string): { valid: boolean; message?: string } => {
  if (!name || name.trim() === '') {
    return { valid: false, message: '属性名称不能为空' }
  }

  if (/^[-_\s]/.test(name)) {
    return { valid: false, message: '属性名称不能以中划线、下划线、空格开头' }
  }

  if (!/^[a-zA-Z]/.test(name)) {
    return { valid: false, message: '属性名称只能以英文字母开头' }
  }

  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    return { valid: false, message: '属性名称只能包含英文字母、数字、下划线' }
  }

  if (/[!@#$%^&*()+=\[\]{};':"\\|,.<>?]/.test(name)) {
    return { valid: false, message: '属性名称不能包含特殊字符' }
  }

  return { valid: true }
}

const handlePropertyNameInput = (property: Property, index: number) => {
  const validation = validatePropertyName(property.name)

  if (!validation.valid) {
    property.name = ''
    ElMessage.error(validation.message || '属性名称格式错误')
    data.value[index] = { ...property }
    emit('update:nodeConfig', data.value)
    data.value = [...data.value]
    return
  }

  updateProperties()
}

const updateProperties = () => {
  for (let i = 0; i < data.value.length; i++) {
    const property = data.value[i]
    if (!property) {
      return
    }
    if (property.name && property.name.trim() !== '') {
      const validation = validatePropertyName(property.name)
      if (!validation.valid) {
        ElMessage.error(`第${i + 1}个属性: ${validation.message}`)
        return
      }
    }
  }
  emit('update:nodeConfig', JSON.parse(JSON.stringify(data.value)))
}

const updateProperty = () => {
  for (let i = 0; i < data.value.length; i++) {
    const property = data.value[i]
    if (!property) {
      return
    }
    if (property.name && property.name.trim() !== '') {
      const validation = validatePropertyName(property.name)
      if (!validation.valid) {
        ElMessage.error(`第${i + 1}个属性: ${validation.message}`)
        return
      }
    }
  }

  updateProperties()
}

const getPropertyTypeClass = (type: string) => {
  const typeMap: Record<string, string> = {
    parameter: 'bg-blue-500',
    image: 'bg-emerald-500',
  }
  return typeMap[type] || 'bg-slate-500'
}

const getPropertyTypeIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    parameter: Hash,
    image: Image,
  }
  return iconMap[type] || Type
}

const copyJson = () => {
  const json = JSON.stringify(data.value, null, 2)
  navigator.clipboard
    .writeText(json)
    .then(() => {
      ElMessage.success('已复制JSON')
    })
    .catch(() => {
      ElMessage.error('复制失败')
    })
}

onMounted(() => {
  initializeProperties()
})

watch(
  () => props.modelValue,
  () => {
    initializeProperties()
  },
)
</script>
