import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'

const env = import.meta.env as Record<string, string | undefined>

const timeout = Number(env.VITE_APP_TIMEOUT ?? 15000)
const baseURL = env.VITE_APP_BASE_API ?? ''
const clientId = (env.VITE_APP_CLIENT_ID ?? '').trim()

export const http = axios.create({
  baseURL,
  timeout: Number.isNaN(timeout) ? 15000 : timeout,
})

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // const adminToken = (window.localStorage.getItem('Admin-Token') ?? '').trim()

  // if (!adminToken) {
  //   return Promise.reject(new Error('缺少 Admin-Token，无法发起请求'))
  // }

  if (!clientId) {
    return Promise.reject(new Error('缺少 VITE_APP_CLIENT_ID，无法发起请求'))
  }

  const headers = AxiosHeaders.from(config.headers)
  headers.set(
    'Authorization',
    `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOiJzeXNfdXNlcjoxIiwicm5TdHIiOiJVNEFJV3hPNlJKWHRKOHJ5Qkk3bkNrc0xpeHozeEFXVCIsImNsaWVudGlkIjoiZTVjZDdlNDg5MWJmOTVkMWQxOTIwNmNlMjRhN2IzMmUiLCJ0ZW5hbnRJZCI6IjAwMDAwMCIsInVzZXJJZCI6MSwidXNlck5hbWUiOiJhZG1pbiIsImRlcHRJZCI6MTAzLCJkZXB0TmFtZSI6IueglOWPkemDqOmXqCIsImRlcHRDYXRlZ29yeSI6IiJ9.xSYbgn_4x6E5NxaUHqBMGa9vkOwSkheLz_n5DjUYWxU`,
  )
  // headers.set('Authorization', `Bearer ${adminToken}`)
  headers.set('Clientid', clientId)
  config.headers = headers

  return config
})

http.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error),
)
