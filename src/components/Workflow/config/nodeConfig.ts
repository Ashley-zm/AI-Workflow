import * as LucideIconsVue from 'lucide-vue-next'
// 获取图标组件
export const getIconComponent = (iconName: string) => {
  return (LucideIconsVue as any)[iconName] || null
}
export const getNodeTypeIcon = (type: string | undefined) => {
  if (!type) return LucideIconsVue.Database
  const iconMap: Record<string, any> = {
    inputs: LucideIconsVue.Image,
    outputs: LucideIconsVue.Type,
    model: LucideIconsVue.Brain,
    processing: LucideIconsVue.Hash,
    visualization: LucideIconsVue.Type,
    conditional_branch: LucideIconsVue.GitBranch,
    if_else: LucideIconsVue.Filter,
    switch_case: LucideIconsVue.Route,
  }
  return iconMap[type] || LucideIconsVue.Database
}

export const getNodeTypeLabel = (type: string | undefined) => {
  if (!type) return ''
  const typeMap: Record<string, string> = {
    inputs: '输入',
    outputs: '输出',
    model: '模型',
    processing: '处理',
    visualization: '可视化',
    conditional_branch: '条件分支',
    if_else: 'If/Else',
    switch_case: 'Switch/Case',
  }
  return typeMap[type] || type
}
export const getParamTypeIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    number: LucideIconsVue.Hash,
    string: LucideIconsVue.Type,
    boolean: LucideIconsVue.ToggleLeft,
    array: LucideIconsVue.Database,
    object: LucideIconsVue.Database,
  }
  return iconMap[type] || LucideIconsVue.Type
}
// ----------------------画布节点样式-----------------

// ----------------------节点库节点样式-----------------
// 获取子级悬停类名
export const getChildHoverClasses = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: 'hover:border-blue-500 hover:bg-blue-50',
    green: 'hover:border-green-500 hover:bg-green-50',
    purple: 'hover:border-purple-500 hover:bg-purple-50',
    orange: 'hover:border-orange-500 hover:bg-orange-50',
    red: 'hover:border-red-500 hover:bg-red-50',
    indigo: 'hover:border-indigo-500 hover:bg-indigo-50',
    emerald: 'hover:border-emerald-500 hover:bg-emerald-50',
    teal: 'hover:border-teal-500 hover:bg-teal-50',
    amber: 'hover:border-amber-500 hover:bg-amber-50',
    yellow: 'hover:border-yellow-500 hover:bg-yellow-50',
    gray: 'hover:border-gray-500 hover:bg-gray-50',
  }
  return colorMap[color] || 'hover:border-blue-500 hover:bg-blue-50'
}

// 获取悬停文本颜色
export const getHoverTextColor = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: 'group-hover:text-blue-500',
    green: 'group-hover:text-green-500',
    purple: 'group-hover:text-purple-500',
    orange: 'group-hover:text-orange-500',
    red: 'group-hover:text-red-500',
    indigo: 'group-hover:text-indigo-500',
    emerald: 'group-hover:text-emerald-500',
    teal: 'group-hover:text-teal-500',
    amber: 'group-hover:text-amber-500',
    yellow: 'group-hover:text-yellow-500',
  }
  return colorMap[color] || 'group-hover:text-blue-500'
}

// emerald 绿色
