import React from "react";

export default function AISettings() {
  const openAISettings = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("aisettings.html") });
  };

  return (
    <button
      onClick={openAISettings}
      className="w-full px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center shadow-sm"
    >
      <svg
        className="w-4 h-4 mr-2"
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
      <span className="text-base">AI Settings</span>
    </button>
  );
}
