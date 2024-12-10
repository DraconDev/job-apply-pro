import { FormInput } from "@/src/types";
import { ApplicationAnswer } from "@/types";
import { JobDetails, JobSiteHandler } from "../../common/types";

interface JobInfo {
    title: string;
    link: string;
}

interface SavedFormInputs {
    [key: string]: {
        value: string;
        type: string;
        identifiers: string[];
        lastUsed: number;
        useCount: number;
        options?: { value: string; text: string }[];
    };
}

interface JobHistoryEntry {
    title: string;
    link: string;
    appliedAt: number;
    platform: string;
}

export class LinkedInHandler implements JobSiteHandler {
    name = "LinkedIn";
    isApplying = false;
    isPaused = false;
    private currentJobIndex = 0;
    private jobListings: HTMLElement[] = [];
    currentStepIndex = 0;
    private readonly MAX_STEPS = 10;
    private currentJobInfo: JobInfo | null = null;

    setPause(paused: boolean): void {
        this.isPaused = paused;
        console.log(this.isPaused ? "Auto-apply paused" : "Auto-apply resumed");

        // Broadcast pause state change
        chrome.runtime.sendMessage({
            type: "PAUSE_STATE_CHANGED",
            isPaused: this.isPaused,
        });

        // If we're unpausing, continue the application process
        if (!this.isPaused && this.isApplying) {
            console.log("Continuing application from current step...");
            this.continueApplication();
        }
    }

    togglePause(): void {
        this.setPause(!this.isPaused);
    }

    async resumeApplication(): Promise<boolean> {
        if (this.isPaused) {
            this.setPause(false);
            return this.autoApply();
        }
        return false;
    }

    isValidJobPage(): boolean {
        const url = window.location.href;
        return url.includes("linkedin.com/jobs/");
    }

    getJobDetails(): JobDetails | null {
        if (!this.isValidJobPage()) return null;

        const title =
            document
                .querySelector(".jobs-unified-top-card__job-title")
                ?.textContent?.trim() || "";
        const company =
            document
                .querySelector(".jobs-unified-top-card__company-name")
                ?.textContent?.trim() || "";
        const location = document
            .querySelector(".jobs-unified-top-card__bullet")
            ?.textContent?.trim();

        return {
            title,
            company,
            location,
            url: window.location.href,
        };
    }

    async applyToJob(): Promise<boolean> {
        const applyButton = document.querySelector(
            ".jobs-apply-button"
        ) as HTMLButtonElement;
        if (!applyButton) return false;

        try {
            applyButton.click();
            // TODO: Handle the application form filling
            return true;
        } catch (error) {
            console.error("Failed to apply:", error);
            return false;
        }
    }

    private async handleSubmitButton(
        button: HTMLElement,
        isNextButton: boolean = false
    ): Promise<boolean> {
        if (this.isPaused) {
            console.log("Application paused before submitting");
            return false;
        }

        console.log("Handling submit button click...");

        // Save form inputs before submitting
        await this.saveFormInput();

        // First click the submit button
        button.click();
        await this.sleep(2000); // Initial wait after click

        if (this.isPaused) {
            console.log("Application paused after submit click");
            return false;
        }

        // Check for any error messages that might appear
        if (this.hasErrors()) {
            console.log("Found errors after submit click");
            if (!this.isPaused) {
                await this.handleValidationErrors();
            }
        }

        if (this.isPaused) {
            console.log("Application paused before final wait");
            return false;
        }

        // Wait longer for submission to complete
        await this.sleep(1000); // Reduced wait time from 8s to 3s

        if (this.isPaused) {
            console.log("Application paused before storage update");
            return false;
        }

        // Update jobs applied counter in sync storage
        try {
            const result = await chrome.storage.sync.get(["jobsApplied"]);
            const currentCount = result.jobsApplied || 0;
            const newCount = currentCount + 1;
            await chrome.storage.sync.set({
                jobsApplied: newCount,
            });
            console.log(`Incremented jobs applied counter to ${newCount}`);
        } catch (error) {
            console.error("Failed to update application data:", error);
        }

        if (this.isPaused) {
            console.log("Application paused before done button");
            return false;
        }

        await this.midWait();
        const doneButtons =
            document.querySelectorAll<HTMLButtonElement>("button");
        const doneButton = Array.from(doneButtons).find(
            (button) =>
                button.textContent?.toLowerCase().includes("done") ||
                button.textContent?.toLowerCase().includes("finish")
        );
        if (doneButton) {
            console.log("Found done button, clicking it");
            if (!this.isPaused) {
                doneButton.click();
            }
        } else {
            console.log("No done button found");
        }

        if (this.isPaused) {
            console.log("Application paused before final cleanup");
            return false;
        }

        await this.midWait();

        // Reset for next job
        this.currentStepIndex = 0;
        this.isApplying = false;

        // Start next job application
        console.log("Starting next job application...");
        if (!this.isPaused && window.location.href.includes("/jobs/")) {
            this.currentJobIndex++;
            await this.autoApply();
        }

        return true;
    }

    private async handleRegularButton(button: HTMLElement): Promise<void> {
        console.log(
            "This appears to be a regular next/done button, clicking it"
        );
        button.click();
        await this.sleep(1000);
    }

    private async handleValidationErrors(): Promise<boolean> {
        console.log("Found validation issues, filling required fields...");
        await this.fillCurrentStep();

        // Try to proceed again
        const retryButton = await this.findNextButton();
        if (!retryButton) {
            console.log("No next button found after filling fields");
            this.isApplying = false;
            return false;
        }
        retryButton.click();
        await this.sleep(1000);
        return true;
    }

    private async processApplicationStep(stepCount: number): Promise<boolean> {
        if (this.isPaused) {
            console.log("Application is paused, skipping step processing");
            return false;
        }

        console.log(`Processing step ${stepCount}/${this.MAX_STEPS}...`);

        // Save current form state before checking alerts
        await this.saveFormInput();

        // Check for any alerts before proceeding
        const alerts = await this.checkForAlerts();
        if (alerts.length > 0) {
            console.log(
                "Found alerts, pausing for 30 seconds for possible manual input:",
                alerts
            );

            // Set pause state
            this.isPaused = true;

            // Create a timeout that will be cleared if we unpause early
            const timeoutPromise = new Promise<void>((resolve) => {
                const timeout = setTimeout(() => {
                    // Only unpause if we haven't already been unpaused manually
                    if (this.isPaused) {
                        console.log(
                            "30 seconds elapsed, automatically unpausing"
                        );
                        this.isPaused = false;
                    }
                    resolve();
                }, 30000);

                // Set up an interval to check if we've been manually unpaused
                const checkInterval = setInterval(() => {
                    if (!this.isPaused) {
                        console.log(
                            "Manual unpause detected, clearing auto-unpause timer"
                        );
                        clearTimeout(timeout);
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 500);
            });

            // Wait for either timeout or manual unpause
            await timeoutPromise;

            // Try to fill fields from sync store after pause
            console.log(
                "Attempting to fill fields from sync store after pause"
            );
            await this.fillFormInput();

            // Save any new field values that might have been manually entered
            console.log("Saving any manually entered field values");
            await this.saveFormInput();

            // Check if alerts are still present
            const updatedAlerts = await this.checkForAlerts();
            if (updatedAlerts.length > 0) {
                console.log(
                    "Alerts still present after pause and fill attempt, skipping application:",
                    updatedAlerts
                );
                await this.skipCurrentApplication();
                return false;
            } else {
                console.log("Alerts resolved, continuing with application");
            }
        }

        await this.sleep(1000);

        const submitButton = await this.waitForElement(
            `button[type="submit"], 
             button[aria-label*="submit" i]`,
            5000
        );
        if (submitButton) {
            if (this.isPaused) {
                console.log("Application paused before submit");
                return false;
            }
            console.log("Found submit button, clicking it...");
            await this.handleSubmitButton(submitButton as HTMLElement, false);
            return true; // Only return true when we've actually submitted
        }

        // First try to proceed without filling anything
        if (this.isPaused) {
            console.log("Application paused before finding next button");
            return false;
        }

        console.log("Attempting to proceed without filling fields...");
        const nextButton = await this.findNextButton();

        if (this.isPaused) {
            console.log("Application paused after finding next button");
            return false;
        }

        if (nextButton) {
            console.log("Found next button, clicking it...");
            // Save form inputs before clicking next
            await this.saveFormInput();
            (nextButton as HTMLElement).click();
            await this.sleep(2000);
            return false; // Continue to next step, don't mark as complete
        }

        // Check for any validation errors or required fields
        if (this.hasErrors()) {
            if (!this.isPaused) {
                await this.handleValidationErrors();
            }
        }

        return false;
    }

    async autoApply(): Promise<boolean> {
        if (this.isApplying) {
            console.log("Already applying to jobs");
            return false;
        }

        this.isApplying = true;

        // If we're on the search page, load all job listings
        if (window.location.href.includes("/jobs/")) {
            console.log("On jobs page, loading listings...");
            const loaded = await this.loadJobListings();
            if (!loaded) {
                console.log("Failed to load job listings");
                this.isApplying = false;
                return false;
            }

            // Select the next job to process
            const selected = await this.selectNextJob();
            if (!selected) {
                console.log("Failed to select next job");
                this.isApplying = false;
                return false;
            }

            // Wait for the job details to load
            await this.sleep(2500); // Increased wait time to ensure h1 loads
        }

        // Get job info for logging
        const jobInfo = await this.getJobInfo();
        this.currentJobInfo = jobInfo; // Store job info for later use
        console.log("Selected job:", jobInfo.title);

        // Check if already applied to current job
        if (this.isJobAlreadyApplied()) {
            console.log("Skipping already applied job:", jobInfo.title);
            this.isApplying = false;
            return false;
        }

        // Check if job title is allowed
        if (!(await this.isJobTitleAllowed(jobInfo.title))) {
            console.log("Skipping job due to title filter:", jobInfo.title);
            this.isApplying = false;
            return false;
        }

        // Click the apply button
        console.log("Looking for Easy Apply button for job:", jobInfo.title);

        // Find any button that has "job" in its class name and "easy apply" in text
        const buttons = Array.from(document.querySelectorAll("button"));
        const easyApplyButton = buttons.find(
            (button) =>
                button.className.toLowerCase().includes("job") &&
                button.textContent?.toLowerCase().includes("easy apply")
        );

        if (!easyApplyButton) {
            console.log("No Easy Apply button found");
            this.isApplying = false;
            return false;
        }

        if (this.isPaused) {
            console.log("Application paused before clicking Easy Apply");
            return false;
        }

        console.log("Found Easy Apply button, clicking...");
        (easyApplyButton as HTMLElement).click();
        await this.sleep(2000);

        // Process each step of the application
        let stepCount = 0;
        while (this.isApplying) {
            if (this.isPaused) {
                console.log("Application paused, waiting...");
                await this.sleep(1000);
                continue;
            }

            stepCount++;
            if (stepCount > this.MAX_STEPS) {
                console.log(
                    `Too many steps (${stepCount} > ${this.MAX_STEPS}), canceling application`
                );
                await this.cancelApplication();
                return false;
            }

            this.currentStepIndex = stepCount;
            const result = await this.processApplicationStep(
                this.currentStepIndex
            );
            if (result) {
                console.log("Application completed successfully");
                await this.saveToHistory(jobInfo);
                return true;
            }

            if (this.isPaused) {
                console.log("Application paused after step processing");
                return false;
            }
        }

        console.log("Application process stopped");
        return false;
    }

    private isApplicationComplete(): boolean {
        console.log("Checking if application is complete...");

        // Look for any modal, dialog or message that indicates completion
        const possibleElements = document.querySelectorAll(
            '[role="dialog"], [role="alertdialog"], .modal, .dialog'
        );
        console.log(
            `Found ${possibleElements.length} possible dialog/modal elements`
        );

        for (const element of possibleElements) {
            const text = element.textContent?.toLowerCase() || "";
            console.log("Checking element text:", text);

            if (text.includes("application sent")) {
                console.log("Found 'application sent' message");
                return true;
            }
            if (text.includes("successfully submitted")) {
                console.log("Found 'successfully submitted' message");
                return true;
            }
            if (text.includes("thank you for applying")) {
                console.log("Found 'thank you for applying' message");
                return true;
            }
        }

        console.log("No completion message found");
        return false;
    }

    private async loadJobListings(): Promise<boolean> {
        console.log("Loading job listings from search page");
        try {
            // Wait for the main content section to load
            await this.sleep(1000);

            const mainContent = document.querySelector("main");
            if (!mainContent) {
                console.log("Main content area not found");
                return false;
            }

            const jobList = mainContent.querySelector("ul");
            if (!jobList) {
                console.log("Job list (ul) not found in main content");
                return false;
            }

            let previousHeight = 0;
            let sameHeightCount = 0;
            const MAX_SAME_HEIGHT_ATTEMPTS = 1;

            // Keep scrolling until we've hit the bottom
            while (true) {
                // Get all li elements
                const items = Array.from(jobList.children).filter(
                    (element) => element.tagName.toLowerCase() === "li"
                ) as HTMLElement[];

                this.jobListings = items;
                console.log(`Found ${items.length} job items so far...`);

                // Scroll to load more
                window.scrollTo(0, document.body.scrollHeight);
                await this.sleep(1000);

                // Check if we've reached the bottom
                const currentHeight = document.body.scrollHeight;
                if (currentHeight === previousHeight) {
                    sameHeightCount++;
                    if (sameHeightCount >= MAX_SAME_HEIGHT_ATTEMPTS) {
                        break;
                    }
                } else {
                    sameHeightCount = 0;
                }
                previousHeight = currentHeight;
            }

            console.log(
                `Finished loading. Found total of ${this.jobListings.length} jobs`
            );

            if (this.jobListings.length === 0) {
                console.log("No job listings found");
                return false;
            }

            // Scroll back to top
            window.scrollTo(0, 0);
            return true;
        } catch (error) {
            console.error("Error loading job listings:", error);
            return false;
        }
    }

    private async selectNextJob(): Promise<boolean> {
        if (this.currentJobIndex >= this.jobListings.length) {
            console.log("No more jobs to process");
            return false;
        }

        const jobItem = this.jobListings[this.currentJobIndex];

        try {
            // Find and click the job title link
            const titleElement = Array.from(
                jobItem.getElementsByTagName("a")
            ).find((a) => a.getAttribute("href")?.includes("/jobs/view/"));

            console.log(
                `Selecting job ${this.currentJobIndex + 1} of ${
                    this.jobListings.length
                }`
            );

            // Scroll the job into view
            jobItem.scrollIntoView({ behavior: "smooth", block: "center" });
            await this.sleep(1000); // Wait longer for scroll

            // Click the job title link
            if (titleElement) {
                titleElement.click();
                await this.sleep(2500); // Wait longer for job details to load
                this.currentJobIndex++;
                return true;
            } else {
                console.log("Could not find job title link to click");
                this.currentJobIndex++; // Skip this job
                return false;
            }
        } catch (error) {
            console.error("Error selecting job:", error);
            this.currentJobIndex++; // Skip on error
            return false;
        }
    }

    private isJobAlreadyApplied(): boolean {
        // Areas to check for "Applied" text
        const containersToCheck = [
            ".jobs-unified-top-card", // Main job header
            ".jobs-s-apply", // Application section/button area
            ".jobs-apply-button", // The apply button itself
            ".jobs-s-apply__application-status", // Status message area
        ];

        for (const selector of containersToCheck) {
            const element = document.querySelector(selector);
            if (element?.textContent?.toLowerCase().includes("applied")) {
                console.log(
                    `Found 'Applied' text in ${selector} - job was already applied to`
                );
                return true;
            }
        }

        return false;
    }

    private async fillCurrentStep(): Promise<void> {
        console.log("Starting to fill current step");
        const formElements = this.getVisibleFormElements();
        console.log(`Found ${formElements.length} form elements`);

        for (const element of formElements) {
            try {
                if (
                    element instanceof HTMLInputElement ||
                    element instanceof HTMLTextAreaElement ||
                    element instanceof HTMLSelectElement
                ) {
                    await this.fillFormInput();
                    await this.sleep(1000);
                    await this.saveFormInput();
                }
            } catch (error) {
                console.error("Error processing form element:", error);
            }
        }
        console.log("Finished filling current step");
    }

    async saveFormInput() {
        try {
            console.log("=== Starting saveFormInput ===");

            // Find dialog and form divs using the new method
            const result = this.findFormDivs();
            if (!result) return;
            const { formDivs, dialog } = result;

            // Combine and deduplicate form elements
            const allFormElements = new Set([...formDivs]);
            console.log(`Total unique form elements: ${allFormElements.size}`);

            // Get all saved form inputs once
            const result2 = await chrome.storage.sync.get(["savedFormInputs"]);
            const savedFormInputs: SavedFormInputs =
                result2.savedFormInputs || {};
            console.log(
                "Current saved form inputs:",
                Object.keys(savedFormInputs).length
            );

            let processedCount = 0;
            let skippedCount = 0;

            // Process each form element
            for (const element of allFormElements) {
                // Find the input/select/textarea element
                const inputElement = element.querySelector(
                    "input, select, textarea"
                );

                if (!inputElement) {
                    console.log("No input element found in div");
                    skippedCount++;
                    continue;
                }

                if (!this.isElementVisible(inputElement)) {
                    console.log("Input element not visible");
                    skippedCount++;
                    continue;
                }

                // Try to find label
                const labelElement =
                    (inputElement.id &&
                        document.querySelector(
                            `label[for="${inputElement.id}"]`
                        )) ||
                    element.querySelector("label") ||
                    Array.from(element.children).find(
                        (child) =>
                            child !== inputElement &&
                            child.textContent?.trim() &&
                            !child.querySelector("input, select, textarea")
                    );

                // Clean up duplicated label text
                const rawLabel = labelElement?.textContent?.trim();
                let label: string | undefined;

                if (rawLabel) {
                    // Split the text in half
                    const parts = [
                        rawLabel.slice(0, rawLabel.length / 2),
                        rawLabel.slice(rawLabel.length / 2),
                    ].map((part) => part.trim());

                    // If the first part equals the second part, just use the first part
                    label = parts[0] === parts[1] ? parts[0] : rawLabel;
                }

                console.log("Processing form component:", {
                    label,
                    inputType: inputElement.tagName.toLowerCase(),
                    inputId: inputElement.id,
                    inputName: (inputElement as HTMLInputElement).name,
                    isVisible: this.isElementVisible(inputElement),
                    value: (inputElement as HTMLInputElement).value?.slice(
                        0,
                        20
                    ),
                });

                if (!label) {
                    console.log("Skipping - no label found");
                    skippedCount++;
                    continue;
                }

                if (
                    !(
                        inputElement instanceof HTMLInputElement ||
                        inputElement instanceof HTMLTextAreaElement ||
                        inputElement instanceof HTMLSelectElement
                    )
                ) {
                    console.log("Skipping - invalid input type");
                    skippedCount++;
                    continue;
                }

                const value = inputElement.value.trim();

                const identifiers = [
                    inputElement.id,
                    (inputElement as HTMLInputElement).name,
                    inputElement.getAttribute("aria-label"),
                    inputElement.getAttribute("placeholder"),
                ].filter(Boolean) as string[];

                // Only update if the value is different or the field doesn't exist
                const existingInput = savedFormInputs[label];
                if (!existingInput || existingInput.value !== value) {
                    const inputType =
                        inputElement instanceof HTMLSelectElement
                            ? "select"
                            : inputElement instanceof HTMLTextAreaElement
                            ? "textarea"
                            : inputElement.type;

                    // Get options for select elements
                    let options;
                    if (inputElement instanceof HTMLSelectElement) {
                        options = Array.from(inputElement.options).map(
                            (option) => ({
                                value: option.value,
                                text:
                                    option.textContent?.trim() || option.value,
                            })
                        );
                    }

                    savedFormInputs[label] = {
                        ...existingInput,
                        value,
                        type: inputType,
                        identifiers: [
                            ...new Set([
                                ...(existingInput?.identifiers || []),
                                ...identifiers,
                            ]),
                        ],
                        lastUsed: Date.now(),
                        useCount: (existingInput?.useCount || 0) + 1,
                        ...(options && { options }),
                    };
                    processedCount++;

                    console.log("Updated form input:", {
                        label,
                        value:
                            value.slice(0, 20) +
                            (value.length > 20 ? "..." : ""),
                        type: savedFormInputs[label].type,
                        identifiers: savedFormInputs[label].identifiers,
                        ...(options && { options }),
                    });
                } else {
                    console.log("Skipping - value unchanged:", {
                        label,
                        value: value.slice(0, 20),
                    });
                    skippedCount++;
                }
            }

            // Save all form inputs at once
            await chrome.storage.sync.set({ savedFormInputs });
            console.log("=== Form Save Summary ===");
            console.log(`Total fields processed: ${processedCount}`);
            console.log(`Total fields skipped: ${skippedCount}`);
            console.log(
                `Total fields in storage: ${
                    Object.keys(savedFormInputs).length
                }`
            );
            console.log("========================");
        } catch (error) {
            console.error("Error saving form input:", error);
        }
    }

    private findFormDivs(): { formDivs: Element[]; dialog: Element } | null {
        // Find divs that contain both label and input elements
        const dialog = document.querySelector('[role="dialog"]');
        console.log("Dialog element found:", !!dialog);

        if (!dialog) {
            console.log("No dialog found, checking document body:", {
                bodyContent: document.body.textContent?.slice(0, 100) + "...",
                dialogCount:
                    document.querySelectorAll('[role="dialog"]').length,
                visibleInputs: document.querySelectorAll(
                    'input:not([type="hidden"]), select, textarea'
                ).length,
            });
            return null;
        }

        // Find divs that contain both label and input elements
        const allDivs = dialog.querySelectorAll("div");
        console.log(`Total divs found in dialog: ${allDivs.length}`);

        const formDivs = Array.from(allDivs).filter((div) => {
            const hasLabel = div.querySelector("label") !== null;
            const hasInput =
                div.querySelector("input, select, textarea") !== null;
            const isVisible = this.isElementVisible(div);

            if (hasLabel || hasInput) {
                console.log("Potential form div:", {
                    hasLabel,
                    hasInput,
                    isVisible,
                    labelText: div.querySelector("label")?.textContent?.trim(),
                    inputType: div.querySelector("input, select, textarea")
                        ?.tagName,
                    inputValue: (
                        div.querySelector(
                            "input, select, textarea"
                        ) as HTMLInputElement
                    )?.value?.slice(0, 20),
                });
            }

            return hasLabel && hasInput;
        });

        console.log(`Found ${formDivs.length} form divs with label+input`);
        return { formDivs, dialog };
    }

    private getQuestionLabel(element: Element): string {
        // Find the parent form component
        const formComponent = element.closest('[class*="form-component"]');
        console.log("Found form component:", formComponent?.className);

        if (formComponent) {
            // Log all children for debugging
            console.log(
                "Form component children:",
                Array.from(formComponent.children).map((child) => ({
                    tagName: child.tagName,
                    className: child.className,
                    textContent: child.textContent?.trim(),
                    isInputElement: child === element,
                }))
            );

            // Get the first text content that's not from the input/select element
            const label = Array.from(formComponent.children)
                .find((child) => child !== element && child.textContent?.trim())
                ?.textContent?.trim();

            console.log(
                "Found label:",
                label,
                "for element:",
                element.tagName,
                element.getAttribute("id")
            );
            if (label) return label;
        }

        // Fallback to element identifiers
        const fallbackLabel =
            element.getAttribute("aria-label") ||
            element.getAttribute("placeholder") ||
            "Unknown Question";

        console.log("Using fallback label:", fallbackLabel);
        return fallbackLabel;
    }

    async fillFormInput(): Promise<boolean> {
        try {
            // Find all form elements in dialog
            const result = this.findFormDivs();
            if (!result) return false;
            const { formDivs } = result;

            let success = false;
            for (const div of formDivs) {
                const element = div.querySelector("input, select, textarea") as
                    | HTMLInputElement
                    | HTMLTextAreaElement
                    | HTMLSelectElement;

                if (!element || !this.isElementVisible(element)) continue;

                // Get identifiers from the element
                const identifiers = [
                    element.id,
                    (element as HTMLInputElement).name,
                    element.getAttribute("aria-label"),
                    element.getAttribute("placeholder"),
                ].filter(Boolean) as string[];

                if (identifiers.length === 0) continue;

                // Get saved form inputs
                const result = await chrome.storage.sync.get([
                    "savedFormInputs",
                ]);
                const savedFormInputs: SavedFormInputs =
                    result.savedFormInputs || {};

                // Find a matching input
                const matchingInput = Object.values(savedFormInputs).find(
                    (input: FormInput) =>
                        input.identifiers.some((savedId: string) =>
                            identifiers.some(
                                (id) =>
                                    savedId.toLowerCase() === id.toLowerCase()
                            )
                        )
                );

                if (!matchingInput) continue;

                // Fill the value
                if (element instanceof HTMLSelectElement) {
                    // For select elements, first verify if the saved value is still a valid option
                    const isValidOption = Array.from(element.options).some(
                        (option) => option.value === matchingInput.value
                    );

                    if (isValidOption) {
                        element.value = matchingInput.value;
                    } else if (matchingInput.options) {
                        // If the saved value is not valid but we have saved options,
                        // try to find a matching option by text
                        const savedOption = matchingInput.options.find((opt) =>
                            Array.from(element.options).some(
                                (currentOpt) =>
                                    currentOpt.textContent
                                        ?.trim()
                                        .toLowerCase() ===
                                    opt.text.toLowerCase()
                            )
                        );
                        if (savedOption) {
                            element.value = savedOption.value;
                        }
                    }
                } else if (
                    element instanceof HTMLInputElement ||
                    element instanceof HTMLTextAreaElement
                ) {
                    element.value = matchingInput.value;
                }

                element.dispatchEvent(new Event("input", { bubbles: true }));
                element.dispatchEvent(new Event("change", { bubbles: true }));
                success = true;
            }
            return success;
        } catch (error) {
            console.error("Failed to fill form input:", error);
            return false;
        }
    }

    private isElementVisible(element: Element): boolean {
        const style = window.getComputedStyle(element);
        return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.opacity !== "0"
        );
    }

    private async findNextButton(): Promise<HTMLElement | null> {
        console.log("Searching for next button...");
        const nextButtons = Array.from(document.querySelectorAll("button"));

        const buttonTexts = nextButtons.map((b) =>
            b.textContent?.toLowerCase()
        );

        const nextButton = nextButtons.find((button) => {
            const text = button.textContent?.toLowerCase() || "";
            return (
                text.includes("next") ||
                text.includes("continue") ||
                text.includes("review")
            );
        }) as HTMLElement;

        if (nextButton) {
            console.log("Found next button with text:", nextButton.textContent);
        } else {
            console.log("No next button found");
        }

        return nextButton || null;
    }

    private async pressEscape() {
        // Try different ways to send Escape key
        const escapeEvent = new KeyboardEvent("keydown", {
            key: "Escape",
            code: "Escape",
            keyCode: 27,
            which: 27,
            bubbles: true,
            cancelable: true,
        });

        // Send to document
        document.dispatchEvent(escapeEvent);
        await this.sleep(500);

        // Send to body
        document.body.dispatchEvent(escapeEvent);
        await this.sleep(500);
    }

    private async closeModal(): Promise<void> {
        console.log("Attempting to close modal...");

        // First try pressing Escape
        await this.pressEscape();
        await this.sleep(1000);

        // Wait a bit for any confirmation dialog
        await this.sleep(1000);

        // Look for discard button in any confirmation dialog
        const discardButton = Array.from(
            document.querySelectorAll("button")
        ).find((button) =>
            button.textContent?.toLowerCase().includes("discard")
        );

        if (discardButton) {
            console.log("Found discard button, clicking it");
            (discardButton as HTMLElement).click();
            await this.sleep(500);
        } else {
            console.log("No discard button found");
        }
    }

    private async waitForElement(
        selector: string,
        timeout = 5000
    ): Promise<Element | null> {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            const element = document.querySelector(selector);
            if (element) return element;
            await this.sleep(100);
        }
        return null;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private async saveAnswer(question: string, answer: string) {
        const newAnswer: ApplicationAnswer = {
            question,
            answer,
            timestamp: new Date().toISOString(),
        };

        try {
            // Get existing answers
            const result = await chrome.storage.sync.get([
                "applicationAnswers",
            ]);
            const answers: ApplicationAnswer[] =
                result.applicationAnswers || [];

            // Add new answer
            answers.push(newAnswer);

            // Keep only last 100 answers to stay within storage limits
            const recentAnswers = answers.slice(-100);

            // Save back to storage
            await chrome.storage.sync.set({
                applicationAnswers: recentAnswers,
            });
            console.log("Saved answer:", newAnswer);
        } catch (error) {
            console.error("Failed to save answer to sync storage:", error);
            // Fallback to local storage if sync fails
            const result = await chrome.storage.local.get([
                "applicationAnswers",
            ]);
            const answers: ApplicationAnswer[] =
                result.applicationAnswers || [];
            answers.push(newAnswer);
            await chrome.storage.local.set({ applicationAnswers: answers });
        }
    }

    async fillOutField(
        field: HTMLInputElement | HTMLTextAreaElement,
        value: string
    ) {
        field.focus();
        field.value = value;
        field.dispatchEvent(new Event("input", { bubbles: true }));
        field.dispatchEvent(new Event("change", { bubbles: true }));

        // Save the answer
        const label =
            field.getAttribute("aria-label") ||
            field.placeholder ||
            "Unknown field";
        await this.saveAnswer(label, value);
    }

    private getVisibleFormElements(): Element[] {
        // First find the dialog element
        const dialog = document.querySelector('[role="dialog"]');
        console.log(
            "Looking for dialog element:",
            dialog ? "Found" : "Not found"
        );
        if (!dialog) return [];

        // Then find form elements within the dialog
        const allElements = dialog.querySelectorAll("input, select, textarea");
        console.log(
            `Found ${allElements.length} total form elements in dialog`
        );

        const visibleElements = Array.from(allElements).filter((element) => {
            const isVisible = this.isElementVisible(element);
            const elementInfo = {
                type:
                    element instanceof HTMLInputElement
                        ? element.type
                        : element.tagName.toLowerCase(),
                id: element.id || "no-id",
                name: (element as HTMLInputElement).name || "no-name",
                "aria-label":
                    element.getAttribute("aria-label") || "no-aria-label",
                visible: isVisible,
            };
            console.log("Form element info:", elementInfo);
            return isVisible;
        });

        console.log(
            `Found ${visibleElements.length} visible form elements out of ${allElements.length} total`
        );

        // Log details of visible elements
        visibleElements.forEach((element, index) => {
            const elementDetails = {
                index,
                type:
                    element instanceof HTMLInputElement
                        ? element.type
                        : element.tagName.toLowerCase(),
                value:
                    element instanceof HTMLInputElement ||
                    element instanceof HTMLTextAreaElement ||
                    element instanceof HTMLSelectElement
                        ? element.value
                        : "N/A",
                id: element.id || "no-id",
                name: (element as HTMLInputElement).name || "no-name",
                "aria-label":
                    element.getAttribute("aria-label") || "no-aria-label",
                placeholder:
                    element instanceof HTMLInputElement
                        ? element.placeholder
                        : "no-placeholder",
            };
            console.log(
                `Visible element ${index + 1} details:`,
                elementDetails
            );
        });

        return visibleElements;
    }

    // Reset the job index when starting a new search
    resetJobIndex(): void {
        this.currentJobIndex = 0;
        this.jobListings = [];
    }

    private async continueApplication(): Promise<void> {
        try {
            console.log("Attempting to continue application...");

            // Check if paused before continuing
            if (this.isPaused) {
                console.log("Application is paused, not continuing");
                return;
            }

            // Click the next/submit button to continue
            console.log("Looking for next/submit button to continue...");
            const nextButton = await this.findNextButton();
            if (!nextButton) {
                console.log("No next button found to continue application");
                this.isApplying = false;
                return;
            }

            console.log(
                "Found next button, clicking to continue application..."
            );
            nextButton.click();

            // Continue with the application steps
            let stepCount = this.currentStepIndex;
            console.log(`Resuming from step ${stepCount}`);

            while (!this.isPaused) {
                stepCount++;
                if (stepCount > this.MAX_STEPS) {
                    console.log(
                        `Too many steps (${stepCount} > ${this.MAX_STEPS}), canceling application`
                    );
                    await this.cancelApplication();
                    return;
                }

                this.currentStepIndex = stepCount;
                console.log(
                    `Processing step ${stepCount}/${this.MAX_STEPS}...`
                );
                console.log(`Current step index: ${this.currentStepIndex}`);
                await this.sleep(1000);

                // Check pause state after sleep
                if (this.isPaused) {
                    console.log(`Auto-apply paused during step ${stepCount}`);
                    return;
                }

                // Look for submit button first
                const submitButton = await this.waitForElement(
                    'button[type="submit"], button:contains("Submit"), button:contains("Review"), button[aria-label*="submit" i]',
                    5000
                );

                if (submitButton) {
                    console.log(
                        "Found submit button, handling final submission..."
                    );
                    await this.handleSubmitButton(
                        submitButton as HTMLElement,
                        false
                    );
                    return;
                }

                // Check pause state again
                if (this.isPaused) {
                    console.log(`Auto-apply paused during step ${stepCount}`);
                    return;
                }

                // Click the next/submit button
                console.log(
                    `Looking for next/submit button for step ${stepCount}...`
                );
                const nextBtn = await this.findNextButton();
                if (!nextBtn) {
                    console.log(
                        `No next button found on step ${stepCount}, ending application`
                    );
                    this.isApplying = false;
                    this.currentStepIndex = 0;
                    return;
                }

                console.log(
                    `Found next button for step ${stepCount}, clicking...`
                );
                // Save form values before clicking next
                await this.saveFormValues();
                nextBtn.click();
                console.log(`Clicked next button for step ${stepCount}`);

                // Add a check for potential error messages
                await this.sleep(500);

                // Check pause state after sleep
                if (this.isPaused) {
                    console.log(`Auto-apply paused during step ${stepCount}`);
                    return;
                }

                // Fill current step
                console.log(
                    `Starting to fill out fields in step ${stepCount}...`
                );
                await this.fillCurrentStep();
                console.log(`Completed filling fields in step ${stepCount}`);

                if (this.isPaused) {
                    console.log(`Auto-apply paused after step ${stepCount}`);
                    return;
                }
            }
        } catch (error) {
            console.error("Error during continue application:", error);
            console.log("Resetting application state due to error");
            this.isApplying = false;
            this.currentStepIndex = 0;
        }
    }

    public async skipCurrentApplication() {
        console.log("Skipping current application...");

        this.isPaused = true;
        if (await this.findDismissButton()) {
            // First cancel any open dialogs/forms
            await this.cancelApplication();
        }

        // Reset state and move to next job
        this.currentStepIndex = 0;
        this.isApplying = false;
        this.isPaused = false;
    }

    async findDismissButton(): Promise<Element | null> {
        const dismissButtons = Array.from(
            document.querySelectorAll("button")
        ).filter(
            (button) =>
                button.textContent?.toLowerCase().includes("dismiss") ||
                button
                    .getAttribute("aria-label")
                    ?.toLowerCase()
                    .includes("dismiss")
        );

        if (dismissButtons.length > 0) {
            return dismissButtons[0];
        }
        return null;
    }

    async cancelApplication(): Promise<void> {
        console.log("Canceling application process...");

        // Look for and click the dismiss button
        const dismissButtons = Array.from(
            document.querySelectorAll("button")
        ).filter(
            (button) =>
                button.textContent?.toLowerCase().includes("dismiss") ||
                button
                    .getAttribute("aria-label")
                    ?.toLowerCase()
                    .includes("dismiss")
        );

        if (dismissButtons.length > 0) {
            console.log("Found dismiss button, clicking it...");
            dismissButtons[0].click();
            await this.sleep(1000);
        }

        // Look for and click the discard button
        const discardButtons = Array.from(
            document.querySelectorAll("button")
        ).filter(
            (button) =>
                button.textContent?.toLowerCase().includes("discard") ||
                button
                    .getAttribute("aria-label")
                    ?.toLowerCase()
                    .includes("discard")
        );

        if (discardButtons.length > 0) {
            console.log("Found discard button, clicking it...");
            discardButtons[0].click();
            await this.sleep(1000);
        }

        // Reset all application state
        this.isApplying = false;
        this.isPaused = false;
        this.currentStepIndex = 0;
        console.log("Application canceled");
    }

    private midWait(): Promise<void> {
        console.log("Starting mid wait ");
        return this.sleep(5000);
    }

    private hasErrors(): boolean {
        // Check for inline error messages (red text under fields)
        const inlineErrors = document.querySelectorAll(
            ".artdeco-inline-feedback--error"
        );

        // Check for alert/error messages (usually at top of form)
        const alerts = document.querySelectorAll(
            '[role="alert"], .alert, .error-message'
        );

        // Check for required field indicators
        const requiredFields = document.querySelectorAll(
            '[required], [aria-required="true"]'
        );
        const emptyRequiredFields = Array.from(requiredFields).filter(
            (field) => {
                if (
                    field instanceof HTMLInputElement ||
                    field instanceof HTMLTextAreaElement ||
                    field instanceof HTMLSelectElement
                ) {
                    return !field.value;
                }
                return false;
            }
        );

        const hasErrors =
            inlineErrors.length > 0 ||
            alerts.length > 0 ||
            emptyRequiredFields.length > 0;

        if (hasErrors) {
            console.log("Found form validation issues:");
            if (inlineErrors.length > 0) {
                console.log(
                    "- Inline errors:",
                    Array.from(inlineErrors).map((el) => el.textContent)
                );
            }
            if (alerts.length > 0) {
                console.log(
                    "- Alert messages:",
                    Array.from(alerts).map((el) => el.textContent)
                );
            }
            if (emptyRequiredFields.length > 0) {
                console.log(
                    "- Empty required fields:",
                    emptyRequiredFields.length
                );
            }
        }

        return hasErrors;
    }

    private async longWait(): Promise<void> {
        console.log("Starting long wait ");
        await this.sleep(10000);
    }

    private async saveFormValues(): Promise<void> {
        console.log("Saving current form values");
        const formData: Record<string, string> = {};

        try {
            // Get all form inputs
            const inputs = document.querySelectorAll("input, select, textarea");

            for (const input of inputs) {
                if (!this.isElementVisible(input)) continue;

                let value = "";
                let identifier = "";

                // Get identifier in priority: name -> id -> aria-label -> placeholder
                identifier =
                    input.getAttribute("name") ||
                    input.getAttribute("id") ||
                    input.getAttribute("aria-label") ||
                    (input instanceof HTMLInputElement
                        ? input.placeholder
                        : "") ||
                    "";

                if (!identifier) continue;

                if (input instanceof HTMLSelectElement) {
                    value = input.value;
                } else if (input instanceof HTMLInputElement) {
                    switch (input.type) {
                        case "radio":
                        case "checkbox":
                            value = input.checked ? "true" : "false";
                            break;
                        default:
                            value = input.value;
                    }
                } else if (input instanceof HTMLTextAreaElement) {
                    value = input.value;
                }

                if (value) {
                    formData[identifier] = value;
                }
            }

            // Save to chrome.storage.sync
            await chrome.storage.sync.set({ savedFormValues: formData });
            console.log("Saved form values:", formData);
        } catch (error) {
            console.error("Error saving form values:", error);
        }
    }

    private async checkForAlerts(): Promise<string[]> {
        // Find all elements with role="alert"
        const alertElements = document.querySelectorAll('[role="alert"]');
        const alertMessages: string[] = [];

        alertElements.forEach((element) => {
            const text = element.textContent?.trim();
            if (text) {
                alertMessages.push(text);
            }
        });

        if (alertMessages.length > 0) {
            console.log("Found alert messages:", alertMessages);
        }

        return alertMessages;
    }

    async getJobInfo(): Promise<JobInfo> {
        try {
            console.log("Looking for h1 with job title link...");
            const allH1s = Array.from(document.querySelectorAll("h1"));
            const h1WithLink = allH1s.find((h1) => h1.querySelector("a"));

            if (!h1WithLink) {
                throw new Error("Could not find h1 with link");
            }

            const linkElement = h1WithLink.querySelector("a");
            if (!linkElement) {
                throw new Error("Could not find link in h1");
            }

            const jobInfo = {
                title: (linkElement.textContent?.trim() || "").toLowerCase(),
                link:
                    linkElement.href || linkElement.getAttribute("href") || "",
            };

            console.log("Found job info:", jobInfo);
            return jobInfo;
        } catch (error) {
            console.error("Error getting job info:", error);
            return { title: "", link: "" };
        }
    }

    private async isJobTitleAllowed(jobTitle: string): Promise<boolean> {
        try {
            // Get filters from storage using the same keys as the filter page
            const result = await chrome.storage.sync.get({
                titleFilterSettings: {
                    titles: [],
                    excludeTitles: [],
                },
            });

            const { titles: allowedWords, excludeTitles: blockedWords } =
                result.titleFilterSettings;
            console.log("Checking job title:", jobTitle, {
                allowedWords,
                blockedWords,
            });

            // Convert everything to lowercase for consistent comparison
            const title = jobTitle.toLowerCase();
            const allowedLower = allowedWords.map((word: string) =>
                word.toLowerCase()
            );
            const blockedLower = blockedWords.map((word: string) =>
                word.toLowerCase()
            );

            // First check if the title contains any blocked words
            const hasBlockedWord = blockedLower.some((word: string) =>
                title.includes(word)
            );
            if (hasBlockedWord) {
                console.log("Job title contains blocked word");
                return false;
            }

            // If there are no allowed words specified, accept all non-blocked titles
            if (allowedLower.length === 0) {
                console.log("No allowed words specified, accepting title");
                return true;
            }

            // Check if the title contains at least one allowed word
            const hasAllowedWord = allowedLower.some((word: string) =>
                title.includes(word)
            );
            console.log("Job title allowed:", hasAllowedWord);
            return hasAllowedWord;
        } catch (error) {
            console.error("Error checking job title filters:", error);
            return false; // Fail safe: reject the job if we can't check filters
        }
    }

    private async saveToHistory(jobInfo: JobInfo): Promise<void> {
        try {
            console.log("Starting to save job to history:", jobInfo);

            // Get existing history
            const result = await chrome.storage.sync.get({ jobHistory: [] });
            console.log("Current history:", result.jobHistory);
            const history: JobHistoryEntry[] = result.jobHistory;

            // Add new entry
            const newEntry: JobHistoryEntry = {
                title: jobInfo.title,
                link: jobInfo.link,
                appliedAt: Date.now(),
                platform: this.name,
            };
            console.log("Created new history entry:", newEntry);

            // Add to beginning of array and limit to last 100 entries
            history.unshift(newEntry);
            if (history.length > 100) {
                history.length = 100;
            }
            console.log("Updated history array:", history);

            // Save back to storage
            await chrome.storage.sync.set({ jobHistory: history });
            console.log("Successfully saved updated history to storage");
        } catch (error) {
            console.error("Error saving to job history:", error);
        }
    }

    private reloadPage(): void {
        console.log("Reloading page...");
        window.location.reload();
    }

    private isLastJobInList(): boolean {
        return this.currentJobIndex >= this.jobListings.length;
    }

    private async goToNextJobsPage(): Promise<boolean> {
        console.log("Attempting to go to next page of jobs...");

        // Find the next page button
        const paginationButtons = Array.from(
            document.querySelectorAll('button[aria-label*="Page"]')
        );
        const nextPageButton = paginationButtons.find(
            (button) =>
                button
                    .getAttribute("aria-label")
                    ?.toLowerCase()
                    .includes("next") ||
                button.textContent?.toLowerCase().includes("next")
        );

        if (!nextPageButton || nextPageButton.hasAttribute("disabled")) {
            console.log("No more pages of jobs available");
            return false;
        }

        console.log("Found next page button, clicking...");
        (nextPageButton as HTMLElement).click();

        // Wait for new page to load
        await this.sleep(2000);

        // Reset job index for new page
        this.currentJobIndex = 0;

        // Load new job listings
        const loaded = await this.loadJobListings();
        if (!loaded) {
            console.log("Failed to load jobs on new page");
            return false;
        }

        console.log(`Loaded ${this.jobListings.length} jobs from new page`);
        return true;
    }
}
