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
          d="M12 2C6.477 2 2 6.477 2 12c0 4.411 2.865 8.136 6.837 9.39.5.092.682-.216.682-.48V20h2.96c.54 0 .98-.44.98-.98v-1.04c0-.54-.44-.98-.98-.98h-1.96V15h1.96c.54 0 .98-.44.98-.98v-1.04c0-.54-.44-.98-.98-.98h-1.96V10h1.96c.54 0 .98-.44.98-.98V7.98c0-.54-.44-.98-.98-.98h-2.96V5.5c0-.264-.182-.572-.682-.48C4.865 3.864 2 7.589 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10S17.523 2 12 2zm-2 17h4v2h-4v-2z"
        />
      </svg>
      <span className="text-base">AI Settings</span>
    </button>
  );
}
