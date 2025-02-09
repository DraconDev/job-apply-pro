import { JobInfo } from "../types";
import { cancelApplication } from "../navigation/modals";
import { loadJobListings, goToNextJobsPage, sleep } from "../navigation/scrolling";
import { checkIfPaused, getApplicationState, isApplicationStopped, setApplicationState } from "../state/applicationState";
import { ApplicationState } from "../types";
import { getJobInfo, isJobAlreadyApplied, isJobTitleAllowed, saveToHistory } from "../state/jobHistory";
import { fillFormInput, saveFormInput } from "../forms/handlers";

let currentJobIndex = 0;
let jobListings: HTMLElement[] = [];
let currentStepIndex = 0;
const MAX_STEPS = 10;

/**
 * Process a single step of the application
 */
async function processApplicationStep(stepCount: number): Promise<boolean> {
    if (isApplicationStopped()) {
        return false;
    }

    console.log(`Processing step ${stepCount}/${MAX_STEPS}...`);
    await saveFormInput();

    // Check for any alerts before proceeding
    if (document.querySelectorAll('[role="alert"]').length > 0) {
        console.log("Found alerts, attempting to continue");
        await sleep(500);

        if (isApplicationStopped()) {
            return false;
        }

        console.log("Attempting to fill fields from sync store");
        await fillFormInput();

        if (isApplicationStopped()) {
            return false;
        }

        console.log("Saving current field values");
        await saveFormInput();

        if (isApplicationStopped()) {
            return false;
        }

        // Check if alerts are still present
        if (document.querySelectorAll('[role="alert"]').length > 0) {
            console.log("Alerts still present after fill attempt, skipping application");
            await cancelApplication();
            return false;
        }
        console.log("Alerts resolved, continuing with application");
    }

    await sleep(1000);

    const submitButton = await new Promise<Element | null>(resolve => {
        setTimeout(() => {
            const btn = document.querySelector(`button[type="submit"], button[aria-label*="submit" i]`);
            resolve(btn);
        }, 5000);
    });

    if (submitButton) {
        if (isApplicationStopped()) {
            return false;
        }
        console.log("Found submit button, clicking it...");
        await handleSubmitButton(submitButton as HTMLElement);
        return true;
    }

    if (isApplicationStopped()) {
        return false;
    }

    console.log("Attempting to proceed without filling fields...");
    const nextButton = findNextButton();

    if (isApplicationStopped()) {
        return false;
    }

    if (nextButton) {
        console.log("Found next button, clicking it...");
        await saveFormInput();
        nextButton.click();
        await sleep(2000);
        return false;
    }

    // Check for any validation errors or required fields
    if (hasValidationErrors()) {
        if (!isApplicationStopped()) {
            await fillCurrentStep();
        }
    }

    return false;
}

/**
 * Handle clicking a submit button
 */
async function handleSubmitButton(button: HTMLElement): Promise<boolean> {
    if (isApplicationStopped()) {
        return false;
    }

    console.log("Handling submit button click...");
    await saveFormInput();
    button.click();
    await sleep(2000);

    if (isApplicationStopped()) {
        return false;
    }

    if (hasValidationErrors()) {
        console.log("Found errors after submit click");
        if (!isApplicationStopped()) {
            await fillCurrentStep();
        }
    }

    if (isApplicationStopped()) {
        return false;
    }

    await sleep(1000);

    if (isApplicationStopped()) {
        return false;
    }

    try {
        const result = await chrome.storage.sync.get(["jobsApplied"]);
        const currentCount = result.jobsApplied || 0;
        const newCount = currentCount + 1;
        await chrome.storage.sync.set({ jobsApplied: newCount });
        console.log(`Incremented jobs applied counter to ${newCount}`);
    } catch (error) {
        console.error("Failed to update application data:", error);
    }

    if (isApplicationStopped()) {
        return false;
    }

    await sleep(5000);
    const doneButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("button"));
    const doneButton = doneButtons.find(button => 
        button.textContent?.toLowerCase().includes("done") ||
        button.textContent?.toLowerCase().includes("finish")
    );

    if (doneButton) {
        console.log("Found done button, clicking it");
        if (!isApplicationStopped()) {
            doneButton.click();
        }
    } else {
        console.log("No done button found");
    }

    if (isApplicationStopped()) {
        return false;
    }

    await sleep(5000);
    currentStepIndex = 0;

    // Start next job application
    console.log("Starting next job application...");
    if (!isApplicationStopped() && window.location.href.includes("/jobs/")) {
        await autoApply();
    }

    return true;
}

function findNextButton(): HTMLElement | null {
    const nextButtons = Array.from(document.querySelectorAll("button"));
    const nextButton = nextButtons.find(button => {
        const text = button.textContent?.toLowerCase() || "";
        return text.includes("next") || text.includes("continue") || text.includes("review");
    });
    return nextButton as HTMLElement || null;
}

function hasValidationErrors(): boolean {
    const inlineErrors = document.querySelectorAll(".artdeco-inline-feedback--error");
    const alerts = document.querySelectorAll('[role="alert"], .alert, .error-message');
    const requiredFields = document.querySelectorAll('[required], [aria-required="true"]');
    
    const emptyRequiredFields = Array.from(requiredFields).filter(field => {
        if (field instanceof HTMLInputElement ||
            field instanceof HTMLTextAreaElement ||
            field instanceof HTMLSelectElement) {
            return !field.value;
        }
        return false;
    });

    const hasErrors = inlineErrors.length > 0 || alerts.length > 0 || emptyRequiredFields.length > 0;
    
    if (hasErrors) {
        console.log("Found form validation issues:", {
            inlineErrors: Array.from(inlineErrors).map(el => el.textContent),
            alerts: Array.from(alerts).map(el => el.textContent),
            emptyRequiredFields: emptyRequiredFields.length
        });
    }

    return hasErrors;
}

async function fillCurrentStep(): Promise<void> {
    console.log("Starting to fill current step");
    await fillFormInput();
}

/**
 * Select the next job in the listings
 */
async function selectNextJob(): Promise<boolean> {
    if (currentJobIndex >= jobListings.length) {
        console.log(`Current index ${currentJobIndex} exceeds list size ${jobListings.length}, loading next page...`);
        jobListings = []; // Clear list before loading next page
        const nextPageSuccess = await goToNextJobsPage();
        if (!nextPageSuccess) {
            console.log("No more pages of jobs available");
            return false;
        }
        currentJobIndex = 0;
        const loaded = await loadJobListings();
        if (!loaded || jobListings.length === 0) {
            console.log("Failed to load jobs from next page");
            return false;
        }
        console.log(`Successfully loaded ${jobListings.length} jobs from next page`);
    }

    const jobItem = jobListings[currentJobIndex];
    console.log(`Processing job ${currentJobIndex + 1} of ${jobListings.length}`);

    try {
        const titleElement = Array.from(jobItem.getElementsByTagName("a"))
            .find((a) => a.getAttribute("href")?.includes("/jobs/view/"));

        jobItem.scrollIntoView({ behavior: "smooth", block: "center" });
        await sleep(1000);

        if (titleElement) {
            titleElement.click();
            await sleep(2500);
            currentJobIndex++;
            return true;
        } else {
            console.log("No job title link found - skipping job");
            currentJobIndex++;
            return false;
        }
    } catch (error) {
        console.error("Error selecting job:", error);
        currentJobIndex++;
        return false;
    }
}

/**
 * Main auto-apply process
 */
export async function autoApply(): Promise<boolean> {
    setApplicationState(ApplicationState.RUNNING);
    console.log("Starting autoApply, current state:", getApplicationState());

    await checkIfPaused();
    if (isApplicationStopped()) return false;

    if (window.location.href.includes("/jobs/") && jobListings.length === 0) {
        console.log("On jobs page, loading listings...");
        await checkIfPaused();
        if (isApplicationStopped()) return false;

        jobListings = await loadJobListings();
        if (jobListings.length === 0) {
            console.log("Failed to load job listings");
            setApplicationState(ApplicationState.IDLE);
            return false;
        }

        await checkIfPaused();
        if (isApplicationStopped()) return false;
    }

    await checkIfPaused();
    if (isApplicationStopped()) return false;

    const selected = await selectNextJob();
    if (!selected) {
        console.log("Failed to select next job");
        return autoApply();
    }

    await checkIfPaused();
    if (isApplicationStopped()) return false;

    await sleep(2500);
    if (isApplicationStopped()) return false;

    await checkIfPaused();
    const jobInfo = await getJobInfo();
    console.log("Selected job:", jobInfo.title);
    if (isApplicationStopped()) return false;

    await checkIfPaused();
    if (isJobAlreadyApplied()) {
        console.log("Skipping already applied job:", jobInfo.title);
        return autoApply();
    }
    if (isApplicationStopped()) return false;

    await checkIfPaused();
    if (!(await isJobTitleAllowed(jobInfo.title))) {
        console.log("Skipping job due to title filter:", jobInfo.title);
        return autoApply();
    }
    if (isApplicationStopped()) return false;

    await checkIfPaused();
    console.log("Looking for Easy Apply button for job:", jobInfo.title);

    await checkIfPaused();
    if (isApplicationStopped()) return false;

    const buttons = Array.from(document.querySelectorAll("button"));
    const easyApplyButton = buttons.find(
        (button) =>
            button.className.toLowerCase().includes("job") &&
            button.textContent?.toLowerCase().includes("easy apply")
    );
    if (isApplicationStopped()) return false;

    await checkIfPaused();
    if (!easyApplyButton) {
        console.log("No Easy Apply button found");
        return autoApply();
    }
    if (isApplicationStopped()) return false;

    await checkIfPaused();
    console.log("Found Easy Apply button, clicking...");
    (easyApplyButton as HTMLElement).click();
    await sleep(2000);
    if (isApplicationStopped()) return false;

    await checkIfPaused();

    let stepCount = 0;
    while (getApplicationState() === ApplicationState.RUNNING) {
        if (isApplicationStopped()) return false;
        await checkIfPaused();

        stepCount++;
        if (stepCount > MAX_STEPS) {
            console.log(`Too many steps (${stepCount} > ${MAX_STEPS}), canceling application`);
            await cancelApplication();
            return autoApply();
        }

        await checkIfPaused();
        if (isApplicationStopped()) return false;

        currentStepIndex = stepCount;
        const result = await processApplicationStep(currentStepIndex);

        await checkIfPaused();
        if (isApplicationStopped()) return false;

        if (result) {
            console.log("Application completed successfully");
            await saveToHistory(jobInfo, "LinkedIn");

            await checkIfPaused();
            if (isApplicationStopped()) return false;

            return autoApply();
        }

        await checkIfPaused();
        if (isApplicationStopped()) return false;
    }

    await checkIfPaused();
    if (isApplicationStopped()) return false;

    return autoApply();
}
