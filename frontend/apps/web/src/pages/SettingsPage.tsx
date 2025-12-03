import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { User, Mail, Shield, CheckCircle, AlertCircle, Clock, Loader2, Eye, Server } from 'lucide-react'
import { Label, Button } from '@glean/ui'

// Read later expiration options
const READ_LATER_OPTIONS = [
  { value: 1, label: '1 day' },
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 0, label: 'Never expire' },
]

/**
 * Settings page.
 *
 * User profile and application settings.
 */
export default function SettingsPage() {
  const { user, updateSettings, isLoading } = useAuthStore()
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Electron-specific state
  const [isElectron, setIsElectron] = useState(false)
  const [apiUrl, setApiUrl] = useState('http://localhost:8000')
  const [apiUrlInput, setApiUrlInput] = useState('')
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | null>(null)

  // Get current read_later_days from user settings, default to 7
  const currentReadLaterDays = user?.settings?.read_later_days ?? 7
  const showReadLaterRemaining = user?.settings?.show_read_later_remaining ?? true

  // Check if running in Electron and load API URL
  useEffect(() => {
    const checkElectron = async () => {
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        setIsElectron(true)
        try {
          const url = await (window as any).electronAPI.getApiUrl()
          setApiUrl(url)
          setApiUrlInput(url)
        } catch (error) {
          console.error('Failed to load API URL:', error)
        }
      }
    }
    checkElectron()
  }, [])

  const handleReadLaterDaysChange = async (days: number) => {
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      await updateSettings({ read_later_days: days })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch {
      // Error is handled by the store
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleShowRemaining = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      await updateSettings({ show_read_later_remaining: !showReadLaterRemaining })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch {
      // Error is handled by the store
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    setConnectionStatus(null)
    try {
      const response = await fetch(`${apiUrlInput}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })
      if (response.ok) {
        setConnectionStatus('success')
        setTimeout(() => setConnectionStatus(null), 3000)
      } else {
        setConnectionStatus('error')
      }
    } catch (error) {
      console.error('Connection test failed:', error)
      setConnectionStatus('error')
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleSaveApiUrl = async () => {
    if (!isElectron) return

    setIsSaving(true)
    try {
      await (window as any).electronAPI.setApiUrl(apiUrlInput)
      setApiUrl(apiUrlInput)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
      // Reload to use new API URL
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      console.error('Failed to save API URL:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-full bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Settings</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">Manage your account and preferences</p>
        </div>

        {/* Profile section */}
        <section className="animate-fade-in mb-6 rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground">Profile</h2>
          </div>

          <div className="space-y-5">
            {/* Name */}
            <div>
              <Label className="mb-2 block text-sm text-muted-foreground">Name</Label>
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-foreground">{user?.name || 'Not set'}</span>
              </div>
            </div>

            {/* Email */}
            <div>
              <Label className="mb-2 block text-sm text-muted-foreground">Email</Label>
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-foreground">{user?.email}</span>
              </div>
            </div>

            {/* Account Status */}
            <div>
              <Label className="mb-2 block text-sm text-muted-foreground">Account Status</Label>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                    user?.is_active
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-destructive/10 text-destructive'
                  }`}
                >
                  {user?.is_active ? (
                    <CheckCircle className="h-3.5 w-3.5" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5" />
                  )}
                  {user?.is_active ? 'Active' : 'Inactive'}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                    user?.is_verified
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  {user?.is_verified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Backend Server Configuration (Electron only) */}
        {isElectron && (
          <section className="animate-fade-in mb-6 rounded-xl border border-border bg-card p-6" style={{ animationDelay: '50ms' }}>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Server className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-xl font-semibold text-foreground">Backend Server</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="mb-2 block text-sm text-muted-foreground">
                  API Server URL
                </Label>
                <p className="mb-4 text-xs text-muted-foreground">
                  Configure the backend server URL for the desktop application.
                  Changes require an application reload.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={apiUrlInput}
                    onChange={(e) => setApiUrlInput(e.target.value)}
                    placeholder="http://localhost:8000"
                    className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    disabled={isSaving || isTestingConnection}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestConnection}
                    disabled={isSaving || isTestingConnection || !apiUrlInput}
                    className="min-w-[100px]"
                  >
                    {isTestingConnection ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing
                      </>
                    ) : (
                      'Test'
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveApiUrl}
                    disabled={isSaving || isTestingConnection || apiUrl === apiUrlInput}
                    className="min-w-[100px]"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving
                      </>
                    ) : (
                      'Save'
                    )}
                  </Button>
                </div>
              </div>

              {/* Connection Status */}
              {connectionStatus && (
                <div className={`flex items-center gap-2 text-sm ${
                  connectionStatus === 'success' ? 'text-green-500' : 'text-destructive'
                }`}>
                  {connectionStatus === 'success' ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Connection successful
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4" />
                      Connection failed - please check the URL
                    </>
                  )}
                </div>
              )}

              {/* Current API URL */}
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground mb-1">Current API URL:</p>
                <p className="text-sm font-mono text-foreground">{apiUrl}</p>
              </div>
            </div>
          </section>
        )}

        {/* Read Later Settings */}
        <section className="animate-fade-in mb-6 rounded-xl border border-border bg-card p-6" style={{ animationDelay: isElectron ? '100ms' : '50ms' }}>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground">Read Later</h2>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="mb-2 block text-sm text-muted-foreground">
                Auto-cleanup Period
              </Label>
              <p className="mb-4 text-xs text-muted-foreground">
                Items marked as &quot;Read Later&quot; will be automatically removed after this period.
                Set to &quot;Never expire&quot; to keep them indefinitely.
              </p>
              <div className="flex flex-wrap gap-2">
                {READ_LATER_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={currentReadLaterDays === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleReadLaterDaysChange(option.value)}
                    disabled={isSaving || isLoading}
                    className="min-w-[100px]"
                  >
                    {isSaving && currentReadLaterDays !== option.value ? null : currentReadLaterDays === option.value && isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Show remaining time toggle */}
            <div className="border-t border-border pt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label className="block text-sm font-medium text-foreground">
                      Show Remaining Time
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Display how much time is left before items expire in the Read Later list
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggleShowRemaining}
                  disabled={isSaving || isLoading}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    showReadLaterRemaining ? 'bg-primary' : 'bg-muted'
                  } ${isSaving || isLoading ? 'opacity-50' : ''}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      showReadLaterRemaining ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {saveSuccess && (
              <p className="flex items-center gap-1.5 text-sm text-green-500">
                <CheckCircle className="h-4 w-4" />
                Settings saved
              </p>
            )}
          </div>
        </section>

        {/* App info */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>Glean v0.1.0</p>
          <p className="mt-1">Your personal knowledge management companion</p>
        </div>
      </div>
    </div>
  )
}
