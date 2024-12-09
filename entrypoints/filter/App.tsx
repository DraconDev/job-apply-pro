import { useEffect, useState } from "react";
import "./App.css";

interface FilterSettings {
    titles: string[];
    excludeTitles: string[];
}

const defaultSettings: FilterSettings = {
    titles: [
        "software engineer",
        "frontend engineer",
        "backend engineer",
        "full stack engineer",
    ],
    excludeTitles: [
        "senior",
        "staff",
        "principal",
        "lead",
        "manager",
        "director",
    ],
};

export default function App() {
    const [settings, setSettings] = useState<FilterSettings>(defaultSettings);
    const [newTitle, setNewTitle] = useState("");
    const [newExcludeTitle, setNewExcludeTitle] = useState("");
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Load saved settings
        chrome.storage.sync.get(["titleFilterSettings"], (result) => {
            if (result.titleFilterSettings) {
                setSettings(result.titleFilterSettings);
            }
        });
    }, []);

    const handleSave = () => {
        chrome.storage.sync.set({ titleFilterSettings: settings }, () => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        });
    };

    const addTitle = (type: "include" | "exclude") => {
        const title = type === "include" ? newTitle : newExcludeTitle;
        if (!title.trim()) return;

        setSettings((prev) => ({
            ...prev,
            [type === "include" ? "titles" : "excludeTitles"]: [
                ...prev[type === "include" ? "titles" : "excludeTitles"],
                title.trim().toLowerCase(),
            ],
        }));
        if (type === "include") {
            setNewTitle("");
        } else {
            setNewExcludeTitle("");
        }
    };

    const removeTitle = (title: string, type: "include" | "exclude") => {
        setSettings((prev) => ({
            ...prev,
            [type === "include" ? "titles" : "excludeTitles"]: prev[
                type === "include" ? "titles" : "excludeTitles"
            ].filter((t) => t !== title),
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-[600px] mx-auto pt-8">
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="py-4 mb-4 bg-white border-b">
                        <h1 className="text-xl font-bold text-center text-gray-800 md:text-2xl">
                            Job Title Filters
                        </h1>
                    </div>

                    <div className="px-6 pb-6 space-y-6">
                        {/* Include Titles */}
                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Include Job Titles
                            </h2>
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newTitle}
                                        onChange={(e) =>
                                            setNewTitle(e.target.value)
                                        }
                                        className="flex-1 px-3 py-2 rounded-md border border-gray-300"
                                        placeholder="Enter job title to include"
                                    />
                                    <button
                                        onClick={() => addTitle("include")}
                                        className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {settings.titles.map((title) => (
                                        <span
                                            key={title}
                                            className="flex gap-1 items-center px-2 py-1 text-blue-800 bg-blue-100 rounded-md"
                                        >
                                            {title}
                                            <button
                                                onClick={() =>
                                                    removeTitle(title, "include")
                                                }
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Exclude Titles */}
                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Exclude Job Titles
                            </h2>
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newExcludeTitle}
                                        onChange={(e) =>
                                            setNewExcludeTitle(e.target.value)
                                        }
                                        className="flex-1 px-3 py-2 rounded-md border border-gray-300"
                                        placeholder="Enter job title to exclude"
                                    />
                                    <button
                                        onClick={() => addTitle("exclude")}
                                        className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {settings.excludeTitles.map((title) => (
                                        <span
                                            key={title}
                                            className="flex gap-1 items-center px-2 py-1 text-red-800 bg-red-100 rounded-md"
                                        >
                                            {title}
                                            <button
                                                onClick={() =>
                                                    removeTitle(title, "exclude")
                                                }
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4">
                            <button
                                onClick={() => setSettings(defaultSettings)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                Reset to Default
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
                            >
                                Save Changes
                            </button>
                        </div>

                        {saved && (
                            <div className="text-sm text-center text-green-600">
                                Settings saved successfully!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
