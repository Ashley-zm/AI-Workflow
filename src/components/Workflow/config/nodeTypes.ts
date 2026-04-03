import { markRaw } from 'vue'
import type { NodeTypesObject } from '@vue-flow/core'
import { MarkerType } from '@vue-flow/core'
import ObjectDetectionModelNode from '@/components/Workflow/Nodes/Model/ObjectDetectionModelNode.vue'
import InputNode from '@/components/Workflow/Nodes/InputNode.vue'
import ClassificationModelNode from '@/components/Workflow/Nodes/Model/ClassificationModelNode.vue'
import SegmentationModelNode from '@/components/Workflow/Nodes/Model/SegmentationModelNode.vue'
import OutputNode from '@/components/Workflow/Nodes/OutputNode.vue'
import BoundingBoxVisualizationNode from '@/components/Workflow/Nodes/Visualization/BoundingBoxVisualizationNode.vue'
import PolygonVisualizationNode from '@/components/Workflow/Nodes/Visualization/PolygonVisualizationNode.vue'
import LabelVisualizationNode from '@/components/Workflow/Nodes/Visualization/LabelVisualizationNode.vue'
import IfElseNode from '@/components/Workflow/Nodes/Conditional/IfElseNode.vue'
import { nodeTypesList, getNodeType } from './nodeTypesData'

const allNodeTypes = {
  inputs: markRaw(InputNode),
  outputs: markRaw(OutputNode),
  'detection_model@v1': markRaw(ObjectDetectionModelNode),
  classification_model: markRaw(ClassificationModelNode),
  segmentation_model: markRaw(SegmentationModelNode),
  bounding_box: markRaw(BoundingBoxVisualizationNode),
  polygon_visualization: markRaw(PolygonVisualizationNode),
  label_visualization: markRaw(LabelVisualizationNode),
  if_else: markRaw(IfElseNode),
  switch_case: markRaw(IfElseNode),
} as NodeTypesObject

export { allNodeTypes, nodeTypesList, getNodeType }

export const getNodeEdgeType = () => {
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
