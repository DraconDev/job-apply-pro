import React, { useEffect, useState } from 'react';
import "./App.css";

interface ApplicationEntry {
    company: string;
    position: string;
    date: string;
    answers: Record<string, string>;
}

export default function App() {
    const [applications, setApplications] = useState<ApplicationEntry[]>([]);

    useEffect(() => {
        // Load application history from storage
        chrome.storage.sync.get(['applicationHistory'], (result) => {
            if (result.applicationHistory) {
                setApplications(result.applicationHistory);
            }
        });
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">Application History</h1>
                
                <div className="space-y-4">
                    {applications.map((app, index) => (
                        <div key={index} className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-700">{app.company}</h2>
                                    <p className="text-slate-600">{app.position}</p>
                                </div>
                                <span className="text-sm text-slate-500">{app.date}</span>
                            </div>
                            <div className="space-y-2">
                                {Object.entries(app.answers).map(([question, answer], i) => (
                                    <div key={i} className="border-t pt-2">
                                        <p className="text-sm font-medium text-slate-700">{question}</p>
                                        <p className="text-slate-600">{answer}</p>
                                    </div>
                                ))}
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
