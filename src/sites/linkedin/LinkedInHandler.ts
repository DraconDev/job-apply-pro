import { ApplicationAnswer } from "@/components/ApplicationMenu";
import { JobDetails, JobSiteHandler } from "../../common/types";

export class LinkedInHandler implements JobSiteHandler {
    name = "LinkedIn";
    private isApplying = false;
    private isPaused = false;
    private currentJobIndex = 0;
    private jobListings: HTMLElement[] = [];

    setPause(paused: boolean): void {
        this.isPaused = paused;
        console.log(this.isPaused ? "Auto-apply paused" : "Auto-apply resumed");
    }

    togglePause(): void {
        this.isPaused = !this.isPaused;
        console.log(this.isPaused ? "Auto-apply paused" : "Auto-apply resumed");
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

    async autoApply(): Promise<boolean> {
        if (this.isApplying) {
            console.log("Already in the process of applying");
            return false;
        }

        this.isApplying = true;
        console.log("Starting auto-apply process");

        try {
            // If we're on the search page, load all job listings
            if (window.location.href.includes("/jobs/")) {
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
            const buttons = Array.from(document.querySelectorAll('button'));
            const easyApplyButton = buttons.find(button => 
                button.className.toLowerCase().includes('job') && 
                button.textContent?.toLowerCase().includes('easy apply')
            );

            if (!easyApplyButton) {
                console.log("No Easy Apply button found");
                this.isApplying = false;
                return false;
            }

            console.log("Found Easy Apply button, clicking...");
            (easyApplyButton as HTMLElement).click();
            await this.sleep(2000);

            // Wait for the application modal
            console.log("Waiting for application modal...");
            const applicationForm = await this.waitForElement(
                ".jobs-easy-apply-modal"
            );
            if (!applicationForm) {
                console.log("Application form not found after timeout");
                this.isApplying = false;
                return false;
            }
            console.log("Application modal found, starting form fill");

            // Process each step of the application
            let stepCount = 0;
            while (!this.isPaused) {
                stepCount++;
                console.log(`Processing step ${stepCount}...`);
                await this.sleep(1000); // Wait for form to load

                // Check if we're done
                const modalContent = document.querySelector(
                    ".artdeco-modal__content"
                );
                if (
                    modalContent?.textContent
                        ?.toLowerCase()
                        .includes("application sent")
                ) {
                    console.log(
                        "Success message found - application submitted successfully"
                    );
                    await this.closeModal();
                    this.isApplying = false;
                    return true;
                }

                // Fill current step
                console.log(`Filling out fields in step ${stepCount}...`);
                await this.fillCurrentStep();

                if (this.isPaused) {
                    console.log("Auto-apply paused during form fill, stopping");
                    this.isApplying = false;
                    return false;
                }

                // Click the next/submit button
                console.log("Looking for next/submit button...");
                const nextButton = await this.findNextButton();
                if (!nextButton) {
                    console.log(`No next button found on step ${stepCount}`);
                    this.isApplying = false;
                    return false;
                }
                console.log(
                    `Found next button on step ${stepCount}, clicking...`
                );
                nextButton.click();

                // Add a check for potential error messages
                await this.sleep(500);
                const errorMessages = document.querySelectorAll(
                    ".artdeco-inline-feedback--error"
                );
                if (errorMessages.length > 0) {
                    console.log(
                        "Found error messages:",
                        Array.from(errorMessages).map((el) => el.textContent)
                    );
                }

                if (this.isPaused) {
                    console.log(
                        "Auto-apply paused after clicking next, stopping"
                    );
                    this.isApplying = false;
                    return false;
                }
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

    private async loadJobListings(): Promise<boolean> {
        console.log("Loading job listings from search page");
        try {
            // Wait for the main content section to load
            await this.sleep(2000); // Give the page time to load

            // Find the main job list by structure - it's the only ul in the main content area
            const mainContent = document.querySelector("main");
            if (!mainContent) {
                console.log("Main content area not found");
                return false;
            }

            // Find the first ul element in the main content
            const jobList = mainContent.querySelector("ul");
            if (!jobList) {
                console.log("Job list (ul) not found in main content");
                return false;
            }

            // Get all direct li children
            const allJobItems = Array.from(jobList.children).filter(
                (element) => element.tagName.toLowerCase() === "li"
            ) as HTMLElement[];

            console.log(`Found ${allJobItems.length} total job items`);

            this.jobListings = allJobItems;

            console.log(
                `Found ${this.jobListings.length} Easy Apply job listings`
            );

            if (this.jobListings.length === 0) {
                console.log("No Easy Apply job listings found");
                return false;
            }

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
            await this.sleep(500);

            // Click the job title link
            if (titleElement) {
                titleElement.click();
                await this.sleep(1500); // Wait longer for job details to load
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
                console.log("Processing input:", {
                    type: input.tagName,
                    name: input instanceof HTMLInputElement ? input.name : "",
                    id: input.id,
                    visible: this.isElementVisible(input),
                });

                if (!this.isElementVisible(input)) {
                    console.log("Skipping invisible input");
                    continue;
                }

                if (input instanceof HTMLSelectElement) {
                    await this.handleSelect(input);
                } else if (input instanceof HTMLInputElement) {
                    await this.handleInput(input);
                } else if (input instanceof HTMLTextAreaElement) {
                    await this.handleTextArea(input);
                }
            } catch (error) {
                console.error("Error handling input:", error);
            }
        }
        console.log("Finished filling current step");
    }

    private isElementVisible(element: Element): boolean {
        const style = window.getComputedStyle(element);
        return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.opacity !== "0"
        );
    }

    private async handleInput(input: HTMLInputElement): Promise<void> {
        const type = input.type.toLowerCase();
        const name = input.name.toLowerCase();
        console.log("Handling input:", { type, name });

        switch (type) {
            case "text":
                if (name.includes("phone")) {
                    input.value = "+1234567890"; // Replace with actual phone
                    console.log("Filled phone number");
                } else if (name.includes("name")) {
                    input.value = "John Doe"; // Replace with actual name
                    console.log("Filled name");
                }
                break;
            case "email":
                input.value = "email@example.com"; // Replace with actual email
                console.log("Filled email");
                break;
            case "number":
                if (name.includes("year")) {
                    input.value = "3"; // Years of experience
                    console.log("Filled years of experience");
                }
                break;
            case "radio":
                if (
                    name.includes("yes") ||
                    input.value.toLowerCase().includes("yes")
                ) {
                    input.checked = true;
                    console.log("Selected 'yes' radio option");
                }
                break;
        }

        input.dispatchEvent(new Event("change", { bubbles: true }));
    }

    private async handleSelect(select: HTMLSelectElement): Promise<void> {
        console.log("Handling select:", {
            name: select.name,
            options: select.options.length,
        });

        // Select the first non-empty option
        const options = Array.from(select.options);
        const validOption = options.find((opt) => opt.value && !opt.disabled);
        if (validOption) {
            select.value = validOption.value;
            select.dispatchEvent(new Event("change", { bubbles: true }));
            console.log("Selected option:", validOption.value);
        } else {
            console.log("No valid options found for select");
        }
    }

    private async handleTextArea(textarea: HTMLTextAreaElement): Promise<void> {
        console.log("Handling textarea:", {
            name: textarea.name,
            id: textarea.id,
        });

        // Add a generic response for text areas
        textarea.value =
            "I am highly interested in this position and believe my skills and experience make me a strong candidate.";
        textarea.dispatchEvent(new Event("change", { bubbles: true }));
        console.log("Filled textarea with generic response");
    }

    async findNextButton(): Promise<HTMLElement | null> {
        console.log("Searching for next button...");
        const nextButtons = Array.from(document.querySelectorAll("button"));
        const buttonTexts = nextButtons.map((b) =>
            b.textContent?.toLowerCase()
        );
        console.log("Found buttons with texts:", buttonTexts);

        const nextButton = nextButtons.find(
            (button) =>
                button.textContent?.toLowerCase().includes("next") ||
                button.textContent?.toLowerCase().includes("submit") ||
                button.textContent?.toLowerCase().includes("review")
        ) as HTMLElement;

        if (nextButton) {
            console.log("Found next button with text:", nextButton.textContent);
        } else {
            console.log("No next button found");
        }

        return nextButton || null;
    }

    private async closeModal(): Promise<void> {
        const closeButton = document.querySelector(".artdeco-modal__dismiss");
        if (closeButton instanceof HTMLElement) {
            closeButton.click();
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
}
