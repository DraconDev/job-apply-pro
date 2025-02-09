import { JobDetails, JobSiteHandler } from "@/src/common/types";
import { autoApply } from "./jobs/autoApply";
import { isJobAlreadyApplied } from "./state/jobHistory";

/**
 * Handler for LinkedIn job applications
 */
const LinkedInHandler: JobSiteHandler = {
    name: "LinkedIn",

    isValidJobPage(): boolean {
        const url = window.location.href;
        return url.includes("linkedin.com/jobs/");
    },

    getJobDetails(): JobDetails | null {
        if (!this.isValidJobPage()) return null;

        const title = document.querySelector(".jobs-unified-top-card__job-title")?.textContent?.trim() || "";
        const company = document.querySelector(".jobs-unified-top-card__company-name")?.textContent?.trim() || "";
        const location = document.querySelector(".jobs-unified-top-card__bullet")?.textContent?.trim();

        return {
            title,
            company,
            location,
            url: window.location.href,
        };
    },

    async applyToJob(): Promise<boolean> {
        const applyButton = document.querySelector(".jobs-apply-button") as HTMLButtonElement;
        if (!applyButton || !this.isValidJobPage()) return false;

        try {
            if (isJobAlreadyApplied()) {
                console.log("Job was already applied to");
                return false;
            }

            applyButton.click();
            return autoApply();
        } catch (error) {
            console.error("Failed to apply:", error);
            return false;
        }
    }
};

export default LinkedInHandler;
