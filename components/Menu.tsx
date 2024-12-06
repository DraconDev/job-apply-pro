import React, { useState } from 'react'
import PersonalInfo from './PersonalInfo'

export default function Menu() {
  const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsPersonalInfoOpen(!isPersonalInfoOpen)}
        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
      >
        <svg 
          className="w-5 h-5 mr-2" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
          />
        </svg>
        Profile
      </button>

      {isPersonalInfoOpen && (
        <div className="absolute right-0 mt-2 w-[500px] bg-white rounded-lg shadow-lg border z-50">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">Personal Information</h2>
            <button
              onClick={() => setIsPersonalInfoOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <PersonalInfo />
        </div>
      )}
    </div>
  )
}
