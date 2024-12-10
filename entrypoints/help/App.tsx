import React from 'react';

const App: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow-xl p-6">
                    <div className="mb-6 flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 text-blue-600">
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
                        <h1 className="text-3xl font-bold text-gray-900 ml-3">Job Apply Pro Help</h1>
                    </div>
                    <p className="mt-2 text-gray-600 mb-8">
                        Welcome to the Job Apply Pro help page. Here you'll find everything you need to know about using our extension.
                    </p>

                    <div className="space-y-8">
                        <section>
                            <div className="flex items-center mb-3">
                                <div className="flex-shrink-0 w-6 h-6 text-green-600">
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
                                <h3 className="text-xl font-semibold ml-2">Getting Started</h3>
                            </div>
                            <p className="text-gray-700 mb-2">
                                This extension automates the job application process on LinkedIn. Here's how to use it:
                            </p>
                            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-2">
                                <li>Navigate to LinkedIn jobs you're interested in</li>
                                <li>Click the "Apply" button on the extension</li>
                                <li>The extension will automatically fill out the application forms</li>
                                <li>Review the information before final submission</li>
                            </ol>
                        </section>

                        <section>
                            <div className="flex items-center mb-3">
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
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold ml-2">Features</h3>
                            </div>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                                <li>Automatic form filling</li>
                                <li>Saves your previous form responses</li>
                                <li>Tracks number of jobs applied to</li>
                                <li>Pause/Resume functionality</li>
                            </ul>
                        </section>

                        <section>
                            <div className="flex items-center mb-3">
                                <div className="flex-shrink-0 w-6 h-6 text-yellow-600">
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
                                <h3 className="text-xl font-semibold ml-2">Tips & Tricks</h3>
                            </div>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                                <li>Review saved form values in the settings menu</li>
                                <li>Use the pause button if you need to manually edit any information</li>
                                <li>Clear saved values if you want to start fresh</li>
                                <li>Keep an eye on the application counter to track your progress</li>
                            </ul>
                        </section>

                        <section>
                            <div className="flex items-center mb-3">
                                <div className="flex-shrink-0 w-6 h-6 text-red-600">
                                    <svg
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold ml-2">Troubleshooting</h3>
                            </div>
                            <div className="space-y-3 text-gray-700 ml-2">
                                <p><strong>Application not proceeding:</strong> Try pausing and resuming the process</p>
                                <p><strong>Form not filling correctly:</strong> Clear saved values and try again</p>
                                <p><strong>Extension not responding:</strong> Refresh the page and restart the extension</p>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center mb-3">
                                <div className="flex-shrink-0 w-6 h-6 text-purple-600">
                                    <svg
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold ml-2">Contact & Support</h3>
                            </div>
                            <div className="text-gray-700 ml-2">
                                <p>For additional support or to report issues, please visit our GitHub repository or contact the development team.</p>
                                <div className="mt-4">
                                    <a
                                        href="https://ko-fi.com/adamdracon"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                                    >
                                        <div className="flex-shrink-0 w-5 h-5">
                                            <svg
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                />
                                            </svg>
                                        </div>
                                        <span className="ml-2">Support on Ko-fi</span>
                                    </a>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
