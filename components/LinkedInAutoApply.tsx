import React, { useState } from 'react'

export default function LinkedInAutoApply() {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const toggleAutoApply = async () => {
    setIsRunning(!isRunning)
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { 
        type: isRunning ? 'STOP_AUTO_APPLY' : 'START_AUTO_APPLY'
      })
    }
  }

  const togglePause = async () => {
    setIsPaused(!isPaused)
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { 
        type: 'TOGGLE_PAUSE'
      })
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-slate-800">LinkedIn Auto Apply</h2>
        <span className={`px-2 py-0.5 text-sm rounded-full ${
          !isRunning 
            ? 'bg-slate-100 text-slate-600'
            : isPaused
            ? 'bg-amber-100 text-amber-700'
            : 'bg-emerald-100 text-emerald-700'
        }`}>
          {!isRunning ? 'Ready' : isPaused ? 'Paused' : 'Running'}
        </span>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={toggleAutoApply}
          className={`flex-1 px-4 py-2.5 rounded-md shadow-sm font-medium transition-all duration-150 ease-in-out flex items-center justify-center gap-2 ${
            isRunning 
              ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200' 
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isRunning ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            )}
          </svg>
          {isRunning ? 'Stop' : 'Start'}
        </button>
        {isRunning && (
          <button 
            onClick={togglePause}
            className={`px-4 py-2.5 rounded-md shadow-sm font-medium transition-all duration-150 ease-in-out flex items-center justify-center gap-2 ${
              isPaused 
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isPaused ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
              )}
            </svg>
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        )}
      </div>
    </div>
  )
}
