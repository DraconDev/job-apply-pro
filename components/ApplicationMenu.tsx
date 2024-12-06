import React, { useState, useEffect } from 'react';

export interface ApplicationAnswer {
    question: string;
    answer: string;
    timestamp: string;
}

interface ApplicationMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const ApplicationMenu: React.FC<ApplicationMenuProps> = ({ isOpen, onClose }) => {
    const [answers, setAnswers] = useState<ApplicationAnswer[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadAnswers = async () => {
            try {
                // Try to load from sync storage first
                const result = await chrome.storage.sync.get(['applicationAnswers']);
                if (result.applicationAnswers) {
                    setAnswers(result.applicationAnswers);
                    setError(null);
                    return;
                }

                // If no sync data, try local storage as fallback
                const localResult = await chrome.storage.local.get(['applicationAnswers']);
                if (localResult.applicationAnswers) {
                    setAnswers(localResult.applicationAnswers);
                    setError('Using local storage (sync unavailable)');
                } else {
                    setAnswers([]);
                    setError(null);
                }
            } catch (err) {
                console.error('Error loading answers:', err);
                setError('Failed to load answers');
                setAnswers([]);
            }
        };

        if (isOpen) {
            loadAnswers();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2147483647]">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Application History</h2>
                        {error && <p className="text-sm text-amber-600 mt-1">{error}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {answers.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No application answers recorded yet.</p>
                ) : (
                    <div className="space-y-4">
                        {answers.map((answer, index) => (
                            <div key={index} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{answer.question}</h3>
                                        <p className="text-gray-700 mt-1">{answer.answer}</p>
                                    </div>
                                    <span className="text-sm text-gray-500">{new Date(answer.timestamp).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicationMenu;
