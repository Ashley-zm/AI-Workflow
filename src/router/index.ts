import { createRouter, createWebHistory } from 'vue-router'
import WorkflowManage from '@/views/WorkflowManage.vue'
import Workflow from '@/views/Workflow.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'workflow-manage',
      component: WorkflowManage,
    },
    {
      path: '/workflow/editor/:id?',
      name: 'workflow-editor',
      component: Workflow,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

export default router
