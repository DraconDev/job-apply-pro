import { GoogleGenerativeAI } from "@google/generative-ai";

export let genAI: GoogleGenerativeAI;
export let model: any;

export function initializeModel(apiKey: string) {
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });
}

export async function generateGeminiMessage(
  element: HTMLElement,
  apiKey: string
): Promise<string | null> {
  try {
    if (!model) {
      initializeModel(apiKey);
    }

    const prompt = `
      Analyze this HTML element and generate a description of what it represents in terms of a job application field:
      
      ${element.outerHTML}
      
      Consider the element's:
      1. Type (input, select, textarea)
      2. Label or placeholder text
      3. Any associated aria labels
      4. Parent element context
      5. Surrounding text nodes
      
      Return a clear, concise description of what information this field is asking for.
    `;

    const result = await model.generateContent(prompt);

    // Validate API response structure
    if (!result || !result.response) {
      throw new Error("Empty response from Gemini API");
    }

    if (
      !result.response.candidates ||
      !result.response.candidates[0] ||
      !result.response.candidates[0].content ||
    if (!cleanMessage.match(/^[a-z]+(\([a-z-]+\))?: .+/)) {
      const changedFiles = [
        ...status.modified,
        ...status.not_added,
        ...status.deleted,
      ];
      const timestamp = new Date().toISOString().split("T")[1].slice(0, 5);
      return `feat: update ${changedFiles.length} files (${changedFiles
        .slice(0, 3)
        .join(", ")}) at ${timestamp}`;
    }

    return cleanMessage;
  } catch (error: any) {
    console.error("Error generating commit message:", {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      errorType: error.constructor.name,
    });
    vscode.window.showErrorMessage(
      `Failed to generate commit message: ${error.message}`
    );
    return null;
  }
}
