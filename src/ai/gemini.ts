import { GoogleGenerativeAI } from "@google/generative-ai";
import { error } from "console";

export let genAI: GoogleGenerativeAI;
export let model: any;

export function initializeModel(apiKey: string) {
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });
}

export async function generateGeminiMessage(
  diff: string
): Promise<string | null> {
  try {


    if (!model) {
      const apiKey = getApiKey();
    }

    const result = await model.generateContent(prompt);

    // Validate API response structure
    if (!result || !result.response) {
      throw new Error("Empty response from Gemini API");
    }

    if (
      !result.response.candidates ||
      !result.response.candidates[0] ||
      !result.response.candidates[0].content ||
      !result.response.candidates[0].content.parts ||
      !result.response.candidates[0].content.parts[0] ||
      !result.response.candidates[0].content.parts[0].text
    ) {
      throw new Error("No candidates in response from Gemini API");
    }

    const response = result.response.candidates[0].content.parts[0].text;

    // Clean up the message - remove quotes and newlines
    const cleanMessage = response.replace(/["'\n\r]+/g, " ").trim();

    // Ensure it follows conventional commit format
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
