import { useEffect, useState } from "react";
interface JobHistoryEntry {
    title: string;
    link: string;
    appliedAt: number;
    platform: string;
}

export default function App() {
    const [history, setHistory] = useState<JobHistoryEntry[]>([]);

    useEffect(() => {
        const loadHistory = async () => {
            console.log("Starting to load job history");
            try {
                const result = await chrome.storage.sync.get({
                    jobHistory: [],
                });
                console.log("Loaded history from storage:", result);
                setHistory(result.jobHistory);
            } catch (error) {
                console.error("Error loading job history:", error);
            }
        };

        loadHistory();

        // Listen for changes
        chrome.storage.onChanged.addListener((changes) => {
            if (changes.jobHistory) {
                setHistory(changes.jobHistory.newValue);
            }
        });
    }, []);

    console.log("Current history state:", history);

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-[800px] mx-auto pt-8 px-4">
                <div className="overflow-hidden bg-white rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b">
                        <h1 className="text-xl font-bold text-center text-gray-800 md:text-2xl">
                            Application History
                        </h1>
                        <p className="mt-2 text-sm text-center text-gray-600">
                            Record of your recent job applications
                        </p>
                    </div>

                    <div className="p-6">
                        {history.length === 0 ? (
                            <p className="text-center text-gray-500">
                                No applications in history yet
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {history.map((entry, index) => (
                                    <div
                                        key={index}
                                        className="p-4 rounded-lg border hover:bg-gray-50"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <a
                                                    href={entry.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-lg font-medium text-blue-600 hover:text-blue-800"
                                                >
                                                    {entry.title}
                                                </a>
                                                <div className="mt-1 text-sm text-gray-500">
                                                    Applied via {entry.platform}
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {formatDate(entry.appliedAt)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
