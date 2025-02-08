import { useState, useEffect } from 'react'
import { storage } from 'wxt/storage'
import { AISettings } from '../src/common/types'

const defaultSettings: AISettings = {
  apiKey: '',
  formPrompt: 'Fill this form as a senior software engineer with 8+ years of experience in full-stack development, focusing on React, Node.js, and cloud technologies.'
}

export default function AISettings() {
  const [settings, setSettings] = useState<AISettings>(defaultSettings)
  const [saved, setSaved] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const storedSettings = await storage.getItem('sync:aiSettings') as AISettings
    if (storedSettings) {
      setSettings(storedSettings)
    }
  }

  const saveSettings = async () => {
    await storage.setItem('sync:aiSettings', settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full px-4 py-3 text-sm font-medium text-left text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        📝 AI Settings
      </button>
    )
  }

  return (
    <div className="w-full p-4 bg-white border border-gray-200 rounded">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-800">AI Settings</h2>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Gemini API Key
          </label>
          <input
            type="password"
            value={settings.apiKey}
            onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your Gemini API key"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Form Filling Prompt
          </label>
          <textarea
            value={settings.formPrompt}
            onChange={(e) => setSettings({...settings, formPrompt: e.target.value})}
            className="w-full h-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter the prompt to use when filling forms"
          />
        </div>

        <button
          onClick={saveSettings}
          className="w-full px-4 py-2 text-white transition-colors bg-blue-500 rounded hover:bg-blue-600"
        >
          Save Settings
        </button>

        {saved && (
          <p className="text-sm text-center text-green-600">Settings saved!</p>
        )}
      </div>
    </div>
  )
}
