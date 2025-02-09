/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Medium duration wait
 */
export async function midWait(): Promise<void> {
    console.log("Starting mid wait");
    return sleep(5000);
}

/**
 * Long duration wait
 */
export async function longWait(): Promise<void> {
    console.log("Starting long wait");
    await sleep(10000);
}

/**
 * Wait for an element to appear in the DOM
 */
export async function waitForElement(
    selector: string,
    timeout = 5000
): Promise<Element | null> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        const element = document.querySelector(selector);
        if (element) return element;
        await sleep(100);
    }
    return null;
}

/**
 * Load all job listings by scrolling
 */
export async function loadJobListings(): Promise<HTMLElement[]> {
    console.log("Loading job listings from search page");
    try {
        // Wait for the main content section to load
        await sleep(1000);

        const mainContent = document.querySelector("main");
        if (!mainContent) {
            console.log("Main content area not found");
            return [];
        }

        const jobList = mainContent.querySelector("ul");
        if (!jobList) {
            console.log("Job list (ul) not found in main content");
            return [];
        }

        let previousHeight = 0;
        let sameHeightCount = 0;
        const MAX_SAME_HEIGHT_ATTEMPTS = 1;
        let jobListings: HTMLElement[] = [];

        // Keep scrolling until we've hit the bottom
        while (true) {
            // Get all li elements
            const items = Array.from(jobList.children).filter(
                (element) => element.tagName.toLowerCase() === "li"
            ) as HTMLElement[];

            jobListings = items;
            console.log(`Found ${items.length} job items so far...`);

            // Scroll to load more
            window.scrollTo(0, document.body.scrollHeight);
            await sleep(1000);

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

        console.log(`Finished loading. Found total of ${jobListings.length} jobs`);

        // Scroll back to top
        window.scrollTo(0, 0);
        return jobListings;
    } catch (error) {
        console.error("Error loading job listings:", error);
        return [];
    }
}

/**
 * Navigate to the next page of job listings
 */
export async function goToNextJobsPage(): Promise<boolean> {
    console.log("=== Starting goToNextJobsPage ===");

    const paginationButtons = Array.from(document.querySelectorAll('button[aria-label*="Page "]'));
    console.log(`Found ${paginationButtons.length} pagination buttons`);

    // Log all pagination buttons for debugging
    paginationButtons.forEach((button, index) => {
        console.log("Pagination button:", {
            index,
            ariaLabel: button.getAttribute("aria-label"),
            text: button.textContent?.trim(),
            disabled: button.hasAttribute("disabled"),
            current: button.getAttribute("aria-current") === "true",
        });
    });

    // Find the current page button and get the next one
    const currentPageIndex = paginationButtons.findIndex(
        (button) => button.getAttribute("aria-current") === "true"
    );
    console.log("Current page index:", currentPageIndex);

    if (currentPageIndex === -1) {
        console.log("Could not find current page button");
        return false;
    }

    const nextPageButton = paginationButtons[currentPageIndex + 1];
    console.log("Next page button found:", {
        exists: !!nextPageButton,
        disabled: nextPageButton?.hasAttribute("disabled"),
        ariaLabel: nextPageButton?.getAttribute("aria-label"),
        text: nextPageButton?.textContent?.trim(),
    });

    if (!nextPageButton || nextPageButton.hasAttribute("disabled")) {
        console.log("No more pages of jobs available - ending pagination");
        return false;
    }

    console.log("Clicking next page button...");
    (nextPageButton as HTMLElement).click();

    // Wait for new page to load
    console.log("Waiting for page to load...");
    await sleep(15000);

    return true;
}
