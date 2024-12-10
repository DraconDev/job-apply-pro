import { useEffect, useState } from "react";
import { FormInput, SavedFormInputs } from "../../src/types";
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
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] =
        useState<keyof CategorizedInputs>("textFields");

    useEffect(() => {
        loadFormInputs();
    }, []);

    const loadFormInputs = async () => {
        try {
            setIsLoading(true);
            const result = await chrome.storage.sync.get(["savedFormInputs"]);
            console.log("Loaded form inputs:", result.savedFormInputs);
            setFormInputs(result.savedFormInputs || {});
        } catch (error) {
            console.error("Failed to load form inputs:", error);
            // Show error state
            setFormInputs({});
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
            console.error("Failed to delete form input:", error);
        }
    };

    const handleValueChange = async (key: string, value: string) => {
        const newInputs = {
            ...formInputs,
            [key]: {
                ...formInputs[key],
                value,
            },
        };
        try {
            await chrome.storage.sync.set({ savedFormInputs: newInputs });
            setFormInputs(newInputs);
        } catch (error) {
            console.error("Failed to update form input:", error);
        }
    };

    const categorizeInputs = (
        inputs: [string, FormInput][]
    ): CategorizedInputs => {
        return inputs.reduce(
            (acc: CategorizedInputs, [key, input]) => {
                // Log each input being categorized
                console.log("Categorizing input:", { key, type: input.type });

                if (
                    input.type === "textarea" ||
                    input.type.includes("textarea")
                ) {
                    acc.textareas.push([key, input]);
                } else if (
                    input.type === "select" ||
                    input.type === "select-one" ||
                    input.type.includes("select")
                ) {
                    acc.dropdowns.push([key, input]);
                } else if (input.type === "radio") {
                    acc.radioButtons.push([key, input]);
                } else if (input.type === "checkbox") {
                    acc.checkboxes.push([key, input]);
                } else if (
                    [
                        "text",
                        "email",
                        "tel",
                        "url",
                        "number",
                        "date",
                        "input",
                    ].includes(input.type)
                ) {
                    acc.textFields.push([key, input]);
                } else {
                    console.log("Uncategorized input type:", input.type);
                    acc.other.push([key, input]);
                }
                return acc;
            },
            {
                textFields: [],
                radioButtons: [],
                checkboxes: [],
                dropdowns: [],
                textareas: [],
                other: [],
            }
        );
    };

    const filteredInputs = Object.entries(formInputs)
        .filter(([key, input]) => {
            if (!searchTerm) return true;
            const searchLower = searchTerm.toLowerCase();
            return (
                key.toLowerCase().includes(searchLower) ||
                input.identifiers.some((id) =>
                    id.toLowerCase().includes(searchLower)
                ) ||
                input.value.toLowerCase().includes(searchLower)
            );
        })
        .sort((a, b) => b[1].useCount - a[1].useCount);

    const categorizedInputs = categorizeInputs(filteredInputs);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="w-8 h-8 rounded-full border-b-2 border-gray-900 animate-spin"></div>
            </div>
        );
    }

    const categories: { key: keyof CategorizedInputs; label: string }[] = [
        { key: "textFields", label: "Text Fields" },
        { key: "radioButtons", label: "Radio Buttons" },
        { key: "checkboxes", label: "Checkboxes" },
        { key: "dropdowns", label: "Dropdowns" },
        { key: "textareas", label: "Text Areas" },
        { key: "other", label: "Other" },
    ];

    return (
        <div className="p-6 min-h-screen bg-slate-50">
            <div className="mx-auto max-w-4xl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">
                        Saved Form Inputs
                    </h1>
                    <div className="w-64">
                        <input
                            type="text"
                            placeholder="Search inputs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                            ? "text-blue-600 border-b-2 border-blue-600"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    {label} ({categorizedInputs[key].length})
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {categorizedInputs[selectedCategory].length === 0 ? (
                            <div className="py-4 text-center text-gray-500">
                                {searchTerm
                                    ? "No matching inputs found"
                                    : "No form inputs saved yet"}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {categorizedInputs[selectedCategory].map(
                                    ([key, input]) => (
                                        <div
                                            key={key}
                                            className="p-4 rounded-lg border hover:bg-gray-50"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex gap-2 items-center mb-2">
                                                        <span className="font-medium text-gray-700">
                                                            {key}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            ({input.type})
                                                        </span>
                                                        <span className="px-2 py-1 text-xs bg-gray-200 rounded">
                                                            Used{" "}
                                                            {input.useCount}{" "}
                                                            times
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {input.type ===
                                                            "select" &&
                                                        input.options ? (
                                                            <select
                                                                value={
                                                                    input.value
                                                                }
                                                                onChange={(e) =>
                                                                    handleValueChange(
                                                                        key,
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                className="flex-1 px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            >
                                                                {input.options.map(
                                                                    (
                                                                        option,
                                                                        idx
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                idx
                                                                            }
                                                                            value={
                                                                                option.value
                                                                            }
                                                                        >
                                                                            {
                                                                                option.text
                                                                            }
                                                                        </option>
                                                                    )
                                                                )}
                                                            </select>
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                value={
                                                                    input.value
                                                                }
                                                                onChange={(e) =>
                                                                    handleValueChange(
                                                                        key,
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                className="flex-1 px-3 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            />
                                                        )}
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    key
                                                                )
                                                            }
                                                            className="px-3 py-2 text-red-600 rounded border border-red-600 hover:text-red-800 hover:bg-red-50"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
