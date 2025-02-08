import { useState, useEffect } from 'react'
import { storage } from 'wxt/storage'

import { AISettings } from '../../src/common/types'

const defaultSettings: AISettings = {
  apiKey: '',
  formPrompt: 'Fill this form as a senior software engineer with 8+ years of experience in full-stack development, focusing on React, Node.js, and cloud technologies.'
}

export default function App() {
  const [settings, setSettings] = useState<AISettings>(defaultSettings)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const storedSettings = await storage.getItem('aiSettings') as AISettings
    if (storedSettings) {
      setSettings(storedSettings)
    }
  }

  const saveSettings = async () => {
    await storage.setItem('aiSettings', settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-2xl p-6 mx-auto bg-white rounded-lg shadow">
        <h1 className="mb-6 text-2xl font-bold">AI Settings</h1>
        
        <div className="space-y-6">
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
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <p className="mt-2 text-center text-green-600">Settings saved successfully!</p>
          )}
        </div>
      </div>
    </div>
  )
}
