import React, { useEffect, useState } from "react";
import { ApplicationAnswer } from "../types";

interface ApplicationMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

interface FormValue {
    identifier: string;
    value: string;
}

const ApplicationMenu: React.FC<ApplicationMenuProps> = ({
    isOpen,
    onClose,
}) => {
    const [answers, setAnswers] = useState<ApplicationAnswer[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [savedValues, setSavedValues] = useState<FormValue[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadAnswers = async () => {
            try {
                // Try to load from sync storage first
                const result = await chrome.storage.sync.get([
                    "applicationAnswers",
                ]);
                if (result.applicationAnswers) {
                    setAnswers(result.applicationAnswers);
                    setError(null);
                    return;
                }

                // If no sync data, try local storage as fallback
                const localResult = await chrome.storage.local.get([
                    "applicationAnswers",
                ]);
                if (localResult.applicationAnswers) {
                    setAnswers(localResult.applicationAnswers);
                    setError("Using local storage (sync unavailable)");
                } else {
                    setAnswers([]);
                    setError(null);
                }
            } catch (err) {
                console.error("Error loading answers:", err);
                setError("Failed to load answers");
                setAnswers([]);
            }
        };

        const loadSavedValues = async () => {
            try {
                setIsLoading(true);
                const result = await chrome.storage.sync.get("savedFormValues");
                const formValues = result.savedFormValues || {};

                const formValuesArray = Object.entries(formValues).map(
                    ([identifier, value]) => ({
                        identifier,
                        value: value as string,
                    })
                );

                setSavedValues(formValuesArray);
            } catch (error) {
                console.error("Error loading saved form values:", error);
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
            await chrome.storage.sync.remove("savedFormValues");
            setSavedValues([]);
        } catch (error) {
            console.error("Error clearing saved form values:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2147483647]">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96 flex flex-col space-y-4">
                <h2 className="text-xl font-bold mb-4">History</h2>
                <div className="flex flex-col space-y-2">
                    <button
                        onClick={() => {
                            window.open(
                                chrome.runtime.getURL("form-info/index.html"),
                                "_blank"
                            );
                            onClose();
                        }}
                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                    >
                        View Form Info
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full flex items-center justify-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApplicationMenu;
