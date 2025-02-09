/**
 * Find any modal overlay element on the page
 */
export function findModalOverlay(): Element | null {
    const overlay = document.querySelector('.artdeco-modal-overlay');
    console.log("Modal overlay found:", !!overlay);
    return overlay;
}

/**
 * Send an Escape key event to close dialogs
 */
export async function pressEscape(): Promise<void> {
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
    await new Promise(resolve => setTimeout(resolve, 500));

    // Send to body
    document.body.dispatchEvent(escapeEvent);
    await new Promise(resolve => setTimeout(resolve, 500));
}

/**
 * Close any open modal dialogs
 */
export async function closeModal(): Promise<void> {
    console.log("Attempting to close modal...");

    // First try pressing Escape
    await pressEscape();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Wait a bit for any confirmation dialog
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Look for discard button in any confirmation dialog
    const discardButton = Array.from(document.querySelectorAll("button"))
        .find((button) => button.textContent?.toLowerCase().includes("discard"));

    if (discardButton) {
        console.log("Found discard button, clicking it");
        (discardButton as HTMLElement).click();
        await new Promise(resolve => setTimeout(resolve, 500));
    } else {
        console.log("No discard button found");
    }
}

/**
 * Cancel the current application process
 */
export async function cancelApplication(): Promise<void> {
    console.log("Canceling application process...");

    // Look for and click the dismiss button first
    const dismissButtons = Array.from(document.querySelectorAll("button"))
        .filter((button) =>
            button.textContent?.toLowerCase().includes("dismiss") ||
            button.getAttribute("aria-label")?.toLowerCase().includes("dismiss")
        );

    if (dismissButtons.length > 0) {
        console.log("Found dismiss button, clicking it...");
        (dismissButtons[0] as HTMLElement).click();
        await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
        console.log("No dismiss button found");
        return;
    }

    // Look for and click the discard button
    const discardButtons = Array.from(document.querySelectorAll("button"))
        .filter((button) =>
            button.textContent?.toLowerCase().includes("discard") ||
            button.getAttribute("aria-label")?.toLowerCase().includes("discard")
        );

    if (discardButtons.length > 0) {
        console.log("Found discard button, clicking it...");
        (discardButtons[0] as HTMLElement).click();
        await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
        console.log("No discard button found");
        return;
    }

    // Additional wait to ensure everything is cleared
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log("Application canceled successfully");
}

/**
 * Check if the application is complete by looking for completion messages
 */
export function isApplicationComplete(): boolean {
    console.log("Checking if application is complete...");

    const possibleElements = document.querySelectorAll(
        '[role="dialog"], [role="alertdialog"], .modal, .dialog'
    );
    console.log(`Found ${possibleElements.length} possible dialog/modal elements`);

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
