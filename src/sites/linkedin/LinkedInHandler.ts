import { ApplicationAnswer } from "@/types";
import { JobDetails, JobSiteHandler } from "../../common/types";

export class LinkedInHandler implements JobSiteHandler {
    name = "LinkedIn";
    isApplying = false;
    isPaused = false;
    private currentJobIndex = 0;
    private jobListings: HTMLElement[] = [];
    currentStepIndex = 0;
    private readonly MAX_STEPS = 10;

    setPause(paused: boolean): void {
        this.isPaused = paused;
        console.log(this.isPaused ? "Auto-apply paused" : "Auto-apply resumed");

        // If we're unpausing, continue the application process
        if (!paused && this.isApplying) {
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
        console.log("Handling submit button click...");

        // First click the submit button
        button.click();
        await this.sleep(2000); // Initial wait after click

        // Check for any error messages that might appear
        if (this.hasErrors()) {
            console.log("Found errors after submit click");
            await this.handleValidationErrors();
        }

        // Wait longer for submission to complete
        await this.sleep(8000); // Increased to 10 seconds
        console.log("Finished waiting after submission");

        // Update jobs applied counter in sync storage
        try {
            const result = await chrome.storage.sync.get(["jobsApplied"]);
            const currentCount = result.jobsApplied || 0;
            const newCount = currentCount + 1;
            await chrome.storage.sync.set({
                jobsApplied: newCount,
            });
            console.log(`Incremented jobs applied counter to ${newCount}`);

            // Also store the job details
            const jobDetails = this.getJobDetails();
            if (jobDetails) {
                const applications = await chrome.storage.sync.get([
                    "applications",
                ]);
                const currentApps = applications.applications || [];
                currentApps.push({
                    ...jobDetails,
                    appliedAt: new Date().toISOString(),
                });
                await chrome.storage.sync.set({ applications: currentApps });
            }
        } catch (error) {
            console.error("Failed to update application data:", error);
        }

        await this.longWait();
        const doneButtons =
            document.querySelectorAll<HTMLButtonElement>("button");
        const doneButton = Array.from(doneButtons).find(
            (button) =>
                button.textContent?.toLowerCase().includes("done") ||
                button.textContent?.toLowerCase().includes("finish")
        );
        if (doneButton) {
            console.log("Found done button, clicking it");
            doneButton.click();
        } else {
            console.log("No done button found");
        }

        await this.longWait();

        // Reset for next job
        this.currentStepIndex = 0;
        this.isApplying = false;

        // Start next job application
        console.log("Starting next job application...");
        if (window.location.href.includes("/jobs/")) {
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
        console.log(`Processing step ${stepCount}/${this.MAX_STEPS}...`);
        await this.sleep(1000);

        const submitButton = await this.waitForElement(
            `button[type="submit"], 
             button[aria-label*="submit" i]`,
            5000
        );
        if (submitButton) {
            console.log("Found submit button, clicking it...");
            await this.handleSubmitButton(submitButton as HTMLElement, false);
            return true; // Only return true when we've actually submitted
        }

        // First try to proceed without filling anything
        console.log("Attempting to proceed without filling fields...");
        const nextButton = await this.findNextButton();

        if (nextButton) {
            console.log("Found next button, clicking it...");
            (nextButton as HTMLElement).click();
            await this.sleep(2000);
            return false; // Continue to next step, don't mark as complete
        }

        // Check for any validation errors or required fields
        if (this.hasErrors()) {
            return await this.handleValidationErrors();
        }

        return false;
    }

    async autoApply(): Promise<boolean> {
        try {
            if (this.isApplying) {
                console.log("Already applying, please wait...");
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
                await this.sleep(1500);
            }

            // Check if already applied to current job
            if (this.isJobAlreadyApplied()) {
                console.log("Skipping job - already applied");
                this.isApplying = false;
                return false;
            }

            // Click the apply button
            console.log("Looking for Easy Apply button...");

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

            console.log("Found Easy Apply button, clicking...");
            (easyApplyButton as HTMLElement).click();
            await this.sleep(2000);

            // Process each step of the application
            let stepCount = 0;
            while (true) {
                if (this.isPaused) {
                    console.log("Paused");
                    await this.sleep(1000);
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
                const result = await this.processApplicationStep(stepCount);
            }

            console.log("Auto-apply paused, stopping application process");
            this.isApplying = false;
            return false;
        } catch (error) {
            console.error("Error during auto-apply:", error);
            this.isApplying = false;
            return false;
        }
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
            await this.sleep(3000);

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
            const MAX_SAME_HEIGHT_ATTEMPTS = 3;

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

            console.log(`Finished loading. Found total of ${this.jobListings.length} jobs`);

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
        const formInputs = document.querySelectorAll("input, select, textarea");
        console.log(`Found ${formInputs.length} form inputs`);

        for (const input of formInputs) {
            try {
                // Type assertion to HTMLElement
                await this.saveFormInput(
                    input as
                        | HTMLInputElement
                        | HTMLTextAreaElement
                        | HTMLSelectElement
                );
                await this.fillFormInput(
                    input as
                        | HTMLInputElement
                        | HTMLTextAreaElement
                        | HTMLSelectElement
                );
            } catch (error) {
                console.error("Error handling input:", error);
            }
        }
        console.log("Finished filling current step");
    }

    async saveFormInput(
        element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    ) {
        try {
            // Get identifiers from the element
            const identifiers = [
                element.id,
                element.name,
                element.getAttribute("aria-label"),
                element.getAttribute("placeholder"),
            ].filter(Boolean) as string[];

            if (identifiers.length === 0) return;

            // Get element value and type
            const value = element.value;
            const type = element.tagName.toLowerCase();

            // Create a unique key from identifiers
            const key = identifiers.join("|");

            // Get existing form inputs
            const result = await chrome.storage.sync.get(["savedFormInputs"]);
            const savedFormInputs: SavedFormInputs =
                result.savedFormInputs || {};

            // Update or create form input
            savedFormInputs[key] = {
                value,
                type,
                identifiers,
                lastUsed: Date.now(),
                useCount: (savedFormInputs[key]?.useCount || 0) + 1,
            };

            // Save back to storage
            await chrome.storage.sync.set({ savedFormInputs });
        } catch (error) {
            console.error("Failed to save form input:", error);
        }
    }

    async fillFormInput(
        element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    ): Promise<boolean> {
        try {
            // Get identifiers from the element
            const identifiers = [
                element.id,
                element.name,
                element.getAttribute("aria-label"),
                element.getAttribute("placeholder"),
            ].filter(Boolean) as string[];

            if (identifiers.length === 0) return false;

            // Get saved form inputs
            const result = await chrome.storage.sync.get(["savedFormInputs"]);
            const savedFormInputs: SavedFormInputs =
                result.savedFormInputs || {};

            // Find a matching input
            const matchingInput = Object.values(savedFormInputs).find((input) =>
                input.identifiers.some((savedId) =>
                    identifiers.some(
                        (id) => savedId.toLowerCase() === id.toLowerCase()
                    )
                )
            );

            if (!matchingInput) return false;

            // Fill the value
            if (
                element instanceof HTMLInputElement ||
                element instanceof HTMLTextAreaElement ||
                element instanceof HTMLSelectElement
            ) {
                element.value = matchingInput.value;
                element.dispatchEvent(new Event("input", { bubbles: true }));
                element.dispatchEvent(new Event("change", { bubbles: true }));
                return true;
            }

            return false;
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

    async findNextButton(): Promise<HTMLElement | null> {
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
        const allElements = document.querySelectorAll(
            "input, select, textarea"
        );
        return Array.from(allElements).filter((element) => {
            return this.isElementVisible(element);
        });
    }

    // Reset the job index when starting a new search
    resetJobIndex(): void {
        this.currentJobIndex = 0;
        this.jobListings = [];
    }

    private async continueApplication(): Promise<void> {
        try {
            console.log("Attempting to continue application...");

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
                await this.sleep(2000);

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
                const errorMessages = document.querySelectorAll(
                    ".artdeco-inline-feedback--error"
                );
                if (errorMessages.length > 0) {
                    console.log(
                        `Found ${errorMessages.length} error messages in step ${stepCount}:`,
                        Array.from(errorMessages).map((el) => el.textContent)
                    );
                } else {
                    console.log(`No error messages found in step ${stepCount}`);
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

        // First cancel any open dialogs/forms
        await this.cancelApplication();
        await this.midWait();

        // Reset state and move to next job
        this.currentStepIndex = 0;
        this.isApplying = false;
        this.currentJobIndex++;

        // If we're on the jobs page, start the next application
        if (window.location.href.includes("/jobs/")) {
            console.log("Starting next job application...");
            await this.autoApply();
        } else {
            // If we're on a single job page, go back to the jobs list
            console.log("Not on jobs page, navigating back...");
            window.history.back();
            await this.sleep(2000);
        }
    }

    private async cancelApplication(): Promise<void> {
        console.log("Canceling application process...");

        // Try to close any open dialogs
        await this.pressEscape();
        await this.sleep(1000);

        // Try again to ensure modals are closed
        await this.pressEscape();

        this.isApplying = false;
        this.currentStepIndex = 0;
        console.log("Application canceled");
        await this.midWait();
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
}

interface SavedFormInputs {
    [key: string]: {
        value: string;
        type: string;
        identifiers: string[];
        lastUsed: number;
        useCount: number;
    };
}
