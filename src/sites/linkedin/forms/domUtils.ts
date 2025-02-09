/**
 * Check if an element is visible in the DOM
 */
export function isElementVisible(element: Element): boolean {
    const style = window.getComputedStyle(element);
    return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        style.opacity !== "0"
    );
}

/**
 * Find form divs and dialog element in the DOM
 */
export function findFormDivs(): { formDivs: Element[]; dialog: Element } | null {
    const dialog = document.querySelector('[role="dialog"]');
    console.log("Dialog element found:", !!dialog);

    if (!dialog) {
        console.log("No dialog found, checking document body:", {
            bodyContent: document.body.textContent?.slice(0, 100) + "...",
            dialogCount: document.querySelectorAll('[role="dialog"]').length,
            visibleInputs: document.querySelectorAll('input:not([type="hidden"]), select, textarea').length,
        });
        return null;
    }

    const allDivs = dialog.querySelectorAll("div");
    console.log(`Total divs found in dialog: ${allDivs.length}`);

    const formDivs = Array.from(allDivs).filter((div) => {
        const hasLabel = div.querySelector("label") !== null;
        const hasInput = div.querySelector("input, select, textarea") !== null;
        const isVisible = isElementVisible(div);

        if (hasLabel || hasInput) {
            console.log("Potential form div:", {
                hasLabel,
                hasInput,
                isVisible,
                labelText: div.querySelector("label")?.textContent?.trim(),
                inputType: div.querySelector("input, select, textarea")?.tagName,
                inputValue: (div.querySelector("input, select, textarea") as HTMLInputElement)?.value?.slice(0, 20),
            });
        }

        return hasLabel && hasInput;
    });

    console.log(`Found ${formDivs.length} form divs with label+input`);
    return { formDivs, dialog };
}

/**
 * Get all visible form elements within a dialog
 */
export function getVisibleFormElements(): Element[] {
    const dialog = document.querySelector('[role="dialog"]');
    console.log("Looking for dialog element:", dialog ? "Found" : "Not found");
    if (!dialog) return [];

    const allElements = dialog.querySelectorAll("input, select, textarea");
    console.log(`Found ${allElements.length} total form elements in dialog`);

    const visibleElements = Array.from(allElements).filter((element) => {
        const isVisible = isElementVisible(element);
        const elementInfo = {
            type: element instanceof HTMLInputElement ? element.type : element.tagName.toLowerCase(),
            id: element.id || "no-id",
            name: (element as HTMLInputElement).name || "no-name",
            "aria-label": element.getAttribute("aria-label") || "no-aria-label",
            visible: isVisible,
        };
        console.log("Form element info:", elementInfo);
        return isVisible;
    });

    console.log(`Found ${visibleElements.length} visible form elements out of ${allElements.length} total`);
    return visibleElements;
}

/**
 * Get the label text for a form question
 */
export function getQuestionLabel(element: Element): string {
    const formComponent = element.closest('[class*="form-component"]');
    console.log("Found form component:", formComponent?.className);

    if (formComponent) {
        console.log(
            "Form component children:",
            Array.from(formComponent.children).map((child) => ({
                tagName: child.tagName,
                className: child.className,
                textContent: child.textContent?.trim(),
                isInputElement: child === element,
            }))
        );

        const label = Array.from(formComponent.children)
            .find((child) => child !== element && child.textContent?.trim())
            ?.textContent?.trim();

        console.log("Found label:", label, "for element:", element.tagName, element.getAttribute("id"));
        if (label) return label;
    }

    const fallbackLabel = element.getAttribute("aria-label") ||
        element.getAttribute("placeholder") ||
        "Unknown Question";

    console.log("Using fallback label:", fallbackLabel);
    return fallbackLabel;
}

/**
 * Find the next button in a form
 */
export async function findNextButton(): Promise<HTMLElement | null> {
    console.log("Searching for next button...");
    const nextButtons = Array.from(document.querySelectorAll("button"));

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
