import { contextBridge, ipcRenderer } from 'electron'

// 通过 contextBridge 安全地暴露配置 API 给渲染进程
contextBridge.exposeInMainWorld('configAPI', {
  // 获取后端 API URL
  getApiUrl: () => ipcRenderer.invoke('get-api-url'),

  // 设置后端 API URL
  setApiUrl: (url: string) => ipcRenderer.invoke('set-api-url', url),

  // 打开主窗口
  openMainWindow: () => ipcRenderer.send('open-main-window'),
})

// TypeScript 类型声明
export interface ConfigAPI {
  getApiUrl: () => Promise<string>
  setApiUrl: (url: string) => Promise<boolean>
  openMainWindow: () => void
}

declare global {
  interface Window {
    configAPI: ConfigAPI
  }
}
