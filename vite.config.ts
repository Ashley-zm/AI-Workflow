import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue(), tailwindcss()],
    base: '/workflow/',
    // plugins: [vue(), tailwindcss(), vueDevTools()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        [env.VITE_APP_BASE_API]: {
          target: env.VITE_PROXY_TARGET,
          changeOrigin: true,
          secure: false,
          // 将请求路径中的前缀替换为空字符串
          rewrite: (path: string) => path.replace(new RegExp('^' + env.VITE_APP_BASE_API), ''),
        },
        '/baidu': {
          target: 'https://fanyi-api.baidu.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/baidu/, ''),
        },
      },
    },
  }
})
