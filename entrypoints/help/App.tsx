import React from 'react';

const App: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow-xl p-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Job Apply Pro Help</h1>
                        <p className="mt-2 text-gray-600">
                            Welcome to the Job Apply Pro help page. Here you'll find everything you need to know about using our extension.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <section>
                            <h3 className="text-xl font-semibold mb-3">Getting Started</h3>
                            <p className="text-gray-700 mb-2">
                                This extension automates the job application process on LinkedIn. Here's how to use it:
                            </p>
                            <ol className="list-decimal list-inside space-y-2 text-gray-700">
                                <li>Navigate to LinkedIn jobs you're interested in</li>
                                <li>Click the "Apply" button on the extension</li>
                                <li>The extension will automatically fill out the application forms</li>
                                <li>Review the information before final submission</li>
                            </ol>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3">Features</h3>
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                                <li>Automatic form filling</li>
                                <li>Saves your previous form responses</li>
                                <li>Tracks number of jobs applied to</li>
                                <li>Pause/Resume functionality</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3">Tips & Tricks</h3>
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                                <li>Review saved form values in the settings menu</li>
                                <li>Use the pause button if you need to manually edit any information</li>
                                <li>Clear saved values if you want to start fresh</li>
                                <li>Keep an eye on the application counter to track your progress</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3">Troubleshooting</h3>
                            <div className="space-y-3 text-gray-700">
                                <p><strong>Application not proceeding:</strong> Try pausing and resuming the process</p>
                                <p><strong>Form not filling correctly:</strong> Clear saved values and try again</p>
                                <p><strong>Extension not responding:</strong> Refresh the page and restart the extension</p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold mb-3">Contact & Support</h3>
                            <p className="text-gray-700">
                                For additional support or to report issues, please visit our GitHub repository or contact the development team.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
