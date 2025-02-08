import React from "react";
import { browser } from "wxt/browser";

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
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
      <span className="text-base">AI Settings</span>
    </button>
  );
}
