export interface FormInput {
    value: string;        // The value we used
    type: string;        // Input type (text, email, number, etc.)
    identifiers: string[]; // Array of identifiers (name, id, aria-label) that matched this input
    lastUsed: number;    // Timestamp of last use
    useCount: number;    // How many times we've used this
}

export interface SavedFormInputs {
    [key: string]: FormInput;
}
