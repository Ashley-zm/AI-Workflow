<template>
  <div class="space-y-4">
    <div>
      <h3 class="text-sm font-medium text-gray-900 mb-3">自定义属性</h3>

      <!-- 属性列表 -->
      <div class="space-y-3">
        <div
          v-for="(property, index) in properties"
          :key="index"
          class="border border-gray-200 rounded-lg p-3"
        >
          <!-- 属性名称 必须为英文不能包含特殊字符-->
          <div class="mb-2">
            <label class="block text-xs font-medium text-gray-700 mb-1"
              >属性名称
              <span class="text-red-500">*</span>
            </label>
            <el-input
              v-model="property.name"
              size="small"
              placeholder="请输入属性名称 (英文开头，可包含数字、下划线)"
              @input="handlePropertyNameInput(property, index)"
              @change="handlePropertyNameInput(property, index)"
            />
          </div>

          <!-- 属性类型 -->
          <div class="mb-2">
            <label class="block text-xs font-medium text-gray-700 mb-1">属性类型</label>
            <el-select
              v-model="property.type"
              size="small"
              placeholder="请选择类型"
              @change="onPropertyTypeChange(property)"
            >
              <el-option label="Parameter" value="parameter" />
              <el-option label="Image" value="image" />
            </el-select>
          </div>

          <!-- Parameter类型的额外设置 -->
          <div v-if="property.type === 'parameter'" class="space-y-2">
            <!-- 值类型 -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">值类型</label>
              <el-select
                v-model="property.valueType"
                size="small"
                placeholder="请选择值类型"
                @change="updateProperty"
              >
                <el-option label="String" value="string" />
                <el-option label="Number" value="number" />
                <el-option label="Boolean" value="boolean" />
                <el-option label="Array" value="array" />
                <el-option label="Object" value="object" />
              </el-select>
            </div>

            <!-- 默认值 -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">默认值</label>
              <el-input
                v-model="property.defaultValue"
                size="small"
                :placeholder="getDefaultValuePlaceholder(property.valueType)"
                @input="updateProperty"
              />
            </div>
          </div>

          <!-- Image类型的提示 -->
          <div
            v-else-if="property.type === 'image'"
            class="text-xs text-gray-500 bg-blue-50 p-2 rounded"
          >
            <el-icon class="mr-1"><Picture /></el-icon>
            Image类型将用于图像数据输入
          </div>

          <!-- 删除按钮 -->
          <div class="flex justify-end mt-2">
            <el-button type="danger" size="small" :icon="Delete" @click="removeProperty(index)">
              删除
            </el-button>
          </div>
        </div>
      </div>

      <!-- 添加属性按钮 -->
      <div class="mt-3">
        <el-button type="primary" size="small" :icon="Plus" @click="addProperty">
          添加属性
        </el-button>
      </div>
    </div>

    <div class="p-2">
      <h3 class="text-sm font-medium text-gray-900 mb-3">JSON</h3>
      <!-- 该节点的json字符串 -->
      <div class="bg-gray-50 p-2 rounded-md text-xs">
        <pre class="whitespace-pre-wrap">{{ JSON.stringify(properties, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useWorkflowStore } from '@/stores/workflow'
import { Plus, Delete, Picture } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  nodeId: string
}>()

const emit = defineEmits<{
  updateProperties: [properties: Property[]]
}>()

// 定义Property接口 - 修复TypeScript语法错误
interface Property {
  name: string
  type: 'parameter' | 'image'
  valueType: 'string' | 'number' | 'boolean' | 'array' | 'object'
  defaultValue: string
}

const store = useWorkflowStore()

// 属性列表
const properties = ref<Property[]>([])

// 获取节点数据
const getNodeData = () => {
  const node = store.nodes.find((n) => n.id === props.nodeId)
  return node?.data || {}
}

// 初始化属性数据
const initializeProperties = () => {
  const nodeData = getNodeData()
  if (nodeData.properties) {
    properties.value = JSON.parse(JSON.stringify(nodeData.properties))
  } else {
    properties.value = []
  }
}

// 添加新属性
const addProperty = () => {
  const newProperty: Property = {
    name: '',
    type: 'parameter',
    valueType: 'string',
    defaultValue: '',
  }
  properties.value.push(newProperty)
  updateProperties()
}

// 删除属性
const removeProperty = (index: number) => {
  properties.value.splice(index, 1)
  updateProperties()
}

// 属性类型变更处理
const onPropertyTypeChange = (property: Property) => {
  // 重置类型相关设置
  if (property.type === 'parameter') {
    property.valueType = 'string'
    property.defaultValue = ''
  } else if (property.type === 'image') {
    property.valueType = 'string' // Image类型默认使用string存储路径
    property.defaultValue = ''
  }
  updateProperties()
}

// 获取默认值的占位符文本
const getDefaultValuePlaceholder = (valueType: string): string => {
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

// 验证属性名称
const validatePropertyName = (name: string): { valid: boolean; message?: string } => {
  // 检查是否为空
  if (!name || name.trim() === '') {
    return { valid: false, message: '属性名称不能为空' }
  }

  // 检查是否以中划线、下划线、空格开头
  if (/^[-_\s]/.test(name)) {
    return { valid: false, message: '属性名称不能以中划线、下划线、空格开头' }
  }

  // 检查是否以英文开头
  if (!/^[a-zA-Z]/.test(name)) {
    return { valid: false, message: '属性名称只能以英文字母开头' }
  }

  // 检查是否只包含英文字母、数字、下划线
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    return { valid: false, message: '属性名称只能包含英文字母、数字、下划线' }
  }

  // 检查是否包含特殊字符（除了下划线）
  if (/[!@#$%^&*()+=\[\]{};':"\\|,.<>?]/.test(name)) {
    return { valid: false, message: '属性名称不能包含特殊字符' }
  }

  return { valid: true }
}

// 属性名称输入处理
const handlePropertyNameInput = (property: Property, index: number) => {
  const validation = validatePropertyName(property.name)

  if (!validation.valid) {
    // 清空不符合格式的属性名称
    property.name = ''
    // 显示错误提示
    ElMessage.error(validation.message || '属性名称格式错误')
    // 强制更新UI并同步到节点数据
    properties.value[index] = { ...property }
    // 立即更新节点数据
    store.updateNode(props.nodeId, { properties: JSON.parse(JSON.stringify(properties.value)) })
    emit('updateProperties', properties.value)
    // 强制触发重新渲染
    properties.value = [...properties.value]
    return
  }

  updateProperties()
}

// 更新属性并通知父组件
const updateProperties = () => {
  // 验证所有属性名称
  for (let i = 0; i < properties.value.length; i++) {
    const property = properties.value[i]
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

  // 更新节点数据
  store.updateNode(props.nodeId, { properties: JSON.parse(JSON.stringify(properties.value)) })
  // 触发事件通知父组件
  emit('updateProperties', properties.value)
}

// 监听属性变化
const updateProperty = () => {
  // 验证属性名称
  for (let i = 0; i < properties.value.length; i++) {
    const property = properties.value[i]
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

// 组件挂载时初始化
onMounted(() => {
  initializeProperties()
})

// 监听节点选择变化，重新初始化数据
watch(
  () => props.nodeId,
  () => {
    initializeProperties()
  },
)
</script>
