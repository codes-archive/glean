// Electron API type declarations
declare global {
  interface Window {
    electronAPI?: {
      getApiUrl: () => Promise<string>
      setApiUrl: (url: string) => Promise<boolean>
      getPlatform: () => Promise<{
        platform: string
        arch: string
        version: string
        name: string
      }>
      isElectron: boolean
    }
  }
}

export {}
