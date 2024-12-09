import React, { useEffect, useState } from 'react';
import { FormInput, SavedFormInputs } from '../../src/types';
import "./App.css";

interface CategorizedInputs {
    textFields: [string, FormInput][];
    radioButtons: [string, FormInput][];
    checkboxes: [string, FormInput][];
    dropdowns: [string, FormInput][];
    textareas: [string, FormInput][];
    other: [string, FormInput][];
}

export default function App() {
    const [formInputs, setFormInputs] = useState<SavedFormInputs>({});
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<keyof CategorizedInputs>('textFields');

    useEffect(() => {
        loadFormInputs();
    }, []);

    const loadFormInputs = async () => {
        try {
            const result = await chrome.storage.sync.get(['savedFormInputs']);
            setFormInputs(result.savedFormInputs || {});
        } catch (error) {
            console.error('Failed to load form inputs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (key: string) => {
        const newInputs = { ...formInputs };
        delete newInputs[key];
        try {
            await chrome.storage.sync.set({ savedFormInputs: newInputs });
            setFormInputs(newInputs);
        } catch (error) {
            console.error('Failed to delete form input:', error);
        }
    };

    const handleValueChange = async (key: string, value: string) => {
        const newInputs = {
            ...formInputs,
            [key]: {
                ...formInputs[key],
                value
            }
        };
        try {
            await chrome.storage.sync.set({ savedFormInputs: newInputs });
            setFormInputs(newInputs);
        } catch (error) {
            console.error('Failed to update form input:', error);
        }
    };

    const categorizeInputs = (inputs: [string, FormInput][]): CategorizedInputs => {
        return inputs.reduce((acc: CategorizedInputs, [key, input]) => {
            if (input.type === 'textarea') {
                acc.textareas.push([key, input]);
            } else if (input.type === 'select' || input.type === 'select-one') {
                acc.dropdowns.push([key, input]);
            } else if (input.type === 'radio') {
                acc.radioButtons.push([key, input]);
            } else if (input.type === 'checkbox') {
                acc.checkboxes.push([key, input]);
            } else if (['text', 'email', 'tel', 'url', 'number', 'date'].includes(input.type)) {
                acc.textFields.push([key, input]);
            } else {
                acc.other.push([key, input]);
            }
            return acc;
        }, {
            textFields: [],
            radioButtons: [],
            checkboxes: [],
            dropdowns: [],
            textareas: [],
            other: []
        });
    };

    const filteredInputs = Object.entries(formInputs).filter(([key, input]) => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return key.toLowerCase().includes(searchLower) ||
               input.identifiers.some(id => id.toLowerCase().includes(searchLower)) ||
               input.value.toLowerCase().includes(searchLower);
    }).sort((a, b) => b[1].useCount - a[1].useCount);

    const categorizedInputs = categorizeInputs(filteredInputs);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>;
    }

    const categories: { key: keyof CategorizedInputs; label: string }[] = [
        { key: 'textFields', label: 'Text Fields' },
        { key: 'radioButtons', label: 'Radio Buttons' },
        { key: 'checkboxes', label: 'Checkboxes' },
        { key: 'dropdowns', label: 'Dropdowns' },
        { key: 'textareas', label: 'Text Areas' },
        { key: 'other', label: 'Other' }
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Saved Form Inputs</h1>
                    <div className="w-64">
                        <input
                            type="text"
                            placeholder="Search inputs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow">
                    <div className="border-b">
                        <nav className="flex">
                            {categories.map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedCategory(key)}
                                    className={`px-4 py-2 font-medium ${
                                        selectedCategory === key
                                            ? 'text-blue-600 border-b-2 border-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {label} ({categorizedInputs[key].length})
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {categorizedInputs[selectedCategory].length === 0 ? (
                            <div className="text-gray-500 text-center py-4">
                                {searchTerm ? 'No matching inputs found' : 'No form inputs saved yet'}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {categorizedInputs[selectedCategory].map(([key, input]) => (
                                    <div key={key} className="border rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-medium text-gray-700">
                                                        {key}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        ({input.type})
                                                    </span>
                                                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                                        Used {input.useCount} times
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-500 mb-2">
                                                    Identifiers: {input.identifiers.join(', ')}
                                                </div>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={input.value}
                                                        onChange={(e) => handleValueChange(key, e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                    <button
                                                        onClick={() => handleDelete(key)}
                                                        className="px-3 py-2 text-red-600 hover:text-red-800 border border-red-600 rounded hover:bg-red-50"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
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
