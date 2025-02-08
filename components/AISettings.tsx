import React from 'react'
import browser from 'wxt/browser'

export default function AISettings() {
  const openAISettings = () => {
    browser.runtime.openOptionsPage()
  }

  return (
    <button
      onClick={openAISettings}
      className="w-full px-4 py-3 text-sm font-medium text-left text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      🤖 AI Settings
    </button>
  )
}
