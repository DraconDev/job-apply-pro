import React, { useEffect, useState } from 'react';
import "./App.css";

interface JobHistoryEntry {
    title: string;
    link: string;
    appliedAt: number;
    platform: string;
}

export default function App() {
    const [applications, setApplications] = useState<JobHistoryEntry[]>([]);

    useEffect(() => {
        // Load application history from storage
        chrome.storage.sync.get(['jobHistory'], (result) => {
            if (result.jobHistory) {
                setApplications(result.jobHistory);
            }
        });
    }, []);

    const addTestEntry = async () => {
        const testEntry: JobHistoryEntry = {
            title: "Senior Software Engineer at Test Company",
            link: "https://linkedin.com/jobs/test-job",
            appliedAt: Date.now(),
            platform: "LinkedIn"
        };

        // Add to beginning of array like in LinkedInHandler
        const newApplications = [testEntry, ...applications];
        setApplications(newApplications);
        
        // Save to storage
        await chrome.storage.sync.set({
            jobHistory: newApplications
        });
    };

    const deleteEntry = async (index: number) => {
        const newApplications = [...applications];
        newApplications.splice(index, 1);
        setApplications(newApplications);
        
        // Save to storage
        await chrome.storage.sync.set({
            jobHistory: newApplications
        });
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Application History</h1>
                    <button
                        onClick={addTestEntry}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Add Test Entry
                    </button>
                </div>
                <div className="space-y-4">
                    {applications.map((app, index) => (
                        <div key={index} className="bg-white rounded-lg shadow p-4">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <a 
                                        href={app.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                                    >
                                        {app.title}
                                    </a>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="text-sm text-slate-500">
                                        <div>{formatDate(app.appliedAt)}</div>
                                        <div className="text-right">{app.platform}</div>
                                    </div>
                                    <button
                                        onClick={() => deleteEntry(index)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                        title="Delete entry"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {applications.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                            No applications recorded yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
