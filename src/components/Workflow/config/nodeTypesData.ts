export const nodeTypesList = [
  {
    name: 'Inputs',
    description: '工作流程运行所需的数据',
    icon: 'ArrowUpFromLine',
    canSelecte: false,
    color: 'gray',
    type: 'inputs',
    nodeTag: 'inputs',
    config: [],
  },
  {
    name: 'Outputs',
    description: '查看最终结果及输入数据',
    icon: 'FileOutput',
    canSelecte: false,
    color: 'gray',
    type: 'outputs',
    nodeTag: 'outputs',
    config: [],
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
        type: 'detection_model@v1',
        description: '目标检测模型',
        icon: 'Brain',
        color: 'blue',
        nodeTag: 'model',
        config: [],
      },
      {
        name: 'Classification_Model',
        type: 'classification_model',
        description: '图像分类模型',
        icon: 'Filter',
        color: 'blue',
        nodeTag: 'model',
        config: [],
      },
      {
        name: 'Segmentation_Model',
        type: 'segmentation_model',
        description: '图像分割模型',
        icon: 'Crop',
        color: 'blue',
        nodeTag: 'model',
        config: [],
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
        type: 'bounding_box',
        description: '检测的物体周围画一个方框',
        icon: 'VectorSquare',
        color: 'purple',
        nodeTag: 'visualization',
        config: [],
      },
      {
        name: 'Polygon_Visualization',
        type: 'polygon_visualization',
        description: '检测的物体周围画一个多边形',
        icon: 'VectorSquare',
        color: 'purple',
        nodeTag: 'visualization',
        config: [],
      },
      {
        name: 'Label_Visualization',
        type: 'label_visualization',
        description: '检测的物体上画标签',
        icon: 'Tag',
        color: 'purple',
        nodeTag: 'visualization',
        config: [],
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
        type: 'if_else',
        description: '根据布尔条件在两个分支间路由',
        icon: 'Filter',
        color: 'orange',
        nodeTag: 'conditional_branch',
        config: [],
      },
      {
        name: 'Switch_Case',
        type: 'switch_case',
        description: '根据字段值路由到多个分支',
        icon: 'Route',
        color: 'orange',
        nodeTag: 'conditional_branch',
        config: [],
      },
    ],
  },
]

export const getNodeType = (type: string) => {
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
