import React from 'react';

const App: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow-xl p-6">
                    <div className="mb-6 flex items-center">
                        <div className="flex-shrink-0 w-6 h-6 text-blue-600">
                            <svg
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 ml-2">Job Apply Pro Help</h1>
                    </div>
                    <p className="mt-2 text-gray-600 mb-8">
                        Welcome to the Job Apply Pro help page. Here you'll find everything you need to know about using our extension.
                    </p>

                    <div className="space-y-6">
                        {/* Getting Started */}
                        <section>
                            <div className="flex items-center mb-3">
                                <div className="flex-shrink-0 w-5 h-5 text-green-600">
                                    <svg
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
                                </div>
                                <h3 className="text-lg font-semibold ml-2">Getting Started</h3>
                            </div>
                            <div className="ml-7 space-y-2 text-gray-600">
                                <p>1. Navigate to LinkedIn jobs page</p>
                                <p>2. Click the extension icon to open the control panel</p>
                                <p>3. Click "Start Applying" to begin the automated application process</p>
                                <p>4. The extension will automatically apply to jobs that match your filters</p>
                            </div>
                        </section>

                        {/* Job Filters */}
                        <section>
                            <div className="flex items-center mb-3">
                                <div className="flex-shrink-0 w-5 h-5 text-blue-600">
                                    <svg
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold ml-2">Job Filters</h3>
                            </div>
                            <div className="ml-7 space-y-2 text-gray-600">
                                <p>• Set required words/phrases to only apply to matching job titles</p>
                                <p>• Add excluded words/phrases to skip unwanted positions</p>
                                <p>• Filters are case-insensitive and match partial words</p>
                                <p>• Leave required words empty to match any non-excluded job</p>
                            </div>
                        </section>

                        {/* Application History */}
                        <section>
                            <div className="flex items-center mb-3">
                                <div className="flex-shrink-0 w-5 h-5 text-purple-600">
                                    <svg
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold ml-2">Application History</h3>
                            </div>
                            <div className="ml-7 space-y-2 text-gray-600">
                                <p>• View all your past job applications</p>
                                <p>• Track application dates and platforms</p>
                                <p>• Click job titles to revisit the job posts</p>
                                <p>• History keeps your last 100 applications</p>
                            </div>
                        </section>

                        {/* Tips & Tricks */}
                        <section>
                            <div className="flex items-center mb-3">
                                <div className="flex-shrink-0 w-5 h-5 text-yellow-600">
                                    <svg
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold ml-2">Tips & Tricks</h3>
                            </div>
                            <div className="ml-7 space-y-2 text-gray-600">
                                <p>• Use specific keywords in filters for better targeting</p>
                                <p>• Check your application history regularly</p>
                                <p>• You can pause the automation at any time</p>
                                <p>• Keep your LinkedIn profile up to date for best results</p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
