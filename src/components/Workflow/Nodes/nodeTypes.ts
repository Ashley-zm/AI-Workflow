import { markRaw } from 'vue'
import ObjectDetectionModelNode from './ObjectDetectionModelNode.vue'
import InputNode from './InputNode.vue'
import type { NodeTypesObject } from '@vue-flow/core'
import ClassificationModelNode from './ClassificationModelNode.vue'
import SegmentationModelNode from './SegmentationModelNode.vue'
import OutputNode from './OutputNode.vue'

export const nodeTypes = {
  inputs: markRaw(InputNode),
  object_detection_model: markRaw(ObjectDetectionModelNode),
  classification_model: markRaw(ClassificationModelNode),
  segmentation_model: markRaw(SegmentationModelNode),
  outputs: markRaw(OutputNode),
} as NodeTypesObject

export const nodeTypesList = [
  {
    name: 'Model',
    description: '模型节点',
    icon: 'Brain',
    selected: false,
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
  //   {
  //     name: 'Input',
  //     description: '输入节点',
  //     icon: 'UploadFilled',
  //     selected: false,
  //     color: 'orange',
  //     children: [
  //       // 输入节点
  //       {
  //         name: 'Image_Input', // 图像输入
  //         type: 'image_input',
  //         description: '图像输入节点，用于上传和处理图像数据',
  //         icon: 'Picture',
  //         color: 'orange',
  //       },
  //       {
  //         name: 'Video_Input', // 视频输入
  //         type: 'video_input',
  //         description: '视频输入节点，用于上传和处理视频数据',
  //         icon: 'VideoCamera',
  //         color: 'red',
  //       },
  //       {
  //         name: 'Text_Input', // 文本输入
  //         type: 'text_input',
  //         description: '文本输入节点，用于输入和处理文本数据',
  //         icon: 'Edit',
  //         color: 'indigo',
  //       },
  //     ],
  //   },
  //   {
  //     name: 'Output',
  //     description: '输出节点',
  //     icon: 'Download',
  //     selected: false,
  //     color: 'emerald',
  //     children: [
  //       // 输出节点
  //       {
  //         name: 'Image_Output', // 图像输出
  //         type: 'image_output',
  //         description: '图像输出节点，用于保存和显示处理结果',
  //         icon: 'Picture',
  //         color: 'emerald',
  //       },
  //       {
  //         name: 'JSON_Output', // JSON输出
  //         type: 'json_output',
  //         description: 'JSON输出节点，用于导出结构化数据',
  //         icon: 'Document',
  //         color: 'teal',
  //       },
  //     ],
  //   },
  {
    name: 'Visualization',
    description: '可视化节点',
    icon: 'Operation',
    selected: false,
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
  //遍历nodeTypesList所有子项，查找type对应的节点类型，并返回子项数据
  return nodeTypesList
    .find((item) => item.children.some((child) => child.type === type))
    ?.children.find((child) => child.type === type)
}
