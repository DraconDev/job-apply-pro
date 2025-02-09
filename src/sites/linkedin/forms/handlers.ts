import { SavedFormInputs } from "../types";
import { findFormDivs, getQuestionLabel, isElementVisible } from "./domUtils";
import { ApplicationAnswer } from "@/types";

/**
 * Save the current state of form inputs to storage
 */
export async function saveFormInput() {
    try {
        console.log("=== Starting saveFormInput ===");

        const result = findFormDivs();
        if (!result) return;
        const { formDivs } = result;

        const allFormElements = new Set([...formDivs]);
        console.log(`Total unique form elements: ${allFormElements.size}`);

        const result2 = await chrome.storage.sync.get(["savedFormInputs"]);
        const savedFormInputs: SavedFormInputs = result2.savedFormInputs || {};
        console.log("Current saved form inputs:", Object.keys(savedFormInputs).length);

        let processedCount = 0;
        let skippedCount = 0;

        for (const element of allFormElements) {
            const inputElement = element.querySelector("input, select, textarea");

            if (!inputElement) {
                console.log("No input element found in div");
                skippedCount++;
                continue;
            }

            if (!isElementVisible(inputElement)) {
                console.log("Input element not visible");
                skippedCount++;
                continue;
            }

            const labelElement = (inputElement.id && document.querySelector(`label[for="${inputElement.id}"]`)) ||
                element.querySelector("label") ||
                Array.from(element.children).find(
                    (child) =>
                        child !== inputElement &&
                        child.textContent?.trim() &&
                        !child.querySelector("input, select, textarea")
                );

            const rawLabel = labelElement?.textContent?.trim();
            let label: string | undefined;

            if (rawLabel) {
                const parts = [rawLabel.slice(0, rawLabel.length / 2), rawLabel.slice(rawLabel.length / 2)]
                    .map((part) => part.trim());
                label = parts[0] === parts[1] ? parts[0] : rawLabel;
            }

            if (!label) {
                console.log("Skipping - no label found");
                skippedCount++;
                continue;
            }

            if (!(inputElement instanceof HTMLInputElement ||
                inputElement instanceof HTMLTextAreaElement ||
                inputElement instanceof HTMLSelectElement)) {
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

            const existingInput = savedFormInputs[label];
            if (!existingInput || existingInput.value !== value) {
                const inputType = inputElement instanceof HTMLSelectElement
                    ? "select"
                    : inputElement instanceof HTMLTextAreaElement
                        ? "textarea"
                        : inputElement.type;

                let options;
                if (inputElement instanceof HTMLSelectElement) {
                    options = Array.from(inputElement.options).map((option) => ({
                        value: option.value,
                        text: option.textContent?.trim() || option.value,
                    }));
                }

                savedFormInputs[label] = {
                    ...existingInput,
                    value,
                    type: inputType,
                    identifiers: [...new Set([...(existingInput?.identifiers || []), ...identifiers])],
                    lastUsed: Date.now(),
                    useCount: (existingInput?.useCount || 0) + 1,
                    ...(options && { options }),
                };
                processedCount++;

                console.log("Updated form input:", {
                    label,
                    value: value.slice(0, 20) + (value.length > 20 ? "..." : ""),
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

        await chrome.storage.sync.set({ savedFormInputs });
        console.log("=== Form Save Summary ===");
        console.log(`Total fields processed: ${processedCount}`);
        console.log(`Total fields skipped: ${skippedCount}`);
        console.log(`Total fields in storage: ${Object.keys(savedFormInputs).length}`);
        console.log("========================");
    } catch (error) {
        console.error("Error saving form input:", error);
    }
}

/**
 * Fill form inputs with saved values
 */
export async function fillFormInput(): Promise<boolean> {
    try {
        const result = findFormDivs();
        if (!result) return false;
        const { formDivs } = result;

        let success = false;
        for (const div of formDivs) {
            const element = div.querySelector("input, select, textarea") as
                | HTMLInputElement
                | HTMLTextAreaElement
                | HTMLSelectElement;

            if (!element || !isElementVisible(element)) continue;

            const identifiers = [
                element.id,
                (element as HTMLInputElement).name,
                element.getAttribute("aria-label"),
                element.getAttribute("placeholder"),
            ].filter(Boolean) as string[];

            if (identifiers.length === 0) continue;

            const result = await chrome.storage.sync.get(["savedFormInputs"]);
            const savedFormInputs: SavedFormInputs = result.savedFormInputs || {};

            const matchingInput = Object.values(savedFormInputs).find(
                (input) =>
                    input.identifiers.some((savedId) =>
                        identifiers.some((id) => savedId.toLowerCase() === id.toLowerCase())
                    )
            );

            if (!matchingInput) continue;

            if (element instanceof HTMLSelectElement) {
                const isValidOption = Array.from(element.options).some(
                    (option) => option.value === matchingInput.value
                );

                if (isValidOption) {
                    element.value = matchingInput.value;
                } else if (matchingInput.options) {
                    const savedOption = matchingInput.options.find((opt) =>
                        Array.from(element.options).some(
                            (currentOpt) =>
                                currentOpt.textContent?.trim().toLowerCase() ===
                                opt.text.toLowerCase()
                        )
                    );
                    if (savedOption) {
                        element.value = savedOption.value;
                    }
                }
            } else {
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

/**
 * Save a question and answer pair
 */
export async function saveAnswer(question: string, answer: string) {
    const newAnswer: ApplicationAnswer = {
        question,
        answer,
        timestamp: new Date().toISOString(),
    };

    try {
        const result = await chrome.storage.sync.get(["applicationAnswers"]);
        const answers: ApplicationAnswer[] = result.applicationAnswers || [];
        answers.push(newAnswer);
        const recentAnswers = answers.slice(-100);
        await chrome.storage.sync.set({ applicationAnswers: recentAnswers });
        console.log("Saved answer:", newAnswer);
    } catch (error) {
        console.error("Failed to save answer to sync storage:", error);
        const result = await chrome.storage.local.get(["applicationAnswers"]);
        const answers: ApplicationAnswer[] = result.applicationAnswers || [];
        answers.push(newAnswer);
        await chrome.storage.local.set({ applicationAnswers: answers });
    }
}

/**
 * Fill out a form field and save the answer
 */
export async function fillOutField(field: HTMLInputElement | HTMLTextAreaElement, value: string) {
    field.focus();
    field.value = value;
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));

    const label = field.getAttribute("aria-label") || field.placeholder || "Unknown field";
    await saveAnswer(label, value);
}
