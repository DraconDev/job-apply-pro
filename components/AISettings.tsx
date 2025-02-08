import React from "react";

export default function AISettings() {
  const openAISettings = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("aisettings.html") });
  };

  return (
    <button
      onClick={openAISettings}
      className="relative w-full px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
    >
      <svg
        className="absolute w-4 h-4 left-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 2H7v2H5v2H3v8h2v2h2v2h2v2h6v-2h2v-2h2v-2h2V6h-2V4h-2V2h-2v2h-4V2zM7 8h10v6H7V8z"
        />
      </svg>
      <span className="flex-grow text-base text-center">AI Settings</span>
    </button>
  );
}
