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

interface FormValue {
    identifier: string;
    value: string;
}

const ApplicationMenu: React.FC<ApplicationMenuProps> = ({ isOpen, onClose }) => {
    const [answers, setAnswers] = useState<ApplicationAnswer[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [savedValues, setSavedValues] = useState<FormValue[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

        const loadSavedValues = async () => {
            try {
                setIsLoading(true);
                const result = await chrome.storage.sync.get('savedFormValues');
                const formValues = result.savedFormValues || {};
                
                // Convert object to array of FormValue for easier rendering
                const formValuesArray = Object.entries(formValues).map(([identifier, value]) => ({
                    identifier,
                    value: value as string
                }));
                
                setSavedValues(formValuesArray);
            } catch (error) {
                console.error('Error loading saved form values:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen) {
            loadAnswers();
            loadSavedValues();
        }
    }, [isOpen]);

    const handleClearValues = async () => {
        try {
            await chrome.storage.sync.remove('savedFormValues');
            setSavedValues([]);
        } catch (error) {
            console.error('Error clearing saved form values:', error);
        }
    };

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

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">Saved Form Values</h3>
                        <button
                            onClick={handleClearValues}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-600 rounded hover:bg-red-50"
                        >
                            Clear All
                        </button>
                    </div>
                    
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : savedValues.length > 0 ? (
                        <div className="space-y-2">
                            {savedValues.map((item, index) => (
                                <div key={index} className="border rounded p-2 bg-gray-50">
                                    <div className="text-sm font-medium text-gray-700">{item.identifier}</div>
                                    <div className="text-sm text-gray-600 break-words">{item.value}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-500 text-center py-4">
                            No saved form values yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApplicationMenu;
