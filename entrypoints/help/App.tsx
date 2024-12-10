import React from 'react';

const App: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-8">
                <h1 className="text-3xl font-bold mb-6">Job Apply Pro - How It Works</h1>

                <div className="space-y-6 text-gray-700">
                    <section>
                        <h2 className="text-2xl font-semibold mb-3">Overview</h2>
                        <p>
                            Job Apply Pro is a Chrome extension that automates your LinkedIn job application process. 
                            It helps you apply to multiple jobs efficiently while maintaining control over your applications.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">Getting Started</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>Go to LinkedIn and search for jobs that interest you</li>
                            <li>The extension will appear as a floating button on the right side of your screen</li>
                            <li>Click "Start" to begin the automated application process</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">How Auto-Apply Works</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>When you click "Start", the extension begins processing the current job listing</li>
                            <li>It automatically fills in form fields using your previously saved responses</li>
                            <li>For new questions, it will pause and wait for your input</li>
                            <li>Your responses are saved for future applications</li>
                            <li>After completing one application, it moves to the next job in the list</li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">Controls</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Start/Resume:</strong> Begin auto-applying or continue from where you left off</li>
                            <li><strong>Pause:</strong> Temporarily stop the auto-apply process</li>
                            <li><strong>Stop:</strong> Completely stop the process and reset to the beginning</li>
                            <li><strong>Skip:</strong> Move to the next job without completing the current application</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">Form Inputs</h2>
                        <p className="mb-2">
                            The extension saves your form inputs as you apply to jobs. You can view and edit these saved responses in the extension popup:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Text fields are saved with their labels and values</li>
                            <li>Dropdown selections are saved with all available options</li>
                            <li>You can edit or delete any saved response</li>
                            <li>Changes take effect immediately for future applications</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">Important Notes</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>The extension will pause when it encounters required fields that haven't been filled before</li>
                            <li>You can resume the process after filling in the required information</li>
                            <li>Your data is saved locally in your browser</li>
                            <li>You can stop the process at any time by clicking the Stop button</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default App;
