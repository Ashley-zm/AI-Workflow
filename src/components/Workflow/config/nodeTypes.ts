import { markRaw } from 'vue'
import ObjectDetectionModelNode from '@/components/Workflow/Nodes/Model/ObjectDetectionModelNode.vue'
import InputNode from '@/components/Workflow/Nodes/InputNode.vue'
import ClassificationModelNode from '@/components/Workflow/Nodes/Model/ClassificationModelNode.vue'
import SegmentationModelNode from '@/components/Workflow/Nodes/Model/SegmentationModelNode.vue'
import OutputNode from '@/components/Workflow/Nodes/OutputNode.vue'
import type { NodeTypesObject } from '@vue-flow/core'
import { MarkerType } from '@vue-flow/core'

export const nodeTypes = {
  inputs: markRaw(InputNode),
  object_detection_model: markRaw(ObjectDetectionModelNode),
  classification_model: markRaw(ClassificationModelNode),
  segmentation_model: markRaw(SegmentationModelNode),
  outputs: markRaw(OutputNode),
} as NodeTypesObject

export const nodeTypesList = [
  {
    name: 'Inputs',
    description: '输入节点',
    icon: 'ArrowUpFromLine',
    canSelecte: false,
    color: 'gray',
    type: 'inputs',
  },
  {
    name: 'Outputs',
    description: '输出节点',
    icon: 'ArrowUpFromLine',
    canSelecte: false,
    color: 'gray',
    type: 'outputs',
  },
  {
    name: 'Model',
    description: '模型节点',
    icon: 'Brain',
    canSelecte: true,
    color: 'blue',
    children: [
      // 模型节点
      {
        name: 'Object_Detction_Model', // 目标检测模型
        type: 'object_detection_model',
        description: '目标检测模型',
        icon: 'Brain',
        color: 'blue',
      },
      {
        name: 'Classification_Model', // 分类模型
        type: 'classification_model',
        description: '图像分类模型',
        icon: 'Filter',
        color: 'green',
      },
      {
        name: 'Segmentation_Model', // 分割模型
        type: 'segmentation_model',
        description: '图像分割模型',
        icon: 'Crop',
        color: 'purple',
      },
    ],
  },
  {
    name: 'Visualization',
    description: '可视化节点',
    icon: 'Operation',
    canSelecte: true,
    color: 'amber',
    children: [
      // 处理节点
      {
        name: 'Image_Preprocess', // 图像预处理
        type: 'image_preprocess',
        description: '图像预处理节点，用于图像增强和标准化',
        icon: 'Magic',
        color: 'amber',
      },
      {
        name: 'Data_Filter', // 数据过滤
        type: 'data_filter',
        description: '数据过滤节点，用于筛选和清理数据',
        icon: 'Filter',
        color: 'yellow',
      },
    ],
  },
]
// 获取节点类型
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
// 获取节点边类型
export const getNodeEdgeType = (type: string) => {
  if (type === 'button')
    return {
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#5e5e5eff',
      },
      style: {
        stroke: '#5e5e5eff',
      },
    }
  return {
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#5e5e5eff',
    },
    style: {
      stroke: '#5e5e5eff',
    },
  }
}
