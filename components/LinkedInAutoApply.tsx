import React, { useState } from 'react'

export default function LinkedInAutoApply() {
  const [isRunning, setIsRunning] = useState(false)

  const toggleAutoApply = async () => {
    setIsRunning(!isRunning)
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { 
        type: isRunning ? 'STOP_AUTO_APPLY' : 'START_AUTO_APPLY'
      })
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">LinkedIn Auto Apply</h2>
      <button 
        onClick={toggleAutoApply}
        className={`px-4 py-2 rounded ${
          isRunning 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-green-500 hover:bg-green-600'
        } text-white`}
      >
        {isRunning ? 'Stop' : 'Start'} Auto Apply
      </button>
    </div>
  )
}
