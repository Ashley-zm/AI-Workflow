import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Node, Edge } from '@vue-flow/core'
import { useHistoryStore } from './history'
import type { WorkflowEntity } from '@/types/workflow-api'
import { getNodeEdgeType } from '@/components/Workflow/config/nodeTypes'

interface WorkflowViewportInfo {
  x: number
  y: number
  zoom: number
}

export type WorkflowHealthStatus = 'checking' | 'healthy' | 'warning' | 'error'
type UpdateNodeNameFailReason = 'not_found' | 'readonly' | 'empty' | 'duplicate'
type UpdateNodeNameResult =
  | { ok: true; changed: boolean }
  | { ok: false; reason: UpdateNodeNameFailReason }

export const useWorkflowStore = defineStore('workflow', () => {
  const historyStore = useHistoryStore()
  const defaultWorkflowInfo: WorkflowEntity = {
    id: '',
    workflowName: '',
    workflowId: '',
    workflowClass: '',
    description: '',
    workflowJsonData: undefined,
  }
  const defaultViewportInfo: WorkflowViewportInfo = {
    x: 0,
    y: 0,
    zoom: 1,
  }

  // 初始化历史记录
  const initializeHistory = () => {
    historyStore.reset()
    // 记录初始状态
    historyStore.recordState(nodes.value, edges.value, 'initial_state')
  }
  const workflowInfo = ref<WorkflowEntity>({ ...defaultWorkflowInfo })
  const viewportInfo = ref<WorkflowViewportInfo>({ ...defaultViewportInfo })
  const setWorkflowInfo = (info?: Partial<WorkflowEntity> | null) => {
    workflowInfo.value = {
      ...defaultWorkflowInfo,
      ...(info ?? {}),
    }
    // 更新画布的节点、边以及视图信息
    if (workflowInfo.value.workflowJsonData) {
      const json = workflowInfo.value.workflowJsonData
      nodes.value = json.ui_metadata.nodes || []
      edges.value = json.edges || []
      setViewportInfo(json.ui_metadata.viewport)
    }
  }
  const setViewportInfo = (viewport?: Partial<WorkflowViewportInfo> | null) => {
    viewportInfo.value = {
      ...defaultViewportInfo,
      ...(viewport ?? {}),
    }
  }
  // 节点 默认存在一个起始节点，一个结束节点
  const nodes = ref<Node[]>([
    {
      id: 'inputs',
      type: 'inputs',
      name: 'inputs',
      label: 'inputs',
      position: { x: 100, y: 300 },
      data: [],
    },
    {
      id: 'outputs',
      type: 'outputs',
      name: 'outputs',
      label: 'outputs',
      position: { x: 500, y: 300 },
      data: [],
    },
  ])
  // 边
  const edges = ref<Edge[]>([])
  const selectedNode = ref<Node | null>(null)
  const currentHandleInfo = ref<{
    nodeId: string
    sourceHandle?: string
    position: { x: number; y: number }
  } | null>(null)

  const workflowHealthStatus = ref<WorkflowHealthStatus>('checking')
  const workflowHealthWarnings = ref<string[]>([])
  const workflowHealthErrors = ref<string[]>([])
  const workflowHealthSuggestions = ref<string[]>([])
  const workflowHealthLastCheckedAt = ref('')
  const workflowHealthHasChangesSinceLastCheck = ref(false)

  const workflowHealthNodeCount = computed(() => nodes.value.length)
  const workflowHealthEdgeCount = computed(() => edges.value.length)
  const workflowHealthInputNodeCount = computed(
    () => nodes.value.filter((item) => item.type === 'inputs').length,
  )
  const workflowHealthOutputNodeCount = computed(
    () => nodes.value.filter((item) => item.type === 'outputs').length,
  )

  type RefReplacementValue = string | undefined

  const cloneData = <T>(value: T): T => {
    if (value === undefined) return value
    return JSON.parse(JSON.stringify(value)) as T
  }

  const normalizeName = (value: unknown) => {
    if (typeof value !== 'string') return ''
    return value.trim()
  }

  const getNodeName = (node: Node) => {
    const explicitName = normalizeName((node as any).name)
    if (explicitName) return explicitName
    return String(node.id ?? '')
  }

  const extractNameListFromNodeData = (data: unknown): string[] => {
    if (!Array.isArray(data)) return []
    return data.map((item: any) => normalizeName(item?.name)).filter((name) => name.length > 0)
  }

  const buildNameReplacementMap = (prevData: unknown, nextData: unknown) => {
    const prevNames = extractNameListFromNodeData(prevData)
    const nextNames = extractNameListFromNodeData(nextData)
    const nextSet = new Set(nextNames)
    const replacements = new Map<string, RefReplacementValue>()

    const pairedSize = Math.min(prevNames.length, nextNames.length)
    for (let index = 0; index < pairedSize; index += 1) {
      const oldName = prevNames[index]
      const newName = nextNames[index]
      if (!oldName) continue
      if (!newName) {
        replacements.set(oldName, undefined)
        continue
      }
      if (oldName !== newName) {
        replacements.set(oldName, newName)
      }
    }

    prevNames.forEach((oldName) => {
      if (!oldName) return
      if (nextSet.has(oldName)) return
      if (replacements.has(oldName)) return
      replacements.set(oldName, undefined)
    })

    return replacements
  }

  const replaceRefsInValue = (
    value: unknown,
    exactMap: Map<string, RefReplacementValue>,
    clearPrefixes: string[],
  ): { nextValue: unknown; changed: boolean } => {
    if (typeof value === 'string') {
      if (exactMap.has(value)) {
        return { nextValue: exactMap.get(value), changed: true }
      }
      if (clearPrefixes.some((prefix) => prefix && value.startsWith(prefix))) {
        return { nextValue: undefined, changed: true }
      }
      return { nextValue: value, changed: false }
    }

    if (Array.isArray(value)) {
      let changed = false
      const nextArray = value.map((item) => {
        const result = replaceRefsInValue(item, exactMap, clearPrefixes)
        if (result.changed) changed = true
        return result.nextValue
      })
      return changed
        ? { nextValue: nextArray, changed: true }
        : { nextValue: value, changed: false }
    }

    if (!value || typeof value !== 'object') {
      return { nextValue: value, changed: false }
    }

    let changed = false
    const nextObject: Record<string, unknown> = {}
    Object.entries(value as Record<string, unknown>).forEach(([key, rawValue]) => {
      const result = replaceRefsInValue(rawValue, exactMap, clearPrefixes)
      if (result.changed) changed = true
      nextObject[key] = result.nextValue
    })

    return changed ? { nextValue: nextObject, changed: true } : { nextValue: value, changed: false }
  }

  const replaceImageSelectorFieldsInValue = (
    value: unknown,
    imageSelector: string,
  ): { nextValue: unknown; changed: boolean } => {
    if (Array.isArray(value)) {
      let changed = false
      const nextArray = value.map((item) => {
        const result = replaceImageSelectorFieldsInValue(item, imageSelector)
        if (result.changed) changed = true
        return result.nextValue
      })
      return changed
        ? { nextValue: nextArray, changed: true }
        : { nextValue: value, changed: false }
    }

    if (!value || typeof value !== 'object') {
      return { nextValue: value, changed: false }
    }

    let changed = false
    const nextObject: Record<string, unknown> = {}
    Object.entries(value as Record<string, unknown>).forEach(([key, rawValue]) => {
      if (key === 'image' || key === 'images') {
        nextObject[key] = imageSelector
        if (rawValue !== imageSelector) changed = true
        return
      }
      const result = replaceImageSelectorFieldsInValue(rawValue, imageSelector)
      if (result.changed) changed = true
      nextObject[key] = result.nextValue
    })

    return changed ? { nextValue: nextObject, changed: true } : { nextValue: value, changed: false }
  }

  const replaceStepReferencePrefixInValue = (
    value: unknown,
    oldPrefix: string,
    newPrefix: string,
  ): { nextValue: unknown; changed: boolean } => {
    if (typeof value === 'string') {
      if (value === oldPrefix) {
        return { nextValue: newPrefix, changed: true }
      }
      if (value.startsWith(`${oldPrefix}.`)) {
        return { nextValue: `${newPrefix}${value.slice(oldPrefix.length)}`, changed: true }
      }
      return { nextValue: value, changed: false }
    }

    if (Array.isArray(value)) {
      let changed = false
      const nextArray = value.map((item) => {
        const result = replaceStepReferencePrefixInValue(item, oldPrefix, newPrefix)
        if (result.changed) changed = true
        return result.nextValue
      })
      return changed
        ? { nextValue: nextArray, changed: true }
        : { nextValue: value, changed: false }
    }

    if (!value || typeof value !== 'object') {
      return { nextValue: value, changed: false }
    }

    let changed = false
    const nextObject: Record<string, unknown> = {}
    Object.entries(value as Record<string, unknown>).forEach(([key, rawValue]) => {
      const result = replaceStepReferencePrefixInValue(rawValue, oldPrefix, newPrefix)
      if (result.changed) changed = true
      nextObject[key] = result.nextValue
    })

    return changed ? { nextValue: nextObject, changed: true } : { nextValue: value, changed: false }
  }

  const applyReferenceUpdatesToOtherNodes = (params: {
    exactMap?: Map<string, RefReplacementValue>
    clearPrefixes?: string[]
    excludeNodeId?: string
  }) => {
    const exactMap = params.exactMap ?? new Map<string, RefReplacementValue>()
    const clearPrefixes = params.clearPrefixes ?? []
    const excludeNodeId = params.excludeNodeId

    if (exactMap.size === 0 && clearPrefixes.length === 0) return

    let changed = false
    nodes.value = nodes.value.map((node) => {
      if (excludeNodeId && String(node.id) === excludeNodeId) return node
      const replaced = replaceRefsInValue(node.data, exactMap, clearPrefixes)
      if (!replaced.changed) return node
      changed = true
      return {
        ...node,
        data: replaced.nextValue as any,
      } as Node
    })

    if (changed && selectedNode.value?.id) {
      selectedNode.value = nodes.value.find((node) => node.id === selectedNode.value?.id) || null
    }
  }

  const replaceStepNameReferences = (params: {
    excludeNodeId: string
    oldName: string
    newName: string
  }) => {
    const oldName = normalizeName(params.oldName)
    const newName = normalizeName(params.newName)
    if (!oldName || !newName || oldName === newName) return

    const oldPrefix = `$steps.${oldName}`
    const newPrefix = `$steps.${newName}`
    let changed = false

    nodes.value = nodes.value.map((node) => {
      if (String(node.id) === params.excludeNodeId) return node
      const replaced = replaceStepReferencePrefixInValue(node.data, oldPrefix, newPrefix)
      if (!replaced.changed) return node
      changed = true
      return {
        ...node,
        data: replaced.nextValue as any,
      } as Node
    })

    if (changed && selectedNode.value?.id) {
      selectedNode.value = nodes.value.find((node) => node.id === selectedNode.value?.id) || null
    }
  }

  const updateAllData = (currentNode: Node, previousData: unknown, nextData: unknown) => {
    const nodeId = String(currentNode.id ?? '')
    const previousIsEmpty = Array.isArray(previousData) && previousData.length === 0
    const nextImageNames = Array.isArray(nextData)
      ? nextData
          .filter((item: any) => item?.type === 'image')
          .map((item: any) => normalizeName(item?.name))
          .filter((name: string) => name.length > 0)
      : []

    // inputs 从空变为有值，且含 image 类型时，回填非 outputs 节点的 image/images 字段
    if (previousIsEmpty && nextImageNames.length > 0) {
      const defaultImageSelector = `$inputs.${nextImageNames[0]}`
      let changed = false

      nodes.value = nodes.value.map((node) => {
        if (String(node.id) === nodeId) return node
        if (String(node.type ?? '') === 'outputs') return node

        const replaced = replaceImageSelectorFieldsInValue(node.data, defaultImageSelector)
        if (!replaced.changed) return node
        changed = true
        return {
          ...node,
          data: replaced.nextValue as any,
        } as Node
      })

      if (changed && selectedNode.value?.id) {
        selectedNode.value = nodes.value.find((node) => node.id === selectedNode.value?.id) || null
      }
    }

    const nextNames = extractNameListFromNodeData(nextData)

    // inputs 为空时，清空所有节点里对 $inputs.xxx 的引用
    if (nextNames.length === 0) {
      applyReferenceUpdatesToOtherNodes({
        clearPrefixes: ['$inputs.'],
        excludeNodeId: nodeId,
      })
      return
    }

    const nameReplacements = buildNameReplacementMap(previousData, nextData)
    if (nameReplacements.size === 0) return

    const exactMap = new Map<string, RefReplacementValue>()
    nameReplacements.forEach((newName, oldName) => {
      const oldRef = `$inputs.${oldName}`
      exactMap.set(oldRef, newName ? `$inputs.${newName}` : undefined)
    })

    applyReferenceUpdatesToOtherNodes({
      exactMap,
      excludeNodeId: nodeId,
    })
  }

  const clearRemovedNodeReferences = (removedNode: Node) => {
    const nodeType = String(removedNode.type ?? '')
    const nodeName = getNodeName(removedNode)
    const clearPrefixes: string[] = []

    if (nodeType === 'inputs') {
      clearPrefixes.push('$inputs.')
    } else if (nodeType !== 'outputs') {
      clearPrefixes.push(`$steps.${nodeName}.`)
    }

    if (clearPrefixes.length === 0) return

    applyReferenceUpdatesToOtherNodes({
      clearPrefixes,
      excludeNodeId: String(removedNode.id ?? ''),
    })
  }

  const workflowHealthSummaryTitle = computed(() => {
    if (workflowHealthStatus.value === 'healthy') return '检查通过'
    if (workflowHealthStatus.value === 'warning') return '存在可优化项'
    if (workflowHealthStatus.value === 'error') return '存在阻断错误'
    return '检查中'
  })

  const workflowHealthSummaryDesc = computed(() => {
    if (workflowHealthStatus.value === 'healthy') return '当前工作流结构完整，可继续调试或保存。'
    if (workflowHealthStatus.value === 'warning') {
      return `共发现 ${workflowHealthWarnings.value.length} 个警告，请按建议优化。`
    }
    if (workflowHealthStatus.value === 'error') {
      return `共发现 ${workflowHealthErrors.value.length} 个错误，修复后才能稳定运行。`
    }
    return '正在执行健康检查'
  })

  const formatNodeName = (node: Node, index: number) => {
    const maybeName = (node as any).name || (node.data as any)?.name || (node as any).label
    return String(maybeName || node.id || `节点${index + 1}`)
  }

  const addUniqueIssue = (target: string[], message: string) => {
    if (!target.includes(message)) {
      target.push(message)
    }
  }

  const addSuggestion = (message: string) => {
    if (!workflowHealthSuggestions.value.includes(message)) {
      workflowHealthSuggestions.value.push(message)
    }
  }

  const buildWorkflowHealth = () => {
    workflowHealthWarnings.value = []
    workflowHealthErrors.value = []
    workflowHealthSuggestions.value = []

    const currentNodes = nodes.value || []
    const currentEdges = edges.value || []

    const inputNodeCount = currentNodes.filter((item) => item.type === 'inputs').length
    const outputNodeCount = currentNodes.filter((item) => item.type === 'outputs').length

    if (currentNodes.length === 0) {
      addUniqueIssue(workflowHealthErrors.value, '工作流中没有任何节点。')
      addSuggestion('先添加输入节点、处理节点和输出节点，再进行连线。')
    }

    if (inputNodeCount === 0) {
      addUniqueIssue(workflowHealthErrors.value, '缺少输入节点（inputs）。')
      addSuggestion('至少保留一个输入节点作为流程起点。')
    }

    if (outputNodeCount === 0) {
      addUniqueIssue(workflowHealthErrors.value, '缺少输出节点（outputs）。')
      addSuggestion('至少保留一个输出节点作为流程终点。')
    }

    if (inputNodeCount > 1) {
      addUniqueIssue(
        workflowHealthWarnings.value,
        `输入节点数量为 ${inputNodeCount}，请确认是否符合预期。`,
      )
    }

    if (outputNodeCount > 1) {
      addUniqueIssue(
        workflowHealthWarnings.value,
        `输出节点数量为 ${outputNodeCount}，请确认是否符合预期。`,
      )
    }

    const nodeIdCount = new Map<string, number>()
    const nodeMap = new Map<string, Node>()

    currentNodes.forEach((node, index) => {
      const nodeId = String(node.id ?? '')
      const nodeName = formatNodeName(node, index)

      if (!nodeId) {
        addUniqueIssue(workflowHealthErrors.value, `节点“${nodeName}”缺少 id。`)
        return
      }

      nodeIdCount.set(nodeId, (nodeIdCount.get(nodeId) ?? 0) + 1)
      nodeMap.set(nodeId, node)

      const isInput = node.type === 'inputs'
      const isOutput = node.type === 'outputs'

      if (!node.type) {
        addUniqueIssue(workflowHealthWarnings.value, `节点“${nodeName}”未设置 type。`)
      }

      if (!isInput && !isOutput) {
        const data = (node.data ?? {}) as Record<string, unknown>
        const isDataEmpty =
          data == null ||
          (Array.isArray(data) && data.length === 0) ||
          (!Array.isArray(data) && Object.keys(data).length === 0)

        if (isDataEmpty) {
          addUniqueIssue(workflowHealthWarnings.value, `节点“${nodeName}”尚未配置参数。`)
        }
      }
    })

    nodeIdCount.forEach((count, nodeId) => {
      if (count > 1) {
        addUniqueIssue(workflowHealthErrors.value, `节点 ID 重复：${nodeId}（重复 ${count} 次）。`)
        addSuggestion('确保每个节点 ID 唯一，避免运行时覆盖。')
      }
    })

    const incomingCount = new Map<string, number>()
    const outgoingCount = new Map<string, number>()
    nodeMap.forEach((_node, nodeId) => {
      incomingCount.set(nodeId, 0)
      outgoingCount.set(nodeId, 0)
    })

    const edgeIdCount = new Map<string, number>()
    const edgePairCount = new Map<string, number>()
    const validEdges: Array<{ id: string; source: string; target: string }> = []

    currentEdges.forEach((edge, index) => {
      const edgeId = String(edge.id ?? `edge_${index}`)
      const source = String(edge.source ?? '')
      const target = String(edge.target ?? '')

      edgeIdCount.set(edgeId, (edgeIdCount.get(edgeId) ?? 0) + 1)

      if (!source || !target) {
        addUniqueIssue(workflowHealthErrors.value, `连线“${edgeId}”缺少 source 或 target。`)
        return
      }

      if (!nodeMap.has(source) || !nodeMap.has(target)) {
        addUniqueIssue(
          workflowHealthErrors.value,
          `连线“${edgeId}”指向不存在的节点（${source} -> ${target}）。`,
        )
        addSuggestion('删除悬空连线，或补齐缺失节点。')
        return
      }

      if (source === target) {
        addUniqueIssue(
          workflowHealthWarnings.value,
          `连线“${edgeId}”形成自环（${source} -> ${target}）。`,
        )
        addSuggestion('避免节点自环，通常会导致流程循环执行。')
      }

      const pairKey = `${source}-->${target}`
      edgePairCount.set(pairKey, (edgePairCount.get(pairKey) ?? 0) + 1)

      incomingCount.set(target, (incomingCount.get(target) ?? 0) + 1)
      outgoingCount.set(source, (outgoingCount.get(source) ?? 0) + 1)
      validEdges.push({ id: edgeId, source, target })
    })

    edgeIdCount.forEach((count, edgeId) => {
      if (count > 1) {
        addUniqueIssue(
          workflowHealthWarnings.value,
          `连线 ID 重复：${edgeId}（重复 ${count} 次）。`,
        )
      }
    })

    edgePairCount.forEach((count, pair) => {
      if (count > 1) {
        addUniqueIssue(workflowHealthWarnings.value, `节点间存在重复连线：${pair}（${count} 条）。`)
      }
    })

    currentNodes.forEach((node, index) => {
      const nodeId = String(node.id ?? '')
      if (!nodeId || !nodeMap.has(nodeId)) return

      const nodeName = formatNodeName(node, index)
      const isInput = node.type === 'inputs'
      const isOutput = node.type === 'outputs'
      const incoming = incomingCount.get(nodeId) ?? 0
      const outgoing = outgoingCount.get(nodeId) ?? 0

      if (!isInput && incoming === 0) {
        addUniqueIssue(workflowHealthWarnings.value, `节点“${nodeName}”没有输入连线。`)
      }

      if (!isOutput && outgoing === 0) {
        addUniqueIssue(workflowHealthWarnings.value, `节点“${nodeName}”没有输出连线。`)
      }

      if (incoming === 0 && outgoing === 0) {
        addUniqueIssue(workflowHealthWarnings.value, `节点“${nodeName}”为孤立节点。`)
        addSuggestion('移除孤立节点，或将其接入主流程。')
      }
    })

    const inputIds = currentNodes
      .filter((node) => node.type === 'inputs')
      .map((node) => String(node.id))
    const outputIds = currentNodes
      .filter((node) => node.type === 'outputs')
      .map((node) => String(node.id))

    if (inputIds.length > 0) {
      const adjacency = new Map<string, string[]>()
      nodeMap.forEach((_node, id) => adjacency.set(id, []))
      validEdges.forEach(({ source, target }) => {
        adjacency.get(source)?.push(target)
      })

      const visited = new Set<string>()
      const queue = [...inputIds]

      while (queue.length > 0) {
        const current = queue.shift()!
        if (visited.has(current)) continue
        visited.add(current)
        const nextList = adjacency.get(current) ?? []
        nextList.forEach((next) => {
          if (!visited.has(next)) queue.push(next)
        })
      }

      nodeMap.forEach((node, nodeId) => {
        if (visited.has(nodeId)) return
        const nodeName = formatNodeName(node, 0)
        addUniqueIssue(workflowHealthWarnings.value, `节点“${nodeName}”从输入节点不可达。`)
        addSuggestion('检查连线方向，保证流程从输入可以到达每个关键节点。')
      })

      outputIds.forEach((outputId) => {
        if (!visited.has(outputId)) {
          addUniqueIssue(workflowHealthErrors.value, `输出节点“${outputId}”从输入不可达。`)
          addSuggestion('确保至少存在一条从输入到输出的完整路径。')
        }
      })
    }

    if (validEdges.length > 0 && nodeMap.size > 0) {
      const inDegree = new Map<string, number>()
      const nextMap = new Map<string, string[]>()

      nodeMap.forEach((_node, id) => {
        inDegree.set(id, 0)
        nextMap.set(id, [])
      })

      validEdges.forEach(({ source, target }) => {
        inDegree.set(target, (inDegree.get(target) ?? 0) + 1)
        nextMap.get(source)?.push(target)
      })

      const queue: string[] = []
      inDegree.forEach((degree, id) => {
        if (degree === 0) queue.push(id)
      })

      let processed = 0
      while (queue.length > 0) {
        const current = queue.shift()!
        processed += 1
        const children = nextMap.get(current) ?? []
        children.forEach((child) => {
          const nextDegree = (inDegree.get(child) ?? 0) - 1
          inDegree.set(child, nextDegree)
          if (nextDegree === 0) queue.push(child)
        })
      }

      if (processed < nodeMap.size) {
        addUniqueIssue(workflowHealthErrors.value, '检测到流程存在环路（循环依赖）。')
        addSuggestion('移除回环连线，保持流程有向无环。')
      }
    }

    const overlapPairs: string[] = []
    const overlapThreshold = 24
    for (let i = 0; i < currentNodes.length; i += 1) {
      for (let j = i + 1; j < currentNodes.length; j += 1) {
        const a = currentNodes[i]
        const b = currentNodes[j]
        if (!a || !b) continue

        const ax = Number(a.position?.x)
        const ay = Number(a.position?.y)
        const bx = Number(b.position?.x)
        const by = Number(b.position?.y)

        if (![ax, ay, bx, by].every((value) => Number.isFinite(value))) continue

        if (Math.abs(ax - bx) <= overlapThreshold && Math.abs(ay - by) <= overlapThreshold) {
          overlapPairs.push(`${formatNodeName(a, i)} / ${formatNodeName(b, j)}`)
        }
      }
    }

    if (overlapPairs.length > 0) {
      addUniqueIssue(
        workflowHealthWarnings.value,
        `检测到 ${overlapPairs.length} 组节点位置重叠，可能影响连线与编辑体验。`,
      )
      addSuggestion('适当拉开节点位置，或使用自动布局后再微调。')
    }

    if (workflowHealthErrors.value.length > 0) {
      workflowHealthStatus.value = 'error'
    } else if (workflowHealthWarnings.value.length > 0) {
      workflowHealthStatus.value = 'warning'
    } else {
      workflowHealthStatus.value = 'healthy'
    }

    const now = new Date()
    workflowHealthLastCheckedAt.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes(),
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

    workflowHealthHasChangesSinceLastCheck.value = false
  }

  const performWorkflowHealthCheck = () => {
    workflowHealthStatus.value = 'checking'
    window.setTimeout(() => {
      buildWorkflowHealth()
    }, 120)
  }

  watch(
    [nodes, edges],
    () => {
      if (workflowHealthStatus.value !== 'checking') {
        workflowHealthHasChangesSinceLastCheck.value = true
      }
    },
    { deep: true },
  )

  // 添加节点
  const addNode = (node: Node) => {
    nodes.value.push(node)
    setSelectedNode(node.id)

    // 记录操作后的状态
    historyStore.recordState(nodes.value, edges.value, 'add_node')
  }

  // 删除节点
  const removeNode = (nodeId: string) => {
    const removedNode = nodes.value.find((n) => String(n.id) === String(nodeId))
    if (!removedNode) return

    clearRemovedNodeReferences(removedNode as Node)
    nodes.value = nodes.value.filter((n) => n.id !== nodeId)
    edges.value = edges.value.filter((e) => e.source !== nodeId && e.target !== nodeId)
    if (selectedNode.value?.id === nodeId) {
      selectedNode.value = null
    }
    // 记录操作后的状态
    historyStore.recordState(nodes.value, edges.value, 'remove_node')
  }

  // 更新节点数据
  const updateNode = (nodeId: string, data: any) => {
    const nodeIndex = nodes.value.findIndex((n) => n.id === nodeId)

    if (nodeIndex === -1) return

    const nextData = cloneData(data)
    const currentNode = nodes.value[nodeIndex] as Node
    // console.log('更新节点数据前:', currentNode)
    const currentData = cloneData(currentNode.data)

    // 保证属性面板引用的是最新节点对象
    // 数据没有变化时不记录历史，避免无效历史堆积
    if (JSON.stringify(currentData) === JSON.stringify(nextData)) return

    const updatedNode = {
      ...currentNode,
      data: nextData,
    }
    if (selectedNode.value?.id === nodeId) {
      selectedNode.value = updatedNode
    }
    // console.log('更新节点数据后:', updatedNode)
    // 替换整个数组引用，确保依赖 nodes 的组件（如 VueFlow）能稳定感知更新
    nodes.value = nodes.value.map((node, index) =>
      index === nodeIndex ? (updatedNode as Node) : node,
    )
    if (String(updatedNode.type ?? '') === 'inputs') {
      updateAllData(updatedNode as Node, currentData, nextData)
    }

    // 记录操作后的状态
    historyStore.recordState(nodes.value, edges.value, 'update_node')
  }

  const updateNodeName = (nodeId: string, rawName: unknown): UpdateNodeNameResult => {
    const nodeIndex = nodes.value.findIndex((node) => String(node.id) === String(nodeId))
    if (nodeIndex === -1) return { ok: false, reason: 'not_found' }

    const currentNode = nodes.value[nodeIndex] as Node
    const nodeType = String(currentNode.type ?? '')
    if (nodeType === 'inputs' || nodeType === 'outputs') {
      return { ok: false, reason: 'readonly' }
    }

    const nextName = normalizeName(rawName)
    if (!nextName) return { ok: false, reason: 'empty' }

    const duplicated = nodes.value.some((node, index) => {
      if (index === nodeIndex) return false
      if (String(node.type ?? '') === 'inputs' || String(node.type ?? '') === 'outputs')
        return false
      const nodeName = normalizeName((node as any).name || (node as any).label)
      return nodeName === nextName
    })
    if (duplicated) return { ok: false, reason: 'duplicate' }

    const previousName = normalizeName((currentNode as any).name || (currentNode as any).label)
    if (previousName === nextName) return { ok: true, changed: false }

    const updatedNode = {
      ...currentNode,
      name: nextName,
      label: nextName,
    } as Node

    nodes.value = nodes.value.map((node, index) => (index === nodeIndex ? updatedNode : node))
    if (selectedNode.value?.id === nodeId) {
      selectedNode.value = updatedNode
    }

    replaceStepNameReferences({
      excludeNodeId: String(nodeId),
      oldName: previousName,
      newName: nextName,
    })

    historyStore.recordState(nodes.value, edges.value, 'update_node_name')
    return { ok: true, changed: true }
  }

  // 添加边
  const addEdge = (edge: Edge) => {
    edges.value.push({
      ...edge,
      ...getNodeEdgeType(),
    })
    // console.log('添加边:', edge)
    // 记录操作后的状态
    historyStore.recordState(nodes.value, edges.value, 'add_edge')
  }

  // 删除边
  const removeEdge = (edgeId: string) => {
    edges.value = edges.value.filter((e) => e.id !== edgeId)
    // 记录操作后的状态
    historyStore.recordState(nodes.value, edges.value, 'remove_edge')
  }

  // 设置当前选中的节点（用于右侧属性面板显示）
  const setSelectedNode = (nodeId: string | null) => {
    selectedNode.value = nodes.value.find((n) => n.id === nodeId) || null
  }
  const setCurrentHandleInfo = (nodeId: string, event: MouseEvent, sourceHandle?: string) => {
    currentHandleInfo.value = {
      nodeId,
      sourceHandle,
      position: { x: event.clientX, y: event.clientY },
    }
  }
  const clearCurrentHandleInfo = () => {
    currentHandleInfo.value = null
  }

  // 撤销操作
  const undo = () => {
    // console.log('workflow.undo() 被调用')
    try {
      const previousState = historyStore.undo()
      // console.log('撤销获取到的状态:', previousState)
      if (previousState) {
        nodes.value = previousState.nodes
        edges.value = previousState.edges
        // 撤销后清除选中状态
        selectedNode.value = null
        // console.log('撤销操作完成')
        return true
      } else {
        // console.log('没有可撤销的状态')
        return false
      }
    } catch (error) {
      console.error('撤销操作出错:', error)
      return false
    }
  }

  // 重做操作
  const redo = () => {
    // console.log('workflow.redo() 被调用')
    try {
      const nextState = historyStore.redo()
      // console.log('重做获取到的状态:', nextState)
      if (nextState) {
        nodes.value = nextState.nodes
        edges.value = nextState.edges
        // 重做后清除选中状态
        selectedNode.value = null
        // console.log('重做操作完成')
        return true
      } else {
        // console.log('没有可重做的状态')
        return false
      }
    } catch (error) {
      console.error('重做操作出错:', error)
      return false
    }
  }

  // 获取历史记录状态
  const canUndo = computed(() => historyStore.canUndo)
  const canRedo = computed(() => historyStore.canRedo)

  const getEdges = computed(() => edges.value)
  const getNodes = computed(() => nodes.value)
  const getViewportInfo = computed(() => viewportInfo.value)

  const getSaveWorkflowData = (): any => {
    // console.log('nodes.value', nodes.value)

    return {
      name: workflowInfo.value.workflowName,
      inputs: nodes.value
        .filter((item) => item.type === 'inputs')
        .map((item) => {
          const nodeData = item.data as any
          return {
            id: item.id,
            type: 'WorkflowImage',
            ui_position: item.position,
            name: nodeData?.[0]?.name || (item as any).name || '',
          }
        }),
      steps: nodes.value
        .filter((item) => item.type !== 'inputs' && item.type !== 'outputs')
        .map((item) => ({
          id: item.id,
          type: item.type,
          ui_position: item.position,
          name: item.name,
          ...(item.data as any),
        })),
      outputs: nodes.value
        .filter((item) => item.type === 'outputs')
        .map((item) => ({
          id: item.id,
          type: 'output@v1',
          ui_position: item.position,
          name: item.name,
          // outputs 是一个数组，每个元素是一个对象，包含 name type selector,过滤掉name\type\selector不存在的数据
          // outputs: outputSelector(),
          outputs: item.data.filter((output: any) => output.name && output.type && output.selector),
        })),
      edges: edges.value.map((item) => ({
        id: item.id,
        source: item.source,
        target: item.target,
        type: item.type || 'button',
        sourceHandle: item.sourceHandle,
      })),
      ui_metadata: {
        viewport: viewportInfo.value,
        nodes: nodes.value.map((item) => ({
          id: item.id,
          type: item.type,
          name: item.name,
          position: item.position,
          data: item.data,
        })),
      },
    }
  }
  // const outputSelector = () => {
  //   const outputs = nodes.value.filter((item) => item.type === 'outputs')
  //   const selectors =
  //     outputs[0]?.data?.filter((output: any) => output.name && output.type && output.selector) || []
  //   const selectorsNew = selectors.map((item: any) => ({
  //     name: item.name,
  //     type: item.type,
  //     selector:
  //       item.selector == '$steps.Classification_Model.predictions'
  //         ? '$steps.Classification_Model'
  //         : item.selector,
  //   }))
  //   console.log('outputs', outputs)
  //   console.log('selectorsNew', selectorsNew)
  //   return selectorsNew
  // }

  return {
    workflowInfo,
    viewportInfo,
    nodes,
    edges,
    selectedNode,
    canUndo,
    canRedo,
    historyStore, // 导出historyStore以便外部访问
    getEdges,
    getNodes,
    getViewportInfo,
    currentHandleInfo,
    workflowHealthStatus,
    workflowHealthWarnings,
    workflowHealthErrors,
    workflowHealthSuggestions,
    workflowHealthLastCheckedAt,
    workflowHealthHasChangesSinceLastCheck,
    workflowHealthNodeCount,
    workflowHealthEdgeCount,
    workflowHealthInputNodeCount,
    workflowHealthOutputNodeCount,
    workflowHealthSummaryTitle,
    workflowHealthSummaryDesc,
    addNode,
    removeNode,
    updateNode,
    updateNodeName,
    addEdge,
    removeEdge,
    setSelectedNode,
    undo,
    redo,
    initializeHistory,
    setWorkflowInfo,
    setViewportInfo,
    setCurrentHandleInfo,
    clearCurrentHandleInfo,
    performWorkflowHealthCheck,
    getSaveWorkflowData,
  }
})
