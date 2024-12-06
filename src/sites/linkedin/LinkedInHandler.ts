import { ApplicationAnswer } from "@/components/ApplicationMenu";
import { JobDetails, JobSiteHandler } from "../../common/types";

export class LinkedInHandler implements JobSiteHandler {
    name = "LinkedIn";
    private isApplying = false;

    isValidJobPage(): boolean {
        const url = window.location.href;
        const isJobsUrl = url.includes("linkedin.com/jobs/");

        if (!isJobsUrl) {
            return false; // Not on LinkedIn jobs at all
        }

        // If we're not on a search page but on jobs URL, we're on an individual job page
        return true;
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
        if (this.isApplying) return false;
        this.isApplying = true;

        try {
            // Click the apply button
            const applyButton = await this.waitForElement(".jobs-apply-button");
            if (!applyButton) {
                console.log("No apply button found");
                return false;
            }
            (applyButton as HTMLElement).click();

            // Wait for the application modal
            const applicationForm = await this.waitForElement(
                ".jobs-easy-apply-modal"
            );
            if (!applicationForm) {
                console.log("Application form not found");
                return false;
            }

            // Process each step of the application
            while (true) {
                await this.sleep(1000); // Wait for form to load

                // Check if we're done
                const successMessage = document.querySelector(
                    '.artdeco-modal__content:contains("Application sent")'
                );
                if (successMessage) {
                    console.log("Application submitted successfully");
                    await this.closeModal();
                    return true;
                }

                // Fill current step
                await this.fillCurrentStep();

                // Click the next/submit button
                const nextButton = await this.findNextButton();
                if (!nextButton) {
                    console.log("No next button found");
                    return false;
                }
                nextButton.click();
            }
        } catch (error) {
            console.error("Error during auto-apply:", error);
            return false;
        } finally {
            this.isApplying = false;
        }
    }

    private async fillCurrentStep(): Promise<void> {
        const formInputs = document.querySelectorAll("input, select, textarea");

        for (const input of formInputs) {
            if (input instanceof HTMLSelectElement) {
                await this.handleSelect(input);
            } else if (input instanceof HTMLInputElement) {
                await this.handleInput(input);
            } else if (input instanceof HTMLTextAreaElement) {
                await this.handleTextArea(input);
            }
        }
    }

    private async handleInput(input: HTMLInputElement): Promise<void> {
        const type = input.type.toLowerCase();
        const name = input.name.toLowerCase();

        switch (type) {
            case "text":
                if (name.includes("phone")) {
                    input.value = "+1234567890"; // Replace with actual phone
                } else if (name.includes("name")) {
                    input.value = "John Doe"; // Replace with actual name
                }
                break;
            case "email":
                input.value = "email@example.com"; // Replace with actual email
                break;
            case "number":
                if (name.includes("year")) {
                    input.value = "3"; // Years of experience
                }
                break;
            case "radio":
                if (
                    name.includes("yes") ||
                    input.value.toLowerCase().includes("yes")
                ) {
                    input.checked = true;
                }
                break;
        }

        input.dispatchEvent(new Event("change", { bubbles: true }));
    }

    private async handleSelect(select: HTMLSelectElement): Promise<void> {
        // Select the first non-empty option
        const options = Array.from(select.options);
        const validOption = options.find((opt) => opt.value && !opt.disabled);
        if (validOption) {
            select.value = validOption.value;
            select.dispatchEvent(new Event("change", { bubbles: true }));
        }
    }

    private async handleTextArea(textarea: HTMLTextAreaElement): Promise<void> {
        // Add a generic response for text areas
        textarea.value =
            "I am highly interested in this position and believe my skills and experience make me a strong candidate.";
        textarea.dispatchEvent(new Event("change", { bubbles: true }));
    }

    async findNextButton(): Promise<HTMLElement | null> {
        const nextButtons = Array.from(document.querySelectorAll("button"));
        return (
            (nextButtons.find(
                (button) =>
                    button.textContent?.toLowerCase().includes("next") ||
                    button.textContent?.toLowerCase().includes("submit") ||
                    button.textContent?.toLowerCase().includes("review")
            ) as HTMLElement) || null
        );
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
}
