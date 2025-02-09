import { ApplicationState } from "../types";

let currentState: ApplicationState = ApplicationState.IDLE;

/**
 * Get the current application state
 */
export function getApplicationState(): ApplicationState {
    return currentState;
}

/**
 * Set the application state
 */
export function setApplicationState(state: ApplicationState): void {
    console.log(`Setting application state from ${currentState} to ${state}`);
    currentState = state;
}

/**
 * Check if the application is currently stopped
 */
export function isApplicationStopped(): boolean {
    const stopped = currentState === ApplicationState.IDLE;
    if (stopped) {
        console.log("Auto-apply is stopped");
    }
    return stopped;
}

/**
 * Wait until application is unpaused
 */
export async function waitForUnpause(): Promise<void> {
    let waitCounter = 0;
    console.log("Entering waitForUnpause loop, current state:", currentState);

    while (currentState === ApplicationState.PAUSED) {
        waitCounter++;
        if (waitCounter % 5 === 0) {
            console.log(`Still paused... waited ${waitCounter} seconds`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log("Exited pause state after", waitCounter, "seconds");
}

/**
 * Check if application is paused and wait if it is
 */
export async function checkIfPaused(): Promise<void> {
    if (currentState === ApplicationState.PAUSED) {
        console.log("Auto-apply is paused, waiting to resume...");
        await waitForUnpause();
        console.log("Resumed from pause, continuing autoApply");
    }
}

/**
 * Stop the auto-apply process
 */
export async function stop(cancelApplication: () => Promise<void>): Promise<void> {
    console.log("Stopping auto-apply process...");

    try {
        // Clear all state
        setApplicationState(ApplicationState.IDLE);
        await cancelApplication();
        console.log("Auto-apply process stopped successfully");
    } catch (error) {
        console.error("Error while stopping auto-apply:", error);
        // Still reset state even if there's an error
        setApplicationState(ApplicationState.IDLE);
    }
}

/**
 * Pause the auto-apply process
 */
export function pause(): void {
    console.log("Pausing auto-apply process...", {
        currentState: currentState,
    });
    setApplicationState(ApplicationState.PAUSED);
    console.log("State after pause:", currentState);
}

/**
 * Unpause the auto-apply process
 */
export function unpause(): void {
    console.log("Resuming auto-apply process...", {
        currentState: currentState,
    });
    setApplicationState(ApplicationState.RUNNING);
    console.log("State after unpause:", currentState);
}
