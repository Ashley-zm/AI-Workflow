export const nodeTypesList = [
  {
    name: 'Inputs',
    label: 'Inputs',
    description: '工作流程运行所需的数据',
    icon: 'ArrowUpFromLine',
    canSelecte: false,
    color: 'gray',
    type: 'inputs',
    nodeTag: 'inputs',
  },
  {
    name: 'Outputs',
    label: 'Outputs',
    description: '输出结果配置',
    icon: 'FileOutput',
    canSelecte: false,
    color: 'gray',
    type: 'outputs',
    nodeTag: 'outputs',
  },
  {
    name: 'Model',
    description: '运行一个基础模型',
    icon: 'Brain',
    canSelecte: true,
    color: 'blue',
    children: [
      {
        name: 'Detection_Model',
        label: 'Detection_Model',
        type: 'detection_model@v1',
        description: '目标检测',
        icon: 'Brain',
        color: 'blue',
        nodeTag: 'steps',
        outputs: ['predictions'],
      },
      {
        name: 'Classification_Model',
        label: 'Classification_Model',
        type: 'classification_model@v1',
        description: '图像分类',
        icon: 'Brain',
        color: 'blue',
        nodeTag: 'steps',
        outputs: ['predictions'],
      },
      {
        name: 'Segmentation_Model',
        label: 'Segmentation_Model',
        type: 'segmentation_model',
        description: '图像分割',
        icon: 'Brain',
        color: 'blue',
        nodeTag: 'steps',
        outputs: ['predictions'],
      },
    ],
  },
  {
    name: 'Visualization',
    description: '可视化模型输出',
    icon: 'VectorSquare',
    canSelecte: true,
    color: 'purple',
    children: [
      {
        name: 'Bounding_Box',
        label: 'Bounding_Box',
        type: 'bounding_box_visualization@v1',
        description: '检测的物体周围画一个方框',
        icon: 'VectorSquare',
        color: 'purple',
        nodeTag: 'steps',
        outputs: ['predictions', 'image'],
      },
      {
        name: 'Polygon_Visualization',
        label: 'Polygon_Visualization',
        type: 'polygon_visualization',
        description: '检测的物体周围画一个多边形',
        icon: 'VectorSquare',
        color: 'purple',
        nodeTag: 'steps',
        outputs: ['predictions', 'image'],
      },
      {
        name: 'Label_Visualization',
        label: 'Label_Visualization',
        type: 'label_visualization',
        description: '检测的物体上画标签',
        icon: 'Tag',
        color: 'purple',
        nodeTag: 'steps',
        outputs: ['predictions', 'image'],
      },
    ],
  },
  {
    name: 'Conditional_Branch',
    description: '根据条件将流程分发到不同路径',
    icon: 'GitBranch',
    canSelecte: true,
    color: 'orange',
    children: [
      {
        name: 'If_Else',
        label: 'If_Else',
        type: 'conditional_branch@v1',
        description: '根据布尔条件在两个分支间路由',
        icon: 'Filter',
        color: 'orange',
        nodeTag: 'steps',
      },
    ],
  },
]

export const getNodeType = (type: string | undefined) => {
  if (!type) {
    return null
  }
  const findNodeType: (items: any[], type: string) => any = (items: any[], type: string) => {
    for (const item of items) {
      if (item.children) {
        const found = findNodeType(item.children, type)
        if (found) return found
      } else if (item.type === type) {
        return item
      }
    }
    return null
  }
  return findNodeType(nodeTypesList, type)
}

export const getOutputsByType = (type: string | undefined): string[] => {
  const nodeType = getNodeType(type)
  const outputs = nodeType?.outputs
  if (!Array.isArray(outputs)) {
    return []
  }

  return outputs
    .map((item: any) => {
      if (typeof item === 'string') return item
      if (item && typeof item === 'object') {
        return item.value || item.name || item.key || ''
      }
      return ''
    })
    .filter((item: string) => typeof item === 'string' && item.length > 0)
}
