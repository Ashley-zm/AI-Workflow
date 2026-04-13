<template>
  <el-dialog
    v-model="dialogVisible"
    title="编辑工作流"
    width="520px"
    :close-on-click-modal="false"
    @closed="handleDialogClosed"
  >
    <div v-loading="detailLoading">
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-position="top"
      >
        <el-form-item label="工作流名称" prop="workflowName" required>
          <el-input
            v-model.trim="form.workflowName"
            maxlength="50"
            placeholder="请输入工作流名称"
            @input="onWorkflowNameInput"
          />
        </el-form-item>

        <el-form-item label="标签" prop="workflowClass" required>
          <div class="tag-row">
            <el-tag v-for="tag in workflowClassTags" :key="tag" closable @close="removeTag(tag)">
              {{ tag }}
            </el-tag>
            <el-input
              v-model.trim="tagInput"
              class="tag-input"
              placeholder="输入标签后回车或失焦添加"
              @keyup.enter="appendTag"
              @blur="appendTag"
            />
          </div>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model.trim="form.description"
            type="textarea"
            :rows="4"
            maxlength="100"
            show-word-limit
            placeholder="请输入描述"
            @input="onDescriptionInput"
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitEdit">
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { workflowApi } from '@/api'
import type { UpdateWorkflowBaseRequest, WorkflowEntity } from '@/types/workflow-api'

const props = defineProps<{
  modelValue: boolean
  workflowId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  updated: []
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const formRef = ref<FormInstance>()
const detailLoading = ref(false)
const submitting = ref(false)
const tagInput = ref('')
const workflowClassTags = ref<string[]>([])

const form = reactive<UpdateWorkflowBaseRequest>({
  id: '',
  workflowName: '',
  workflowClass: '',
  description: '',
})

const normalizeText = (value: string) => {
  return value
    .replace(/[^\u4e00-\u9fa5A-Za-z0-9_.\-\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trimStart()
}

const normalizeTag = (value: string) => {
  return value
    .replace(/[^\u4e00-\u9fa5A-Za-z0-9_.\-\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

const parseWorkflowClass = (value: string | undefined) => {
  if (!value) return []
  const tags = value
    .split(',')
    .map((item) => normalizeTag(item))
    .filter(Boolean)
  return Array.from(new Set(tags))
}

const syncWorkflowClass = () => {
  form.workflowClass = workflowClassTags.value.join(',')
}

const resetForm = () => {
  form.id = ''
  form.workflowName = ''
  form.workflowClass = ''
  form.description = ''
  workflowClassTags.value = []
  tagInput.value = ''
  formRef.value?.clearValidate()
}

const validateWorkflowName = (
  _rule: unknown,
  value: string,
  callback: (error?: Error) => void,
) => {
  if (!value || !value.trim()) {
    callback(new Error('请填写工作流名称'))
    return
  }
  callback()
}

const validateWorkflowClass = (
  _rule: unknown,
  _value: string,
  callback: (error?: Error) => void,
) => {
  if (!workflowClassTags.value.length) {
    callback(new Error('请至少添加一个标签'))
    return
  }
  callback()
}

const formRules: FormRules = {
  workflowName: [{ validator: validateWorkflowName, trigger: ['blur', 'change'] }],
  workflowClass: [{ validator: validateWorkflowClass, trigger: ['blur', 'change'] }],
  description: [{ max: 100, message: '描述不能超过100个字符', trigger: 'blur' }],
}

const onWorkflowNameInput = (value: string) => {
  form.workflowName = normalizeText(value)
}

const onDescriptionInput = (value: string) => {
  form.description = normalizeText(value)
}

const appendTag = () => {
  const nextTag = normalizeTag(tagInput.value)
  if (!nextTag) {
    tagInput.value = ''
    return
  }

  if (workflowClassTags.value.includes(nextTag)) {
    tagInput.value = ''
    return
  }

  workflowClassTags.value.push(nextTag)
  syncWorkflowClass()
  tagInput.value = ''
  formRef.value?.clearValidate('workflowClass')
}

const removeTag = (tag: string) => {
  workflowClassTags.value = workflowClassTags.value.filter((item) => item !== tag)
  syncWorkflowClass()
  formRef.value?.validateField('workflowClass').catch(() => undefined)
}

const loadWorkflowDetail = async () => {
  if (!props.workflowId) {
    resetForm()
    return
  }

  detailLoading.value = true
  try {
    const response = await workflowApi.getWorkflowInfo(props.workflowId)
    const data = response.data as WorkflowEntity | undefined
    if (response.code !== 200 || !data) {
      ElMessage.error(response.msg || '获取工作流详情失败')
      return
    }

    form.id = String(data.id ?? props.workflowId)
    form.workflowName = normalizeText(data.workflowName || '')
    workflowClassTags.value = parseWorkflowClass(data.workflowClass)
    syncWorkflowClass()
    form.description = normalizeText(data.description || '')

    await nextTick()
    formRef.value?.clearValidate()
  } catch (error) {
    console.error(error)
    ElMessage.error('获取工作流详情失败，请稍后重试')
  } finally {
    detailLoading.value = false
  }
}

const submitEdit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }

  if (!form.id) {
    ElMessage.error('工作流ID无效')
    return
  }

  const payload: UpdateWorkflowBaseRequest = {
    id: form.id,
    workflowName: form.workflowName.trim(),
    workflowClass: form.workflowClass,
    description: form.description?.trim(),
  }

  submitting.value = true
  try {
    const response = await workflowApi.updateWorkflowBase(payload)
    if (response.code !== 200) {
      ElMessage.error(response.msg || '更新工作流失败')
      return
    }

    ElMessage.success('更新工作流成功')
    dialogVisible.value = false
    emit('updated')
  } catch (error) {
    console.error(error)
    ElMessage.error('更新工作流失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const handleDialogClosed = () => {
  resetForm()
}

watch(
  () => dialogVisible.value,
  (visible) => {
    if (!visible) return
    void loadWorkflowDetail()
  },
)

watch(
  () => props.workflowId,
  (nextId, prevId) => {
    if (!dialogVisible.value) return
    if (!nextId || nextId === prevId) return
    void loadWorkflowDetail()
  },
)
</script>

<style scoped>
.tag-row {
  width: 100%;
  min-height: 40px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 6px 8px;
}

.tag-input {
  flex: 1;
  min-width: 140px;
}

.tag-input :deep(.el-input__wrapper) {
  box-shadow: none;
  padding-left: 0;
  padding-right: 0;
}
</style>
