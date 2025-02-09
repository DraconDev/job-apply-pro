export interface JobInfo {
    title: string;
    link: string;
}

export interface SavedFormInputs {
    [key: string]: {
        value: string;
        type: string;
        identifiers: string[];
        lastUsed: number;
        useCount: number;
        options?: { value: string; text: string }[];
    };
}

export interface JobHistoryEntry {
    title: string;
    link: string;
    appliedAt: number;
    platform: string;
}

export enum ApplicationState {
    IDLE = "IDLE",
    RUNNING = "RUNNING",
    PAUSED = "PAUSED",
}
