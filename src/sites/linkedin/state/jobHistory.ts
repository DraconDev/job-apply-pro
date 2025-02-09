import { JobHistoryEntry, JobInfo } from "../types";

/**
 * Save a job application to history
 */
export async function saveToHistory(jobInfo: JobInfo, platformName: string): Promise<void> {
    try {
        console.log("Starting to save job to history:", jobInfo);

        const result = await chrome.storage.sync.get({ jobHistory: [] });
        console.log("Current history:", result.jobHistory);
        const history: JobHistoryEntry[] = result.jobHistory;

        const newEntry: JobHistoryEntry = {
            title: jobInfo.title,
            link: jobInfo.link,
            appliedAt: Date.now(),
            platform: platformName,
        };
        console.log("Created new history entry:", newEntry);

        // Add to beginning of array and limit to last 100 entries
        history.unshift(newEntry);
        if (history.length > 100) {
            history.length = 100;
        }
        console.log("Updated history array:", history);

        await chrome.storage.sync.set({ jobHistory: history });
        console.log("Successfully saved updated history to storage");
    } catch (error) {
        console.error("Error saving to job history:", error);
    }
}

/**
 * Get job information from the current page
 */
export async function getJobInfo(): Promise<JobInfo> {
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
            link: linkElement.href || linkElement.getAttribute("href") || "",
        };

        console.log("Found job info:", jobInfo);
        return jobInfo;
    } catch (error) {
        console.error("Error getting job info:", error);
        return { title: "", link: "" };
    }
}

/**
 * Check if a job has already been applied to
 */
export function isJobAlreadyApplied(): boolean {
    // Areas to check for "Applied" text
    const containersToCheck = [
        ".jobs-unified-top-card",
        ".jobs-s-apply",
        ".jobs-apply-button", 
        ".jobs-s-apply__application-status",
    ];

    for (const selector of containersToCheck) {
        const element = document.querySelector(selector);
        if (element?.textContent?.toLowerCase().includes("applied")) {
            console.log(`Found 'Applied' text in ${selector} - job was already applied to`);
            return true;
        }
    }

    return false;
}

/**
 * Check if the job title is allowed based on filters
 */
export async function isJobTitleAllowed(jobTitle: string): Promise<boolean> {
    try {
        // Get filters from storage using the same keys as the filter page
        const result = await chrome.storage.sync.get({
            titleFilterSettings: {
                titles: [],
                excludeTitles: [],
            },
        });

        const { titles: allowedWords, excludeTitles: blockedWords } = result.titleFilterSettings;
        console.log("Checking job title:", jobTitle, { allowedWords, blockedWords });

        const title = jobTitle.toLowerCase();
        const allowedLower = allowedWords.map((word: string) => word.toLowerCase());
        const blockedLower = blockedWords.map((word: string) => word.toLowerCase());

        // First check if the title contains any blocked words
        const hasBlockedWord = blockedLower.some((word: string) => title.includes(word));
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
        const hasAllowedWord = allowedLower.some((word: string) => title.includes(word));
        console.log("Job title allowed:", hasAllowedWord);
        return hasAllowedWord;
    } catch (error) {
        console.error("Error checking job title filters:", error);
        return false; // Fail safe: reject the job if we can't check filters
    }
}
