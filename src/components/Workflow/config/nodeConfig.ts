import * as LucideIconsVue from 'lucide-vue-next'
// 获取图标组件
export const getIconComponent = (iconName: string) => {
  return (LucideIconsVue as any)[iconName] || null
}

// 获取颜色配置
// 获取文本颜色类名
export const getTextColor = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    indigo: 'text-indigo-600',
    emerald: 'text-emerald-600',
    teal: 'text-teal-600',
    amber: 'text-amber-600',
    yellow: 'text-yellow-600',
    gray: 'text-gray-600',
  }
  return colorMap[color] || 'text-blue-600'
}

// 获取悬停文本颜色类名
// 获取悬停文本颜色类名
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

// 获取父级悬停类名
export const getHoverClasses = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: 'hover:bg-blue-50 hover:border-blue-500',
    green: 'hover:bg-green-50 hover:border-green-500',
    purple: 'hover:bg-purple-50 hover:border-purple-500',
    orange: 'hover:bg-orange-50 hover:border-orange-500',
    red: 'hover:bg-red-50 hover:border-red-500',
    indigo: 'hover:bg-indigo-50 hover:border-indigo-500',
    emerald: 'hover:bg-emerald-50 hover:border-emerald-500',
    teal: 'hover:bg-teal-50 hover:border-teal-500',
    amber: 'hover:bg-amber-50 hover:border-amber-500',
    yellow: 'hover:bg-yellow-50 hover:border-yellow-500',
    gray: 'hover:bg-gray-50 hover:border-gray-500',
  }
  return colorMap[color] || 'hover:bg-blue-50 hover:border-blue-500'
}

// 获取图标背景类名
export const getIconClasses = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 group-hover:bg-blue-200',
    green: 'bg-green-100 group-hover:bg-green-200',
    purple: 'bg-purple-100 group-hover:bg-purple-200',
    orange: 'bg-orange-100 group-hover:bg-orange-200',
    red: 'bg-red-100 group-hover:bg-red-200',
    indigo: 'bg-indigo-100 group-hover:bg-indigo-200',
    emerald: 'bg-emerald-100 group-hover:bg-emerald-200',
    teal: 'bg-teal-100 group-hover:bg-teal-200',
    amber: 'bg-amber-100 group-hover:bg-amber-200',
    yellow: 'bg-yellow-100 group-hover:bg-yellow-200',
    gray: 'bg-gray-100 group-hover:bg-gray-200',
  }
  return colorMap[color] || 'bg-blue-100 group-hover:bg-blue-200'
}

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

// 获取子级图标背景类名
export const getChildIconClasses = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 group-hover:bg-blue-300',
    green: 'bg-green-100 group-hover:bg-green-300',
    purple: 'bg-purple-100 group-hover:bg-purple-300',
    orange: 'bg-orange-100 group-hover:bg-orange-300',
    red: 'bg-red-100 group-hover:bg-red-300',
    indigo: 'bg-indigo-100 group-hover:bg-indigo-300',
    emerald: 'bg-emerald-100 group-hover:bg-emerald-300',
    teal: 'bg-teal-100 group-hover:bg-teal-300',
    amber: 'bg-amber-100 group-hover:bg-amber-300',
    yellow: 'bg-yellow-100 group-hover:bg-yellow-300',
    gray: 'bg-gray-100 group-hover:bg-gray-300',
  }
  return colorMap[color] || 'bg-blue-100 group-hover:bg-blue-300'
}
