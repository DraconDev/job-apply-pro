import React from 'react';

const App: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-xl p-8 text-white">
                    <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-lg p-2.5">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h1 className="text-3xl font-bold">Job Apply Pro</h1>
                            <p className="text-white/80">Your automated job application assistant</p>
                        </div>
                    </div>
                    <p className="text-lg text-white/90">
                        Streamline your job search with automated applications, smart filtering, and comprehensive tracking.
                    </p>
                </div>

                {/* Quick Start Guide */}
                <div className="bg-white rounded-xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Start Guide</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg p-1.5 text-blue-600">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="font-semibold text-gray-900">1. Search for Jobs</h3>
                                    <p className="text-gray-600">Go to LinkedIn and search for jobs that interest you</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg p-1.5 text-green-600">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="font-semibold text-gray-900">2. Configure Filters</h3>
                                    <p className="text-gray-600">Set up your job title filters to target specific roles</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg p-1.5 text-purple-600">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="font-semibold text-gray-900">3. Start Applying</h3>
                                    <p className="text-gray-600">Click "Start Applying" and let the automation work</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-lg p-1.5 text-yellow-600">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="font-semibold text-gray-900">4. Monitor Progress</h3>
                                    <p className="text-gray-600">Watch the extension apply to jobs automatically</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg p-1.5 text-red-600">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="font-semibold text-gray-900">5. Review History</h3>
                                    <p className="text-gray-600">Check your application history to track progress</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="bg-white rounded-xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Smart Filtering</h3>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Case-insensitive matching
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Required and excluded words
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Partial word matching
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Application History</h3>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Track all applications
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    View application dates
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Revisit job posts
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Tips */}
                <div className="bg-white rounded-xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Pro Tips</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Best Practices</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li>• Keep your LinkedIn profile updated</li>
                                <li>• Use specific keywords in filters</li>
                                <li>• Review applications periodically</li>
                                <li>• Pause automation when needed</li>
                            </ul>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Troubleshooting</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li>• Refresh page if automation stops</li>
                                <li>• Check filters if no jobs match</li>
                                <li>• Clear history if it gets too long</li>
                                <li>• Update extension if issues persist</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Support */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-xl p-8 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Need More Help?</h2>
                            <p className="text-white/90">Support the development and get premium features</p>
                        </div>
                        <a
                            href="https://ko-fi.com/adamdracon"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-md"
                        >
                            Support ❤️
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
