import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

function LinkedInJobSearchPanel() {
    const [isSearching, setIsSearching] = useState(false);
    const [searchSettings, setSearchSettings] = useState({
        jobTitle: '',
        location: '',
        experienceLevel: 'any',
        datePosted: 'any',
        jobType: 'any'
    });

    const handleStartSearch = () => {
        setIsSearching(true);
        // TODO: Implement auto search logic
    };

    return (
        <div className="fixed top-20 right-8 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50 transition-all duration-200 ease-in-out">
            <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800">Job Search Assistant</h3>
                    <button 
                        className="text-slate-400 hover:text-slate-500 transition-colors"
                        onClick={() => {
                            const panel = document.getElementById('job-search-panel');
                            if (panel) {
                                panel.style.opacity = '0';
                                panel.style.transform = 'translateX(20px)';
                                setTimeout(() => panel.remove(), 200);
                            }
                        }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
            
            <div className="p-4 space-y-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Job Title</label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., Software Engineer"
                        value={searchSettings.jobTitle}
                        onChange={(e) => setSearchSettings(prev => ({ ...prev, jobTitle: e.target.value }))}
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Location</label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., San Francisco"
                        value={searchSettings.location}
                        onChange={(e) => setSearchSettings(prev => ({ ...prev, location: e.target.value }))}
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Experience Level</label>
                    <select
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        value={searchSettings.experienceLevel}
                        onChange={(e) => setSearchSettings(prev => ({ ...prev, experienceLevel: e.target.value }))}
                    >
                        <option value="any">Any</option>
                        <option value="internship">Internship</option>
                        <option value="entry">Entry Level</option>
                        <option value="associate">Associate</option>
                        <option value="mid-senior">Mid-Senior Level</option>
                        <option value="director">Director</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Date Posted</label>
                    <select
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        value={searchSettings.datePosted}
                        onChange={(e) => setSearchSettings(prev => ({ ...prev, datePosted: e.target.value }))}
                    >
                        <option value="any">Any Time</option>
                        <option value="month">Past Month</option>
                        <option value="week">Past Week</option>
                        <option value="24h">Past 24 hours</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Job Type</label>
                    <select
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        value={searchSettings.jobType}
                        onChange={(e) => setSearchSettings(prev => ({ ...prev, jobType: e.target.value }))}
                    >
                        <option value="any">Any</option>
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="temporary">Temporary</option>
                        <option value="internship">Internship</option>
                    </select>
                </div>

                <button
                    onClick={handleStartSearch}
                    disabled={isSearching}
                    className={`w-full px-4 py-2 rounded-md shadow-sm font-medium transition-all duration-150 ease-in-out flex items-center justify-center gap-2 ${
                        isSearching
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                >
                    {isSearching ? (
                        <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Searching...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Start Search
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

// Function to inject the panel into the LinkedIn page
export function injectJobSearchPanel() {
    const existingPanel = document.getElementById('job-search-panel');
    if (existingPanel) {
        existingPanel.style.opacity = '0';
        existingPanel.style.transform = 'translateX(20px)';
        setTimeout(() => existingPanel.remove(), 200);
        return;
    }

    const panel = document.createElement('div');
    panel.id = 'job-search-panel';
    panel.style.opacity = '0';
    panel.style.transform = 'translateX(20px)';
    document.body.appendChild(panel);

    const root = createRoot(panel);
    root.render(<LinkedInJobSearchPanel />);

    // Trigger entrance animation
    requestAnimationFrame(() => {
        panel.style.opacity = '1';
        panel.style.transform = 'translateX(0)';
    });
}
